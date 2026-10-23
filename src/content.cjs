// Copy shared by every hypothesis page. Each string is {en, ru}. English is the source of truth.
const L = (en, ru) => ({ en, ru });
// Real tracks (6 genres x 5), imported by scripts/import-tracks.cjs. Covers live in public/covers/ at 459x459.
const tracksData = require('../data/tracks.json');

const nav = [
  { href: '#songs', label: L('Hear songs', 'Послушать песни') },
  { href: '#how', label: L('How it works', 'Как это работает') }
];

const common = {
  ctaDefault: L('Hear my song', 'Услышать свою песню'),
  caption: L('First song free', 'Первая песня бесплатно'),
  captionSub: L('No music skills needed', 'Музыкальные навыки не нужны'),
  genresLine: L("Gospel · Country · Folk · Ballads · Rock'n'roll · and more", 'Госпел · Кантри · Фолк · Баллады · Рок-н-ролл · и другое'),
  skip: L('Skip to songs', 'К песням'),
  example: L('Example', 'Пример'),
  examplePlaceholder: L('Example · placeholder sample', 'Пример · временный образец'),
  placeholderNote: L('This is a placeholder sound. A real recording will replace it.', 'Это временный звук. Позже здесь будет настоящая запись.'),
  makeLikeThis: L('Make one like this', 'Сделать такую же'),
  close: L('Close', 'Закрыть'),
  play: L('Play', 'Играть'),
  pause: L('Pause', 'Пауза'),
  instrumental: L('Instrumental, no words', 'Без слов'),
  footerLine: L('Your idea deserves its moment.', 'Твоя идея заслуживает своего момента.'),
  langLabel: L('Language', 'Язык')
};

