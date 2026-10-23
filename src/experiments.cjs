// One entry per hypothesis. Each gets its own hero; the rest of the page is shared (see content.cjs).
// hero.mode: 'button' | 'verse' (paste a verse) | 'chips' (pick one option, then CTA)
const { L } = require('./content.cjs');

module.exports = [
  {
    slug: 'your-voice',
    // English only on this page: no RU strings, no language switcher.
    languages: ['en'],
    hypothesis: L(
      'When I have words or an occasion (family, faith, a memory), I want to hear a finished song, ideally in my own voice, and show it to people close to me, so I feel heard.',
      'Когда у меня есть слова или повод (семья, вера, воспоминание), я хочу услышать готовую песню, лучше своим голосом, и показать её близким, чтобы почувствовать, что меня услышали.'),
    audience: L('Authors 35+, write lyrics, family/church-oriented', 'Авторы 35+, пишут тексты, связаны с семьёй и церковью'),
    metric: L('hero_cta_click rate, lyrics_paste share, sample_play', 'доля hero_cta_click, доля lyrics_paste, sample_play'),
    hero: {
      eyebrow: L('YOUR WORDS. YOUR VOICE.', 'ТВОИ СЛОВА. ТВОЙ ГОЛОС.'),
      title: L('Your lyrics, sung in <span>your own voice</span>', 'Твои стихи — песней, <span>твоим голосом</span>'),
      sub: L("Bring the words you've carried for years. Record 30 seconds of your voice, and JGGL turns them into a finished song.",
             'Принеси слова, которые носишь годами. Запиши 30 секунд голоса, и JGGL превратит их в готовую песню.'),
      mode: 'verse',
      verseLabel: L('Paste a verse or a few lines', 'Вставь куплет или пару строк'),
      versePlaceholder: L('Paste a verse here…', 'Вставь куплет сюда…'),
      cta: L('Hear my song', 'Услышать свою песню'),
      // 'genre:index' picks a real track (data/tracks.json); the cards are square covers.
      // left, centre (the big one), right
      cards: ['pop:0', 'rock:0', 'jazz:0'],
      // Typed headline: only the highlighted part is deleted and retyped, like on suno.com.
      rotate: [
        L('your own voice', 'твоим голосом'),
        L('a jazz groove', 'в ритме джаза'),
        L('a Latin rhythm', 'в латино-ритме'),
        L('a rock beat', 'в стиле рок'),
        L('a pop melody', 'как поп-хит')
      ],
      sticker: L('Sung in your own voice', 'Поёт твой голос'),
      stickerIcon: 'sing',
      hideCaption: true, // no "First song free / No music skills needed" next to the button
      hideBottom: true, // no genre line with the play icon under the form on this page
      footnote: null
    },
    // 'tracks' = real tracks in a genre slider; 'features' = product benefits instead of the pain -> answer block.
    catalog: 'tracks',
    features: true,
    stepsVisual: true, // animated step cards instead of the plain three-column list
    // Closing block: app download buttons (as on suno.com) with a few covers around the panel.
    // Extra header tab: "Examples" jumps to the "From a notebook to a song." tracks section.
    extraNav: [{ href: '#songs', label: L('Examples', 'Примеры') }],
    finalApp: true,
    finalCovers: ['pop:1', 'latino:0', 'rap:0', 'rnb:0'],
    hideSections: ['get', 'faq', 'trust'], // "What you get" and the FAQ are not shown on this page
    pains: ['voice', 'edit', 'redo'],
    steps: null,
    catalogDefault: 'pop',
    finalTitle: L('Your song has waited long enough.', 'Твоя песня ждала достаточно долго.'),
    finalCta: L('Hear my song', 'Услышать свою песню')
  },
  {
    slug: 'memory-melody',
    hypothesis: L(
      'When I want music for a greeting or a memory video (photo album, slideshow), I want a melody made for that material, so the video feels finished.',
      'Когда мне нужна музыка для поздравления или видео воспоминаний (фотоальбом, слайд-шоу), я хочу мелодию под этот материал, чтобы видео выглядело законченным.'),
    audience: L('Adults 35+ who make photo/memory videos and greetings', 'Взрослые 35+, делающие видео из фото и поздравления'),
    metric: L('style_select rate, hero_cta_click rate, sample_play on instrumental', 'доля style_select, доля hero_cta_click, sample_play на инструментальных'),
    hero: {
      eyebrow: L('MUSIC FOR YOUR MEMORIES', 'МУЗЫКА ДЛЯ ТВОИХ ВОСПОМИНАНИЙ'),
      title: L('The melody your <span>memory video</span> is missing', 'Мелодия, которой не хватает <span>твоему видео воспоминаний</span>'),
      sub: L('Pick a mood and tell us what the video is for. JGGL composes a melody you can download and put under your photo album, slideshow or birthday greeting.',
             'Выбери настроение и расскажи, для чего видео. JGGL сочинит мелодию, которую можно скачать и поставить под фотоальбом, слайд-шоу или поздравление.'),
      mode: 'chips',
      chipsLabel: L("What's the mood?", 'Какое настроение?'),
      options: [
        { id: 'gentle-piano', label: L('Gentle piano', 'Нежное фортепиано') },
        { id: 'warm-acoustic', label: L('Warm acoustic', 'Тёплая акустика') },
        { id: 'cinematic-strings', label: L('Cinematic strings', 'Кинематографичные струнные') },
        { id: 'old-time-swing', label: L('Old-time swing', 'Старый свинг') }
      ],
      cta: L('Make my melody', 'Создать мою мелодию'),
      cards: ['album', 'tribute', 'porch'],
      sticker: L('Music only, no words needed', 'Только музыка, слова не нужны'),
      footnote: null
    },
    pains: ['prompt', 'share', 'billing'],
    steps: [
      { title: L('Pick the mood', 'Выбери настроение'), text: L('Gentle piano, warm acoustic, strings. Or describe it in your own words.', 'Нежное фортепиано, тёплая акустика, струнные. Или опиши своими словами.') },
      { title: L('Say what it is for', 'Скажи, для чего это'), text: L('A 40th anniversary album, a memorial slideshow, a birthday greeting.', 'Альбом к 40-летию свадьбы, слайд-шоу памяти, поздравление с днём рождения.') },
      { title: L('Download and drop it in', 'Скачай и поставь в видео'), text: L('Add the melody to any photo-album or video app you already use.', 'Добавь мелодию в любое приложение для фотоальбомов или видео, которым уже пользуешься.') }
    ],
    catalogDefault: 'instrumental',
    finalTitle: L('Your memories deserve their own music.', 'Твои воспоминания заслуживают своей музыки.'),
    finalCta: L('Make my melody', 'Создать мою мелодию')
  },
  {
    slug: 'finish-my-song',
    hypothesis: L(
      'When I have written lyrics but cannot arrange or mix them, I want someone to finish the song in a style I pick, without writing prompts.',
      'Когда у меня есть написанные слова, но я не умею аранжировать и сводить, я хочу, чтобы песню доделали в выбранном стиле без написания промптов.'),
    audience: L('Hobby songwriters 35+, no production skills', 'Авторы-любители 35+ без навыков продакшна'),
    metric: L('style_select rate, hero_cta_click rate, lyrics_paste', 'доля style_select, доля hero_cta_click, lyrics_paste'),
    hero: {
      eyebrow: L('YOU WROTE THE WORDS', 'ТЫ НАПИСАЛ СЛОВА'),
      title: L('You wrote the words. <span>We finish the song.</span>', 'Ты написал слова. <span>Песню мы доделаем.</span>'),
      sub: L('No studio, no mixing, no prompt-writing. Pick a style and JGGL turns your lyrics into a full song you can edit line by line.',
             'Без студии, сведения и промптов. Выбери стиль, и JGGL превратит твои слова в полноценную песню, которую можно править строчка за строчкой.'),
      mode: 'chips',
      chipsLabel: L('Pick a style', 'Выбери стиль'),
      options: [
        { id: 'country', label: L('Country', 'Кантри') },
        { id: 'gospel', label: L('Gospel', 'Госпел') },
        { id: 'folk', label: L('Folk', 'Фолк') },
        { id: 'ballad', label: L('Ballad', 'Баллада') },
        { id: 'rock', label: L("Rock'n'roll", 'Рок-н-ролл') }
      ],
      cta: L('Finish my song', 'Доделать мою песню'),
      cards: ['porch', 'route9', 'neversaid'],
      sticker: L('No prompts needed', 'Промпты не нужны'),
      footnote: null
    },
    pains: ['prompt', 'edit', 'redo'],
    steps: null,
    catalogDefault: 'all',
    finalTitle: L('Your lyrics have waited long enough.', 'Твои слова ждали достаточно долго.'),
    finalCta: L('Finish my song', 'Доделать мою песню')
  },
  {
    slug: 'worship-songs',
    hypothesis: L(
      'When I want to put my psalm or testimony into a song, I want the music without feeling that the faith is not mine, so I can share it with my church family.',
      'Когда я хочу превратить свой псалом или свидетельство в песню, мне нужна музыка, при этом вера должна остаться моей, чтобы поделиться с церковной семьёй.'),
    audience: L('Church-connected adults 35+, concerned about AI stigma', 'Взрослые 35+, связанные с церковью, опасаются стигмы вокруг ИИ'),
    metric: L('hero_cta_click rate, faq_open (church/share), sample_play on gospel', 'доля hero_cta_click, faq_open (церковь/поделиться), sample_play на госпел'),
    hero: {
      eyebrow: L('WORDS OF FAITH', 'СЛОВА ВЕРЫ'),
      title: L('Your psalm, <span>your voice,</span> your song', 'Твой псалом, <span>твой голос,</span> твоя песня'),
      sub: L('The words and the faith are yours. JGGL brings the music in the style of your worship and sings it in your own voice, ready to share with your church family.',
             'Слова и вера — твои. JGGL приносит музыку в стиле твоего богослужения и поёт её твоим голосом, чтобы поделиться с церковной семьёй.'),
      mode: 'button',
      cta: L('Hear my song', 'Услышать свою песню'),
      cards: ['psalm', 'pastor', 'porch'],
      sticker: L('Words by you. Music by JGGL.', 'Слова твои. Музыка от JGGL.'),
      footnote: L('Hymns · Gospel · Worship · Folk · Ballads', 'Гимны · Госпел · Прославление · Фолк · Баллады')
    },
    pains: ['church', 'voice', 'share'],
    steps: null,
    catalogDefault: 'faith',
    finalTitle: L('Your psalm deserves to be heard.', 'Твой псалом заслуживает быть услышанным.'),
    finalCta: L('Hear my song', 'Услышать свою песню')
  },
  {
    slug: 'gift-song',
    hypothesis: L(
      'When a birthday, anniversary or thank-you is coming, I want to give a song built from our story, so the gift feels personal and is remembered.',
      'Когда приближается день рождения, юбилей или слова благодарности, я хочу подарить песню, построенную на нашей истории, чтобы подарок был личным и запомнился.'),
    audience: L('Adults 35+ choosing a gift for a parent, spouse, pastor, friend', 'Взрослые 35+, выбирающие подарок родителю, супругу, пастору, другу'),
    metric: L('occasion select rate, hero_cta_click rate, make_like_this_click', 'доля выбора повода, доля hero_cta_click, make_like_this_click'),
    hero: {
      eyebrow: L('A GIFT THEY WILL KEEP', 'ПОДАРОК НА ПАМЯТЬ'),
      title: L('Give them a song <span>with their story in it</span>', 'Подари песню, <span>в которой их история</span>'),
      sub: L('An 80th birthday, a 40th anniversary, a thank-you. Tell us the story and JGGL turns it into a song you can play at the party or send in a message.',
             '80 лет, 40 лет свадьбы, слова благодарности. Расскажи историю, и JGGL превратит её в песню, которую можно включить на празднике или отправить сообщением.'),
      mode: 'chips',
      chipsLabel: L("What's the occasion?", 'Какой повод?'),
      options: [
        { id: '80th-birthday', label: L('80th birthday', '80-летие') },
        { id: 'anniversary', label: L('Anniversary', 'Годовщина') },
        { id: 'wedding', label: L('Wedding', 'Свадьба') },
        { id: 'thank-you', label: L('Thank you', 'Благодарность') },
        { id: 'in-memory', label: L('In memory', 'Памяти') }
      ],
      cta: L('Make their song', 'Создать их песню'),
      cards: ['grandma80', 'forty', 'pastor'],
      sticker: L('Made for one special person', 'Сделано для одного особенного человека'),
      footnote: L('Play it at the party · Send it in a message', 'Включи на празднике · Отправь сообщением')
    },
    pains: ['share', 'redo', 'billing'],
    steps: null,
    catalogDefault: 'celebrations',
    finalTitle: L('Make the gift they will play again and again.', 'Подари то, что будут слушать снова и снова.'),
    finalCta: L('Make their song', 'Создать их песню')
  }
];
