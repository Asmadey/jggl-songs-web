(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const catalog = window.JGGL_CATALOG?.assets || [];
  const categoryNames = {popular:'Popular',all:'All trends',pets:'Animals',dance:'Dance',action:'Action',fashion:'Fashion',music:'Music',cinema:'Movies',couples:'Couples',meme:'Memes',other:'More'};
  const categoryEnglish = {dance:'DANCE',cinema:'MOVIES',meme:'MEME / FORMAT',pets:'ANIMALS',action:'ACTION',fashion:'FASHION',music:'MUSIC',couples:'COUPLES',other:'VIDEO TREND'};
  const matchesCategory = item => category==='all'||(category==='popular'?item.popular:item.category===category);
  const byId = new Map(catalog.map(item => [item.id,item]));
  const grid = $('#video-grid');
  const preview = $('#preview-dialog');
  const previewVideo = $('#preview-video');
  const jgglWebUrl = 'https://web.jggl.ai';
  let category = 'popular', current = null;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let autoPlay = !motionPreference.matches;
  const visibleVideos = new Set();
  const media = [];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const spark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></svg>';

  // Local-only events: no external analytics, photos, or filenames are transmitted.
  const events = [];
  const track = (name,id) => { const event={name,templateId:id,time:Date.now()};events.push(event);window.dispatchEvent(new CustomEvent('jggl:trend-event',{detail:event})); };
  window.JGGL_DEMO_EVENTS = events;

  const loadPoster = video => {
    if(!video.getAttribute('poster')) video.poster=video.dataset.poster || 'assets/jggl-mark.svg';
  };
  const loadVideo = video => {
    loadPoster(video);
    if(!video.getAttribute('src') && video.dataset.src) { video.src=video.dataset.src;video.load(); }
  };
  const playVideo = video => { loadVideo(video);video.play().catch(()=>{}); };
  const syncPlayback = () => {
    const enabled = autoPlay && !document.hidden && !preview.open;
    let playing = 0;
    media.forEach(video => {
      if(enabled && visibleVideos.has(video) && playing < 6 && !video.closest('[hidden]')) { playing++;playVideo(video); }
      else video.pause();
    });
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => {
      if(isIntersecting) {
        loadPoster(target);
        visibleVideos.add(target);
      } else visibleVideos.delete(target);
    });syncPlayback();
  },{threshold:.12});
  const observe = video => {
    video.muted=true;media.push(video);observer.observe(video);
    video.addEventListener('loadedmetadata',()=>{
      const label=video.closest('.media-button')?.querySelector('.duration');
      if(label && Number.isFinite(video.duration)) {
        const seconds=Math.ceil(video.duration);
        label.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
      }
    });
    video.addEventListener('error',()=>{const card=video.closest('.media-button');if(card)card.dataset.failed='true';});
  };

  Object.entries(categoryNames).forEach(([key,label])=>{
    const count=key==='all'?catalog.length:catalog.filter(item=>key==='popular'?item.popular:item.category===key).length;
    const button=document.createElement('button');button.className='filter';button.type='button';button.dataset.category=key;button.setAttribute('aria-pressed',String(key===category));
    button.innerHTML=escapeHTML(label)+` <small>${count}</small>`;
    button.addEventListener('click',()=>{category=key;filter();});$('.filters').append(button);
  });

  catalog.forEach((item,index)=>{
    const article=document.createElement('article');article.className='video-card';article.dataset.id=item.id;article.dataset.category=item.category;
    article.innerHTML=`<button type="button" class="media-button" aria-label="Watch ${escapeHTML(item.name)}"><video muted playsinline loop preload="none" ${item.posterUrl?`data-poster="${escapeHTML(item.posterUrl)}"`:''} data-src="${escapeHTML(item.videoUrl)}" aria-hidden="true"></video><span class="card-index">${String(index+1).padStart(3,'0')}</span>${item.popular?'<span class="trend-badge">POPULAR</span>':''}<span class="duration">VIDEO</span><span class="card-play" aria-hidden="true">▶</span><span class="media-failure">Video unavailable · open preview</span></button><div class="card-info"><div class="card-meta"><span class="card-category">${categoryEnglish[item.category]||'VIDEO TREND'}</span></div><h3 title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</h3><p class="card-subtitle">${escapeHTML(item.subtitle)}</p><button type="button" class="use-button" aria-label="Use template: ${escapeHTML(item.name)}">${spark} Use template</button></div>`;
    article.querySelector('.media-button').addEventListener('click',()=>openPreview(item));
    article.querySelector('.use-button').addEventListener('click',()=>openJggl(item));
    grid.append(article);observe(article.querySelector('video'));
  });

  ['social-4694','social-4632','social-ozhivi-svoe-litso-v-meme-iz-filma-vershina-v-kling-ai-motion-control-2026'].forEach(id=>{
    const item=byId.get(id);if(!item)return;
    const button=document.createElement('button');button.type='button';button.className='hero-reel';button.setAttribute('aria-label','Watch '+item.name);
    button.innerHTML=`<video muted loop playsinline preload="none" poster="${escapeHTML(item.posterUrl)}" data-src="${escapeHTML(item.videoUrl)}" aria-hidden="true"></video><span class="hero-reel-play" aria-hidden="true">▶</span><span class="hero-reel-label"><small>${categoryEnglish[item.category]}</small>${escapeHTML(item.name)}</span>`;
    button.addEventListener('click',()=>openPreview(item));$('#hero-stage').append(button);observe(button.querySelector('video'));
  });
  $('#result-count').textContent=`${catalog.length} trends`;
  $('#catalog-total').textContent=catalog.length;

  function filter(){
    let count=0;
    [...grid.children].forEach(card=>{
      const item=byId.get(card.dataset.id);
      card.hidden=!matchesCategory(item);
      if(!card.hidden)count++;
    });
    $('.filters').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
    $('#result-count').textContent=`Showing ${count} of ${catalog.length}`;$('#empty').hidden=count!==0;syncPlayback();
  }
  $('#reset').addEventListener('click',()=>{category='all';filter();});
  motionPreference.addEventListener('change',event=>{autoPlay=!event.matches;syncPlayback();});
  document.addEventListener('visibilitychange',()=>{syncPlayback();if(document.hidden)previewVideo.pause();});

  function openPreview(item){
    current=item;$('#preview-title').textContent=item.name;$('#preview-category').textContent=categoryNames[item.category]+' / '+item.title;
    $('#preview-description').textContent=item.description;
    $('#preview-failure').hidden=true;previewVideo.poster=item.posterUrl;previewVideo.src=item.videoUrl;previewVideo.muted=false;
    preview.showModal();syncPlayback();previewVideo.play().catch(()=>{});track('preview_open',item.id);
  }
  previewVideo.addEventListener('error',()=>{$('#preview-failure').hidden=false;});
  function closeDialog(dialog){dialog.close();}
  preview.addEventListener('close',()=>{previewVideo.pause();previewVideo.removeAttribute('src');previewVideo.load();syncPlayback();});
  document.querySelectorAll('[data-close="preview"]').forEach(button=>button.addEventListener('click',()=>closeDialog(preview)));
  preview.addEventListener('click',event=>{const r=preview.getBoundingClientRect();if(event.target===preview&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))preview.close();});
  $('#preview-use').addEventListener('click',()=>openJggl(current));

  function openJggl(item){
    track('template_select',item.id);
    window.open(jgglWebUrl,'_blank','noopener,noreferrer');
  }
  filter();
})();