// Placeholder songs. Replace `audio`/`cover` with real files when the recordings exist.
const songs = [
  {
    id: 'grandma80', tags: ['family', 'celebrations'], genre: 'country', hue: 28,
    title: L("For Grandma's 80th", 'К 80-летию бабушки'),
    genreLabel: L('Country', 'Кантри'),
    lyric: L("Eighty summers on this land,\nA fiddle, a quilt, a steady hand.\nEvery one of us found our way\nBack to your table, back to your day.",
             'Восемьдесят лет на этой земле,\nСкрипка, лоскутное одеяло, твёрдая рука.\nКаждый из нас находил дорогу\nК твоему столу, в твой день.')
  },
  {
    id: 'psalm', tags: ['faith'], genre: 'gospel', hue: 38,
    title: L('Psalm 23, my way', 'Псалом 23 по-моему'),
    genreLabel: L('Gospel', 'Госпел'),
    lyric: L("When the valley runs long and the night runs deep,\nYou're the shepherd who watches over my sleep.\nI will not fear, I have walked this road,\nAnd You have carried every load.",
             'Когда долина длинна, а ночь глубока,\nТы — пастырь, что стережёт мой сон.\nЯ не боюсь, я прошёл этой дорогой,\nИ Ты нёс каждую ношу.')
  },
  {
    id: 'forty', tags: ['family', 'celebrations'], genre: 'ballad', hue: 8,
    title: L('Forty years, one dance', 'Сорок лет, один танец'),
    genreLabel: L('Ballad', 'Баллада'),
    lyric: L("Forty years of Sunday mornings,\nCoffee cold and the radio on.\nYou still take my hand in the kitchen\nWhen they play our song.",
             'Сорок лет воскресных утр,\nХолодный кофе и радио.\nТы всё так же берёшь меня за руку на кухне,\nКогда играет наша песня.')
  },
  {
    id: 'porch', tags: ['memories'], genre: 'folk', hue: 52,
    title: L('The porch where we sang', 'Крыльцо, где мы пели'),
    genreLabel: L('Folk', 'Фолк'),
    lyric: L("Screen door slams and the summer's long,\nGrandpa's guitar and a half-learned song.\nWe never knew we were making a place\nThat we'd hold for good in a single face.",
             'Хлопает дверь, и лето длинное,\nГитара деда и недоученная песня.\nМы не знали, что строим место,\nКоторое навсегда останется в одном лице.')
  },
  {
    id: 'route9', tags: ['memories'], genre: 'rock', hue: 350,
    title: L("Route 9, summer of '74", 'Шоссе 9, лето 74-го'),
    genreLabel: L("Rock'n'roll", 'Рок-н-ролл'),
    lyric: L("Windows down on Route 9,\nA borrowed Chevy and a heart on fire.\nThe radio knew every word we meant\nAnd none of the ones we said.",
             'Окна вниз, шоссе 9,\nЧужой Шевроле и сердце в огне.\nРадио знало каждое слово, что мы имели в виду,\nИ ни одного из тех, что мы сказали.')
  },
  {
    id: 'pastor', tags: ['faith', 'celebrations'], genre: 'gospel', hue: 20,
    title: L('Thank you, Pastor Dave', 'Спасибо, пастор Дейв'),
    genreLabel: L('Gospel', 'Госпел'),
    lyric: L("Thirty years you stood up front,\nYou carried more than you ever said.\nWe came in tired, we left in tune,\nSo this one's yours, from all of us.",
             'Тридцать лет вы стояли впереди,\nВы несли больше, чем говорили.\nМы приходили усталыми, уходили в лад,\nТак что эта песня — ваша, от всех нас.')
  },
  {
    id: 'neversaid', tags: ['me'], genre: 'acoustic', hue: 205,
    title: L('Words I never said', 'Слова, которые я не сказал'),
    genreLabel: L('Acoustic', 'Акустика'),
    lyric: L("I kept it in a notebook,\nFolded twice and put away.\nSome things are only brave enough\nTo be sung and not to say.",
             'Я хранил это в блокноте,\nСложенном вдвое и убранном.\nНекоторые слова хватает смелости\nТолько спеть, а не сказать.')
  },
  {
    id: 'album', tags: ['memories', 'instrumental'], genre: 'piano', hue: 270, instrumental: true,
    title: L('Our family album', 'Наш семейный альбом'),
    genreLabel: L('Gentle piano', 'Нежное фортепиано'),
    lyric: L('A slow piano melody to sit under a photo slideshow.', 'Неспешная мелодия фортепиано под слайд-шоу из фотографий.')
  },
  {
    id: 'tribute', tags: ['memories', 'instrumental'], genre: 'strings', hue: 230, instrumental: true,
    title: L('A tribute in strings', 'Память в струнных'),
    genreLabel: L('Cinematic strings', 'Кинематографичные струнные'),
    lyric: L('Warm strings for a tribute or memorial video.', 'Тёплые струнные для видео-посвящения или памяти.')
  }
];


// Product benefits shown on the "Your Voice" page instead of the pain -> answer block. Images were generated with Codex.
const features = [
  {
    id: 'voices', img: '/img/features/voices.webp',
    title: L('Record own voice', 'Запиши свой голос'),
    text: L('Talk for a moment to record your voice, and JGGL sings the track in it.', 'Немного поговори, чтобы записать голос, и JGGL споёт трек твоим голосом.')
  },
  {
    id: 'cover', img: '/img/features/cover.webp',
    title: L('Artwork Generation', 'Генерация обложки'),
    text: L('Every track you create comes with its own cover, ready to share.', 'К каждому созданному треку ты сразу получаешь обложку, и им можно делиться.')
  },
  {
    id: 'remix', img: '/img/features/remix.webp',
    title: L('Make remixes', 'Создавай ремиксы'),
    text: L('Turn any track you made into new versions: another style, a fresh take.', 'Превращай любой свой трек в новые версии: другой стиль, свежее звучание.')
  }
];

const chips = [
  { id: 'all', label: L('All', 'Все') },
  { id: 'family', label: L('For family', 'Для семьи') },
  { id: 'faith', label: L('Faith & worship', 'Вера и богослужение') },
  { id: 'memories', label: L('Memories', 'Воспоминания') },
  { id: 'celebrations', label: L('Celebrations', 'Праздники') },
  { id: 'me', label: L('Just for me', 'Для себя') },
  { id: 'instrumental', label: L('Instrumental', 'Без слов') }
];

// Pain -> answer pool. Each hypothesis picks three.
const pains = {
  voice: { pain: L("The AI voice doesn't sound like me", 'Голос ИИ не похож на мой'), answer: L('Your own voice, tuned to sing your song.', 'Твой собственный голос, который поёт твою песню.') },
  edit: { pain: L('Change one line and the whole melody is gone', 'Меняешь одну строчку — и мелодия пропала'), answer: L('Edit a line, keep the tune.', 'Меняй строчку, мелодия остаётся.') },
  redo: { pain: L('Credits burned on bad takes', 'Кредиты сгорают на неудачных версиях'), answer: L('Wrong genre or a glitchy voice? Redo it free.', 'Не тот жанр или голос со сбоями? Переделаем бесплатно.') },
  prompt: { pain: L('I end up in ChatGPT, writing prompts', 'Я пишу промпты в ChatGPT и теряюсь'), answer: L('No prompts. Pick a style, tell your story. We do the rest.', 'Никаких промптов. Выбери стиль, расскажи историю. Остальное сделаем мы.') },
  billing: { pain: L("Subscriptions I can't figure out, and no answer from support", 'Непонятные подписки и поддержка, которая молчит'), answer: L('One clear price, cancel anytime, and a real person replies.', 'Понятная цена, отмена в любой момент, отвечает живой человек.') },
  church: { pain: L('Will my church think this is cheating?', 'Не сочтёт ли моя церковь это обманом?'), answer: L('The words and the faith are yours. We bring the music.', 'Слова и вера — твои. Музыку приносим мы.') },
  share: { pain: L('How do I even share it on Facebook?', 'Как вообще поделиться этим в Facebook?'), answer: L('A link family can play, and a video version for Facebook.', 'Ссылка, которую семья откроет без установки, и видеоверсия для Facebook.') }
};

const benefits = [
  L('A finished song in your own voice', 'Готовая песня твоим голосом'),
  L('Keep the melody while you edit the words', 'Мелодия остаётся, пока правишь слова'),
  L('Free redo on bad takes', 'Бесплатная переделка неудачных версий'),
  L('MP3 straight to your phone', 'MP3 прямо на телефон'),
  L('A link family can play without installing anything', 'Ссылка, которую семья слушает без установки'),
  L('A video version for Facebook', 'Видеоверсия для Facebook')
];

const steps = [
  { title: L('Tell your story or paste your lyrics', 'Расскажи историю или вставь слова'), text: L("No lyrics? Answer three questions and we'll write them with you.", 'Нет слов? Ответь на три вопроса, и мы напишем их вместе с тобой.') },
  { title: L('Record 30 seconds of your voice', 'Запиши 30 секунд своего голоса'), text: L('Just talk or hum. No studio needed.', 'Просто говори или напевай. Студия не нужна.') },
  { title: L('Listen, tweak, share', 'Послушай, поправь, поделись'), text: L('Change a line, pick another style, send it to family.', 'Поменяй строчку, выбери другой стиль, отправь семье.') }
];

const trust = [
  { title: L('Real people answer', 'Отвечают живые люди'), text: L('Write to support and a person replies.', 'Напиши в поддержку, и тебе ответит человек.') },
  { title: L('Your voice stays yours', 'Твой голос остаётся твоим'), text: L('Used only for your songs. Delete it anytime.', 'Используется только для твоих песен. Удали в любой момент.') }
];

const faq = [
  { q: L('Do I need music skills?', 'Нужны ли музыкальные навыки?'), a: L('No. If you can write a few lines or tell a story, you can make a song.', 'Нет. Если можешь написать пару строк или рассказать историю, ты сможешь сделать песню.') },
  { q: L('Will it really sound like me?', 'Правда ли это будет звучать как я?'), a: L('You record 30 seconds of your voice and we tune it to sing your song. Listen to a sample before you decide anything.', 'Ты записываешь 30 секунд голоса, и мы настраиваем его, чтобы он пел твою песню. Послушай образец, прежде чем что-то решать.') },
  { q: L('Is it okay to share at church or on Facebook?', 'Можно ли делиться этим в церкви или в Facebook?'), a: L('Sharing with family, church and friends needs nothing extra. If you plan to release on streaming services, check each distributor\'s policy on AI-made music first, because the rules differ and change.', 'Делиться с семьёй, церковью и друзьями можно без дополнительных шагов. Если планируешь выпуск на стриминговых сервисах, сначала проверь правила дистрибьютора про музыку с ИИ: они разные и меняются.') },
  { q: L('What does it cost?', 'Сколько это стоит?'), a: L('Your first song is free.', 'Первая песня бесплатна.') },
  { q: L('Is my voice safe?', 'В безопасности ли мой голос?'), a: L('Your voice is used only to make your songs, and you can delete it anytime.', 'Твой голос используется только для твоих песен, и ты можешь удалить его в любой момент.') },
  { q: L('Can I change the words later?', 'Можно ли потом поменять слова?'), a: L('Yes. Edit a line and we keep the tune, so you are not starting over.', 'Да. Поменяй строчку, и мелодия останется, начинать с нуля не придётся.') }
];

const ui = {
  songsEyebrow: L('EXAMPLES OF WHAT YOU CAN MAKE', 'ПРИМЕРЫ ТОГО, ЧТО МОЖНО СОЗДАТЬ'),
  songsTitle: L('From a notebook to a song.', 'Из блокнота — в песню.'),
  songsNote: L('Example songs, made by the JGGL team. Real recordings are coming.', 'Примеры от команды JGGL. Настоящие записи появятся позже.'),
  painEyebrow: L('WHY IT IS HARD TODAY', 'ПОЧЕМУ СЕЙЧАС ЭТО ТРУДНО'),
  painTitle: L('Most AI music tools make you fight them.', 'Большинство ИИ-сервисов приходится «уговаривать».'),
  painLead: L('Most AI music tools…', 'Большинство ИИ-сервисов…'),
  painAnswer: L('With JGGL', 'С JGGL'),
  howEyebrow: L('FROM A VERSE TO A SONG', 'ОТ КУПЛЕТА ДО ПЕСНИ'),
  howTitle: L('Three steps. <span>Your song is ready.</span>', 'Три шага. <span>Песня готова.</span>'),
  getEyebrow: L('WHAT YOU GET', 'ЧТО ТЫ ПОЛУЧАЕШЬ'),
  getTitle: L('Everything to finish and share it.', 'Всё, чтобы закончить песню и поделиться ею.'),
  trustEyebrow: L('YOU CAN RELY ON US', 'НА НАС МОЖНО ПОЛОЖИТЬСЯ'),
  faqEyebrow: L('QUESTIONS', 'ВОПРОСЫ'),
  faqTitle: L('Before you start.', 'Прежде чем начать.'),
  featuresEyebrow: L('WHY JGGL', 'ПОЧЕМУ JGGL'),
  featuresTitle: L('Your song, your voice, your cover.', 'Твоя песня, твой голос, твоя обложка.'),
  tracksEyebrow: L('TRACKS MADE ON JGGL', 'ТРЕКИ, СОЗДАННЫЕ В JGGL'),
  tracksNote: L('Pick a genre and listen. Tracks play right here.', 'Выбери жанр и послушай. Треки играют прямо здесь.'),
  plays: L('Plays', 'Прослушивания'),
  likes: L('Likes', 'Лайки'),
  scrollPrev: L('Previous tracks', 'Предыдущие треки'),
  scrollNext: L('Next tracks', 'Следующие треки'),
  genresLabel: L('Genres', 'Жанры'),
  playTrack: L('Play', 'Играть'),
  seek: L('Seek', 'Перемотка'),
  appText: L('Get the JGGL app and turn your words into a song anywhere.', 'Установи приложение JGGL и превращай слова в песню где угодно.'),
  storeIosSmall: L('Download on the', 'Загрузить в'),
  storeAndroidSmall: L('Get it on', 'Доступно в'),
  verseCopied: L('We copied your verse. Paste it on the next screen.', 'Мы скопировали твой куплет. Вставь его на следующем экране.'),
  pickOne: L('Pick one', 'Выбери'),
  hubTitle: L('Songs landing: hypotheses', 'Лендинг для песен: гипотезы')
};

module.exports = { L, nav, common, songs, chips, pains, features, tracksData, benefits, steps, trust, faq, ui };
