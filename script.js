// Letter & Number Recognition Game
//
// The game says a letter or number out loud with the Web Speech API (so no
// audio files are needed) and the child taps the matching tile.
//
// All speech goes through `speech.run()`, which guarantees that only ONE
// spoken sequence is active at a time: starting a new one (or calling
// `speech.interrupt()`) cancels whatever is playing and makes the old
// sequence stop at its next step. That is what keeps quick repeated taps
// from producing overlapping, garbled speech.

'use strict';

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const lettersMap = {
  A: ['apple', 'ant', 'airplane'],
  B: ['ball', 'banana', 'butterfly'],
  C: ['cat', 'car', 'cup'],
  D: ['dog', 'duck', 'door'],
  E: ['elephant', 'egg', 'engine'],
  F: ['fish', 'flower', 'fork'],
  G: ['goat', 'grape', 'guitar'],
  H: ['hat', 'horse', 'house'],
  I: ['ice', 'igloo', 'insect'],
  J: ['juice', 'jelly', 'jacket'],
  K: ['kite', 'key', 'kangaroo'],
  L: ['lion', 'lamp', 'leaf'],
  M: ['moon', 'mouse', 'milk'],
  N: ['nose', 'nest', 'nap'],
  O: ['orange', 'owl', 'octopus'],
  P: ['pig', 'pen', 'piano'],
  Q: ['queen', 'quilt', 'quail'],
  R: ['rabbit', 'rain', 'ring'],
  S: ['sun', 'snake', 'sock'],
  T: ['tiger', 'tree', 'towel'],
  U: ['umbrella', 'unicorn', 'up'],
  V: ['violin', 'van', 'vase'],
  W: ['whale', 'watch', 'water'],
  X: ['xylophone', 'x-ray'],
  Y: ['yacht', 'yogurt', 'yak'],
  Z: ['zebra', 'zoo', 'zipper'],
};

const numbersMap = {
  '1': ['one sun', 'one nose', 'one moon'],
  '2': ['two eyes', 'two hands', 'two feet'],
  '3': ['three bears', 'three little pigs', 'three sides on a triangle'],
  '4': ['four wheels on a car', 'four legs on a dog', 'four seasons'],
  '5': ['five fingers', 'five toes', 'five points on a star'],
  '6': ['six legs on an insect', 'six sides on a dice', 'six strings on a guitar'],
  '7': ['seven days in a week', 'seven colors of the rainbow', 'seven dwarfs'],
  '8': ['eight legs on a spider', 'eight arms on an octopus', 'eight sides on a stop sign'],
  '9': ['nine lives of a cat', 'nine innings in baseball', 'nine squares in tic-tac-toe'],
  '10': ['ten fingers', 'ten toes', 'ten bowling pins'],
  '11': ['eleven players on a soccer team', 'ten and one more'],
  '12': ['twelve months in a year', 'twelve eggs in a carton', 'twelve numbers on a clock'],
  '13': ['thirteen stripes on the American flag', "a baker's dozen", 'ten and three more'],
  '14': ['fourteen days in two weeks', "Valentine's Day on February fourteenth", 'ten and four more'],
  '15': ['fifteen minutes in a quarter hour', 'ten and five more'],
  '16': ['sixteen ounces in a pound', 'ten and six more'],
  '17': ['ten and seven more', 'three less than twenty'],
  '18': ['eighteen holes of golf', 'eighteen wheels on a big truck', 'ten and eight more'],
  '19': ['ten and nine more', 'one less than twenty'],
  '20': ['twenty fingers and toes', 'two tens'],
};

// Sight words in the order Heggerty "Bridge to Reading" teaches them in
// kindergarten (it calls them "Red Words"). `week` is the week the word is
// introduced. The order and unit split come from a district scope & sequence
// for Bridge to Reading (Falmouth Public Schools, 2024); weeks 5-9, 16, 17,
// 19/20, 23, 24, 26 and 27 are confirmed by the Texas IMRA review of the
// program, the rest assume ~2 words per week. The sentences are our own.
const SIGHT_WORDS = [
  // Unit 2
  { word: 'the',   week: 5,  sentence: 'I see the dog.' },
  { word: 'a',     week: 5,  sentence: 'I have a red ball.' },
  { word: 'I',     week: 6,  sentence: 'I like to play.' },
  { word: 'see',   week: 6,  sentence: 'I can see the moon.' },
  { word: 'is',    week: 7,  sentence: 'The sun is hot.' },
  { word: 'was',   week: 7,  sentence: 'The cake was yummy.' },
  { word: 'and',   week: 8,  sentence: 'I like cats and dogs.' },
  { word: 'look',  week: 8,  sentence: 'Look at the bird!' },
  { word: 'to',    week: 9,  sentence: 'We go to the park.' },
  { word: 'do',    week: 9,  sentence: 'What do you like?' },
  { word: 'for',   week: 10, sentence: 'This gift is for you.' },
  { word: 'or',    week: 10, sentence: 'Do you want milk or juice?' },
  { word: 'you',   week: 11, sentence: 'I love you.' },
  { word: 'of',    week: 11, sentence: 'I want a cup of milk.' },
  // Unit 3
  { word: 'come',  week: 12, sentence: 'Come and play with me.' },
  { word: 'some',  week: 12, sentence: 'Can I have some cake?' },
  { word: 'play',  week: 13, sentence: "Let's play outside." },
  { word: 'my',    week: 13, sentence: 'This is my hat.' },
  { word: 'by',    week: 14, sentence: 'The cat sat by the door.' },
  { word: 'help',  week: 14, sentence: 'Can you help me?' },
  { word: 'her',   week: 15, sentence: 'That is her bike.' },
  { word: 'had',   week: 15, sentence: 'I had a fun day.' },
  { word: 'on',    week: 16, sentence: 'The cup is on the table.' },
  { word: 'not',   week: 16, sentence: 'The dog is not wet.' },
  { word: 'got',   week: 16, sentence: 'I got a new book.' },
  { word: 'go',    week: 17, sentence: "Let's go home." },
  { word: 'no',    week: 17, sentence: 'No, thank you.' },
  { word: 'so',    week: 17, sentence: 'I am so happy!' },
  { word: 'like',  week: 17, sentence: 'I like apples.' },
  { word: 'we',    week: 18, sentence: 'We are friends.' },
  { word: 'me',    week: 18, sentence: 'Play with me.' },
  { word: 'be',    week: 18, sentence: 'I will be kind.' },
  { word: 'he',    week: 18, sentence: 'He can run fast.' },
  { word: 'have',  week: 19, sentence: 'I have a cat.' },
  { word: 'has',   week: 19, sentence: 'She has a hat.' },
  { word: 'want',  week: 20, sentence: 'I want a snack.' },
  { word: 'are',   week: 20, sentence: 'You are my friend.' },
  // Unit 4
  { word: 'all',   week: 21, sentence: 'We all clap.' },
  { word: 'off',   week: 21, sentence: 'Turn off the light.' },
  { word: 'she',   week: 22, sentence: 'She can jump.' },
  { word: 'said',  week: 22, sentence: 'Mom said yes.' },
  { word: 'where', week: 23, sentence: 'Where is my shoe?' },
  { word: 'from',  week: 23, sentence: 'This note is from Dad.' },
  { word: 'what',  week: 23, sentence: 'What is that?' },
  { word: 'they',  week: 24, sentence: 'They like to sing.' },
  { word: 'there', week: 24, sentence: 'The ball is over there.' },
  // Unit 5
  { word: 'find',  week: 25, sentence: 'Can you find the cat?' },
  { word: 'just',  week: 25, sentence: 'I just woke up.' },
  { word: 'how',   week: 26, sentence: 'How are you?' },
  { word: 'down',  week: 26, sentence: 'Sit down, please.' },
  { word: 'now',   week: 26, sentence: "Let's eat now." },
  { word: 'once',  week: 27, sentence: 'Once upon a time.' },
  { word: 'one',   week: 27, sentence: 'I have one nose.' },
  // Unit 6
  { word: 'your',  week: 28, sentence: 'Is this your hat?' },
  { word: 'use',   week: 29, sentence: 'I use a spoon.' },
];

// Only practice the words taught so far. Week 11 = end of Unit 2 (14 words).
// Raise this as the school year goes on (34 = everything).
const SIGHT_WORDS_THROUGH_WEEK = 11;

// Rhyming words, one rhyme family per line. Every word has a picture so
// children who can't read yet can tell the tiles apart. Families with a single
// word only ever appear as wrong answers. Families that nearly rhyme with each
// other (e.g. clock / fox) are left out so a wrong answer never sounds right.
// Emoji are limited to Unicode 12 or older so they show up on Windows 10 too.
const RHYME_FAMILIES = [
  [['cat', '🐱'], ['hat', '🎩'], ['bat', '🦇'], ['rat', '🐀']],
  [['dog', '🐶'], ['frog', '🐸']],
  [['bee', '🐝'], ['tree', '🌳'], ['key', '🔑']],
  [['cake', '🎂'], ['snake', '🐍']],
  [['car', '🚗'], ['star', '⭐']],
  [['fox', '🦊'], ['box', '📦'], ['socks', '🧦']],
  [['snail', '🐌'], ['whale', '🐳'], ['mail', '📬']],
  [['boat', '⛵'], ['goat', '🐐'], ['coat', '🧥']],
  [['house', '🏠'], ['mouse', '🐭']],
  [['bed', '🛏️'], ['sled', '🛷'], ['bread', '🍞']],
  [['van', '🚐'], ['man', '👨']],
  [['moon', '🌙'], ['spoon', '🥄'], ['balloon', '🎈']],
  [['bear', '🐻'], ['pear', '🍐'], ['chair', '🪑']],
  [['bell', '🔔'], ['shell', '🐚']],
  [['train', '🚆'], ['rain', '🌧️'], ['plane', '✈️']],
  [['pie', '🥧'], ['tie', '👔'], ['eye', '👁️']],
  [['ball', '⚽'], ['wall', '🧱']],
  [['nose', '👃'], ['rose', '🌹']],
  [['duck', '🦆'], ['truck', '🚚']],
  [['egg', '🥚'], ['leg', '🦵']],
  [['mice', '🐁'], ['rice', '🍚'], ['dice', '🎲']],
  [['kite', '🪁'], ['light', '💡']],
  [['corn', '🌽'], ['unicorn', '🦄']],
  [['bone', '🦴'], ['phone', '📱']],
  [['crown', '👑'], ['clown', '🤡']],
  [['cap', '🧢'], ['map', '🗺️']],
  [['ant', '🐜'], ['plant', '🌱']],
  [['ring', '💍'], ['king', '🤴']],
  [['pen', '🖊️'], ['ten', '🔟'], ['hen', '🐔']],
  [['fish', '🐟']],
  [['sun', '☀️']],
  [['pig', '🐷']],
  [['book', '📖']],
  [['ship', '🚢']],
];

// ---------------------------------------------------------------------------
// Groups: what can be asked, and how a round of it plays
// ---------------------------------------------------------------------------
//
// Every item belongs to exactly one group and carries everything needed to
// show and say it. Items are objects, not strings, because "a" and "I" are
// both letters and sight words; compare them by identity.
//
// A round is { item, answer, options, tiles }: `item` is what the game asks
// about, `answer` is the option that is correct, `options` are shown as tiles.

const EMPHASIS = { rate: 0.62, pitch: 1.18 }; // the item being asked about
const WORD_VOICE = { rate: 0.8, pitch: 1.1 }; // a word read out while its tile lights up

// Letters, numbers and sight words: the game names an item and the child taps
// the tile showing it. Wrong answers come from the item's own group, so a
// lowercase target never sits next to capitals.
const MATCH_ROUNDS = {
  choiceCount: 6,

  makeRound(item) {
    const distractors = shuffle(this.items.filter(other => other !== item)).slice(0, this.choiceCount - 1);
    return { item, answer: item, options: shuffle([item, ...distractors]) };
  },

  // "Okay, listen closely. This is the letter ... B. Words that start with B are ..."
  async introduce(step, { item }) {
    setSpeaking(true);
    await step.say('Okay, listen closely.', { rate: 0.82 });
    await step.pause(350);
    // Lead-in without the item, so we can pause for emphasis before it.
    await step.say(`This is the ${this.word}`, { rate: 0.82 });
    await step.pause(420);
    await step.say(item.spoken, EMPHASIS);
    await step.pause(520);
    await step.say(item.example, { rate: 0.86, pitch: 1.03 });
    setSpeaking(false);
  },

  // Gentle nudge, then repeat the target so the child knows what to look for.
  async nudge(step, { item }) {
    await step.say('Not quite. Try again!', { rate: 0.86 });
    await step.pause(250);
    await step.say(`Find the ${this.word}`, { rate: 0.82 });
    await step.pause(300);
    await step.say(item.spoken, EMPHASIS);
  },
};

// Rhymes: "Which picture rhymes with ... cat?" Then each picture is read out
// while its tile lights up, so a child who can't read knows which is which.
const RHYME_ROUNDS = {
  choiceCount: 4,
  showsTarget: true, // the word to rhyme with gets its own picture card

  makeRound(item) {
    const answer = randomOf(this.allWords.filter(w => w.family === item.family && w !== item));
    // One wrong answer from each of three other families, so no two wrong
    // answers rhyme with each other either.
    const families = [...new Set(this.allWords.map(w => w.family))].filter(f => f !== item.family);
    const distractors = shuffle(families)
      .slice(0, this.choiceCount - 1)
      .map(f => randomOf(this.allWords.filter(w => w.family === f)));
    return { item, answer, options: shuffle([answer, ...distractors]) };
  },

  async introduce(step, { item, options, tiles }) {
    setSpeaking(true);
    await step.say('Okay, listen closely.', { rate: 0.82 });
    await step.pause(300);
    await step.say('Which picture rhymes with', { rate: 0.82 });
    await step.pause(250);
    await sayLit(step, els.rhymeTarget, item.spoken, EMPHASIS);
    await step.pause(350);
    for (let i = 0; i < options.length; i++) {
      await sayLit(step, tiles[i], options[i].spoken, WORD_VOICE);
      await step.pause(150);
    }
    await step.pause(250);
    await step.say('Which one rhymes with', { rate: 0.82 });
    await sayLit(step, els.rhymeTarget, item.spoken, EMPHASIS);
    setSpeaking(false);
  },

  // "Not quite. Dog ... cat ... Those don't rhyme. Try again!"
  async nudge(step, { item }, option, btn) {
    await step.say('Not quite.', { rate: 0.86 });
    await step.pause(150);
    await sayLit(step, btn, option.spoken, WORD_VOICE);
    await sayLit(step, els.rhymeTarget, item.spoken, WORD_VOICE);
    await step.say("Those don't rhyme. Try again!", { rate: 0.86 });
  },

  // After the praise: "Cat ... hat ... They rhyme!"
  async confirm(step, { item, answer }, btn) {
    await sayLit(step, els.rhymeTarget, item.spoken, WORD_VOICE);
    await sayLit(step, btn, answer.spoken, WORD_VOICE);
    await step.say('They rhyme!', { rate: 0.9, pitch: 1.12 });
  },
};

const GROUPS = {
  letters:    { ...MATCH_ROUNDS, word: 'letter',           label: 'Letter' },
  lowercase:  { ...MATCH_ROUNDS, word: 'lowercase letter', label: 'Lowercase letter' },
  numbers:    { ...MATCH_ROUNDS, word: 'number',           label: 'Number' },
  sightWords: { ...MATCH_ROUNDS, word: 'word',             label: 'Word', tileClass: 'word' },
  rhymes:     { ...RHYME_ROUNDS, word: 'word',             label: 'Picture' },
};

const listOf = examples => examples.slice(0, 3).join(', ');

GROUPS.letters.items = Object.entries(lettersMap).map(([letter, words]) => ({
  group: GROUPS.letters,
  text: letter,
  spoken: letter,
  example: `Words that start with ${letter} are: ${listOf(words)}.`,
}));

GROUPS.lowercase.items = Object.entries(lettersMap).map(([letter, words]) => ({
  group: GROUPS.lowercase,
  text: letter.toLowerCase(),
  spoken: letter, // say the capital so "a" is read as the letter name, not the word
  example: `Words that start with ${letter} are: ${listOf(words)}.`,
}));

GROUPS.numbers.items = Object.entries(numbersMap).map(([number, things]) => ({
  group: GROUPS.numbers,
  text: number,
  spoken: number,
  example: `Examples of ${number} are: ${listOf(things)}.`,
}));

GROUPS.sightWords.items = SIGHT_WORDS
  .filter(({ week }) => week <= SIGHT_WORDS_THROUGH_WEEK)
  .map(({ word, sentence }) => ({
    group: GROUPS.sightWords,
    text: word,
    spoken: word,
    example: `Here it is in a sentence: ${sentence}`,
  }));

GROUPS.rhymes.allWords = RHYME_FAMILIES.flatMap((family, index) =>
  family.map(([word, emoji]) => ({ group: GROUPS.rhymes, text: word, spoken: word, emoji, family: index })));
// Only words with at least one rhyming partner can be asked about.
GROUPS.rhymes.items = GROUPS.rhymes.allWords.filter(w => RHYME_FAMILIES[w.family].length > 1);

const MODES = {
  letters:    { groups: ['letters'],    prompt: 'Listen, then tap the matching letter!' },
  lowercase:  { groups: ['lowercase'],  prompt: 'Listen, then tap the matching letter!' },
  numbers:    { groups: ['numbers'],    prompt: 'Listen, then tap the matching number!' },
  sightWords: { groups: ['sightWords'], prompt: 'Listen, then tap the matching word!' },
  rhymes:     { groups: ['rhymes'],     prompt: 'Listen, then tap the picture that rhymes!' },
  mixed:      { groups: null,           prompt: 'Listen, then tap the right answer!' }, // groups picked on the mix screen
};

const DEFAULT_MIX = ['letters', 'lowercase', 'numbers'];

// Right answers in a row (first try) needed for a sticker.
const STREAK_GOAL = 10;

// Reward stickers (emoji up to Unicode 12). Each one is new until she has them all.
const STICKERS = [
  ['🦄', 'unicorn'], ['🐉', 'dragon'], ['🦖', 'dinosaur'], ['🚀', 'rocket'],
  ['🌈', 'rainbow'], ['🦋', 'butterfly'], ['🐬', 'dolphin'], ['🦁', 'lion'],
  ['🐼', 'panda'], ['🧁', 'cupcake'], ['🏰', 'castle'], ['🦒', 'giraffe'],
  ['🐙', 'octopus'], ['🦜', 'parrot'], ['🦩', 'flamingo'], ['🍦', 'ice cream'],
];

const PRAISE = [
  "That's right! Great job!",
  'You got it!',
  'Awesome!',
  'Yes! Well done!',
  'Super!',
  'Fantastic!',
];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const randomOf = list => list[Math.floor(Math.random() * list.length)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Unbiased Fisher-Yates shuffle (returns a new array).
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Speech
// ---------------------------------------------------------------------------

const speech = (() => {
  const synth = window.speechSynthesis;
  const supported = Boolean(synth) && typeof window.SpeechSynthesisUtterance === 'function';

  // Some engines drop an utterance that is queued right after cancel(), so a
  // new sequence waits this long if something was still speaking.
  const SETTLE_MS = 80;

  // Bumped by every interrupt(). A sequence remembers the generation it started
  // in and stops at its next step once a newer one exists.
  let generation = 0;

  // Chrome can garbage-collect an utterance while it is speaking and then never
  // fire `onend`. Holding a reference until it finishes prevents that.
  const inFlight = new Set();

  // Pick the best English voice (Natural/Neural voices in Edge first) and keep
  // using it so the voice doesn't change between phrases.
  let cachedVoice = null;
  let voiceResolved = false;
  function pickVoice() {
    if (voiceResolved) return cachedVoice;
    const voices = synth.getVoices();
    if (!voices.length) return null;
    cachedVoice = voices.find(v => /Aria.*Natural/i.test(v.name))
      || voices.find(v => /Guy.*Natural/i.test(v.name))
      || voices.find(v => /Natural/i.test(v.name) && /^en[-_]US/i.test(v.lang))
      || voices.find(v => /Natural/i.test(v.name) && /^en/i.test(v.lang))
      || voices.find(v => /Google US English|Samantha/i.test(v.name))
      || voices.find(v => /^en[-_]US/i.test(v.lang))
      || voices.find(v => /^en/i.test(v.lang))
      || null;
    voiceResolved = true;
    return cachedVoice;
  }

  if (supported) {
    synth.cancel(); // Chrome can keep reading the previous page's queue after a reload
    synth.getVoices(); // starts loading voices asynchronously in Chrome
    synth.onvoiceschanged = () => { voiceResolved = false; };
    window.addEventListener('pagehide', () => synth.cancel());
  }

  // Speak one phrase. Resolves when it ends, errors or is cancelled.
  function utter(text, { rate = 0.85, pitch = 1.05, volume = 1 } = {}) {
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : 'en-US'; // never read English with a non-English default voice

      let timer = 0;
      const done = () => {
        clearTimeout(timer);
        inFlight.delete(u);
        resolve();
      };
      u.onend = done;
      u.onerror = done;
      // Safety net: some engines occasionally never fire end/error, which used
      // to freeze the game. Resolving early is harmless because the engine
      // queues the next phrase behind the current one anyway.
      timer = setTimeout(done, 2500 + (text.length * 140) / rate);
      inFlight.add(u);

      if (synth.paused) synth.resume();
      synth.speak(u);
    });
  }

  function interrupt() {
    generation += 1;
    if (supported) synth.cancel();
  }

  class Cancelled extends Error {}

  // Run `script(step)` as the only active speech sequence. `step.say()` and
  // `step.pause()` throw Cancelled once a newer sequence has started, which
  // unwinds the old script immediately. Resolves true if it ran to the end.
  async function run(script) {
    const wasBusy = supported && (synth.speaking || synth.pending);
    interrupt();
    const myGeneration = generation;
    const check = () => {
      if (myGeneration !== generation) throw new Cancelled();
    };
    const step = {
      async say(text, opts) {
        check();
        if (supported) await utter(text, opts);
        check();
      },
      async pause(ms) {
        check();
        await wait(ms);
        check();
      },
      // Wait for something else (e.g. a tap) as part of the sequence.
      async until(promise) {
        check();
        await promise;
        check();
      },
    };
    try {
      if (wasBusy) await step.pause(SETTLE_MS);
      await script(step);
      return true;
    } catch (err) {
      if (err instanceof Cancelled) return false;
      throw err;
    }
  }

  return { supported, run, interrupt };
})();

// ---------------------------------------------------------------------------
// Sound effects (tiny synthesized chimes, no files needed)
// ---------------------------------------------------------------------------

const sfx = (() => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let master = null;

  function audio() {
    if (!AudioCtx) return null;
    try {
      if (!ctx) {
        ctx = new AudioCtx();
        master = ctx.createGain();
        master.gain.value = 0.3;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }

  function tone(freq, { at = 0, dur = 0.3, type = 'sine', gain = 0.5, slideTo = 0 } = {}) {
    const c = audio();
    if (!c) return;
    const t0 = c.currentTime + at;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    // Happy rising arpeggio: C - E - G - C
    correct() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(f, { at: i * 0.075, dur: 0.4, type: 'triangle' }));
    },
    // Soft, friendly "boop" sliding down
    wrong() {
      tone(320, { dur: 0.28, slideTo: 170, gain: 0.45 });
    },
    // One "pling" per star in the streak, a step higher each time (C major scale)
    star(count) {
      const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.51];
      const f = scale[Math.min(count, scale.length) - 1];
      tone(f, { dur: 0.3, gain: 0.4 });
      tone(f * 2, { dur: 0.22, gain: 0.12 });
    },
    // "Ta-da!" for the 10-in-a-row reward
    fanfare() {
      [[523.25, 0, 0.18], [659.25, 0.16, 0.18], [783.99, 0.32, 0.18], [1046.5, 0.48, 0.55],
        [783.99, 0.85, 0.16], [1046.5, 1.0, 0.9]].forEach(([f, at, dur]) => {
        tone(f, { at, dur, type: 'triangle', gain: 0.5 });
        tone(f * 2, { at, dur, gain: 0.1 });
      });
    },
  };
})();

// ---------------------------------------------------------------------------
// Visual effects
// ---------------------------------------------------------------------------

function animate(el, keyframes, options) {
  if (reducedMotion.matches || typeof el.animate !== 'function') return;
  el.animate(keyframes, options);
}

function popIn(el, index) {
  animate(el, [
    { transform: 'scale(.3)', opacity: 0 },
    { transform: 'scale(1.08)', opacity: 1, offset: 0.7 },
    { transform: 'scale(1)', opacity: 1 },
  ], { duration: 380, delay: index * 50, easing: 'ease-out', fill: 'backwards' });
}

function shake(el) {
  animate(el, [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px) rotate(-4deg)' },
    { transform: 'translateX(10px) rotate(4deg)' },
    { transform: 'translateX(-6px) rotate(-2deg)' },
    { transform: 'translateX(0)' },
  ], { duration: 400, easing: 'ease-in-out' });
}

function bounce(el) {
  animate(el, [
    { transform: 'scale(1)' },
    { transform: 'scale(1.2) rotate(-5deg)', offset: 0.35 },
    { transform: 'scale(.95) rotate(3deg)', offset: 0.65 },
    { transform: 'scale(1.08)' },
  ], { duration: 650, easing: 'ease-out', fill: 'forwards' });
}

const CONFETTI_EMOJI = ['🎉', '✨', '🎈', '🌟', '⭐', '💫', '🍭', '🦄'];
const CONFETTI_COLORS = ['#ff6b6b', '#feca57', '#1dd1a1', '#54a0ff', '#a55eea', '#ff9ff3'];

// Burst confetti out of an element; pieces fly up and fall with gravity.
function confettiFrom(el) {
  if (reducedMotion.matches) return;
  const rect = el.getBoundingClientRect();
  const x0 = rect.left + rect.width / 2;
  const y0 = rect.top + rect.height / 2;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  document.body.append(layer);

  const GRAVITY = 1500; // px/s²
  let longest = 0;
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('span');
    if (i % 3 === 0) {
      piece.textContent = randomOf(CONFETTI_EMOJI);
      piece.style.fontSize = `${18 + Math.random() * 20}px`;
    } else {
      piece.className = 'confetti-bit';
      piece.style.width = `${6 + Math.random() * 6}px`;
      piece.style.height = `${10 + Math.random() * 8}px`;
      piece.style.background = randomOf(CONFETTI_COLORS);
    }
    layer.append(piece);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2; // mostly upwards
    const speed = 420 + Math.random() * 480; // px/s
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const spin = (Math.random() - 0.5) * 1080;
    const seconds = 1.2 + Math.random() * 0.5;
    longest = Math.max(longest, seconds);

    const frames = [];
    for (let k = 0; k <= 12; k++) {
      const t = (seconds * k) / 12;
      const x = x0 + vx * t;
      const y = y0 + vy * t + 0.5 * GRAVITY * t * t;
      frames.push({
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${(spin * k) / 12}deg)`,
        opacity: k < 8 ? 1 : 1 - (k - 8) / 4,
      });
    }
    piece.animate(frames, { duration: seconds * 1000, easing: 'linear', fill: 'forwards' });
  }
  setTimeout(() => layer.remove(), longest * 1000 + 100);
}

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------

const $ = id => document.getElementById(id);
const els = {
  modeSelect: $('modeSelect'),
  mixSelect: $('mixSelect'),
  gameScreen: $('gameScreen'),
  playBtn: $('playBtn'),
  nextBtn: $('nextBtn'),
  changeModeBtn: $('changeModeBtn'),
  rhymeTarget: $('rhymeTarget'),
  choices: $('choices'),
  message: $('message'),
  instructions: $('instructions'),
  noSpeech: $('noSpeech'),
  mixStartBtn: $('mixStartBtn'),
  mixBackBtn: $('mixBackBtn'),
  mixHint: $('mixHint'),
  streak: $('streak'),
  reward: $('reward'),
  rewardCard: $('rewardCard'),
  rewardSticker: $('rewardSticker'),
  rewardText: $('rewardText'),
  rewardBtn: $('rewardBtn'),
  shelfList: $('shelfList'),
  shelfEmpty: $('shelfEmpty'),
};

const state = {
  mode: 'letters',
  groups: [],     // group names this game draws from
  decks: {},      // per group: shuffled items still to come this cycle
  round: null,    // { item, answer, options, tiles }
  locked: false,  // true while the "correct!" celebration plays
  streak: 0,      // right answers in a row (first try); kept when switching modes
};

// Kids love double-taps. Ignore the second tap on the same button, and ignore
// all taps for a moment after the screen changes (otherwise the second click
// of a double-click lands on whatever button appears under the finger).
let inputBlockedUntil = 0;
function onTap(el, handler, cooldown = 400) {
  let last = -Infinity;
  el.addEventListener('click', event => {
    const now = performance.now();
    if (now < inputBlockedUntil || now - last < cooldown) return;
    last = now;
    handler(event);
  });
}

function showScreen(name) {
  els.modeSelect.hidden = name !== 'modes';
  els.mixSelect.hidden = name !== 'mix';
  els.gameScreen.hidden = name !== 'game';
  inputBlockedUntil = performance.now() + 450;
}

function showMessage(text, tone = '') {
  els.message.textContent = text;
  els.message.className = tone ? `message ${tone}` : 'message';
}

function setSpeaking(on) {
  els.playBtn.classList.toggle('speaking', on);
}

// Light up one tile (or the rhyme picture) and fade the others back.
function spotlight(el) {
  clearSpotlight();
  el.classList.add('spotlight');
  els.gameScreen.classList.add('spotlighting');
}

function clearSpotlight() {
  els.gameScreen.classList.remove('spotlighting');
  for (const el of els.gameScreen.querySelectorAll('.spotlight')) el.classList.remove('spotlight');
}

// Say a word while its tile is lit up.
async function sayLit(step, el, text, opts) {
  spotlight(el);
  await step.say(text, opts);
  await step.pause(300);
  clearSpotlight();
}

// Start a new speech sequence (stopping any previous one).
function sequence(script) {
  setSpeaking(false);
  clearSpotlight();
  return speech.run(script);
}

function stopSpeech() {
  setSpeaking(false);
  clearSpotlight();
  speech.interrupt();
}

// Pick one of the game's groups at random (so a big group like rhymes doesn't
// crowd out the others in a mix), then draw from that group's shuffled deck:
// every item comes up once per cycle, never the same item twice in a row, and
// never two rounds from the same rhyme family back to back.
function drawItem() {
  const name = randomOf(state.groups);
  const deck = state.decks[name] || (state.decks[name] = []);
  const prev = state.round && state.round.item;
  const clashes = it => Boolean(prev) && (it === prev || (it.family !== undefined && it.family === prev.family));
  if (!deck.some(it => !clashes(it))) {
    // Start a new cycle; leftovers that clash stay at the bottom for later.
    deck.push(...shuffle(GROUPS[name].items.filter(it => !deck.includes(it))));
  }
  for (let i = deck.length - 1; i >= 0; i--) {
    if (!clashes(deck[i])) return deck.splice(i, 1)[0];
  }
  return deck.pop(); // the pool is too small to avoid a repeat
}

function introduce(step, round) {
  return round.item.group.introduce(step, round);
}

function playCurrent() {
  if (state.locked || !state.round) return;
  sequence(step => introduce(step, state.round));
}

function newRound() {
  startRound(drawItem());
}

function startRound(item) {
  state.round = item.group.makeRound(item);
  state.locked = false;
  renderRound(state.round);
  showMessage('');
}

function renderRound(round) {
  const { group } = round.item;
  els.rhymeTarget.hidden = !group.showsTarget;
  if (group.showsTarget) fillPicture(els.rhymeTarget, round.item);

  round.tiles = round.options.map(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn chunky';
    if (option.emoji) {
      btn.classList.add('picture');
      fillPicture(btn, option);
    } else {
      if (group.tileClass) btn.classList.add(group.tileClass);
      btn.textContent = option.text;
      btn.dataset.word = option.text;
    }
    btn.setAttribute('aria-label', `${group.label} ${option.spoken}`);
    onTap(btn, () => onChoice(option, btn));
    return btn;
  });
  els.choices.dataset.count = round.tiles.length;
  els.choices.replaceChildren(...round.tiles);
  round.tiles.forEach(popIn);
}

// Picture + small word underneath (rhyme tiles and the rhyme target card).
function fillPicture(el, option) {
  const pic = document.createElement('span');
  pic.className = 'pic';
  pic.setAttribute('aria-hidden', 'true');
  pic.textContent = option.emoji;
  const word = document.createElement('span');
  word.className = 'pic-word';
  word.textContent = option.text;
  el.replaceChildren(pic, word);
  el.dataset.word = option.text;
}

function onChoice(option, btn) {
  if (state.locked) return;
  if (option === state.round.answer) {
    celebrate(btn);
  } else {
    tryAgain(option, btn);
  }
}

async function celebrate(btn) {
  const round = state.round;
  const { group } = round.item;
  state.locked = true;
  for (const tile of round.tiles) tile.disabled = true;
  btn.classList.add('correct');
  const praise = randomOf(PRAISE);
  showMessage(`${praise} 🎉`, 'good');
  sfx.correct();
  bounce(btn);
  confettiFrom(btn);
  if (!round.missed) setStreak(Math.min(state.streak + 1, STREAK_GOAL));
  const rewardDue = state.streak >= STREAK_GOAL;

  // If the child changes mode mid-celebration this sequence is cancelled,
  // so the game doesn't carry on talking in the background.
  await sequence(async step => {
    await Promise.all([
      step.say(praise, { rate: 0.9, pitch: 1.15 }),
      step.pause(1600), // let the confetti finish
    ]);
    if (group.confirm) await group.confirm(step, round, btn);
    if (rewardDue) await giveReward(step);
    newRound();
    await step.pause(450);
    await introduce(step, state.round);
  });
}

const wrongTimers = new WeakMap();

function tryAgain(option, btn) {
  const round = state.round;
  btn.classList.add('wrong');
  clearTimeout(wrongTimers.get(btn));
  wrongTimers.set(btn, setTimeout(() => btn.classList.remove('wrong'), 700));
  shake(btn);
  sfx.wrong();
  showMessage('Not quite — try again!', 'bad');
  if (!round.missed) {
    round.missed = true; // this round no longer counts for the streak
    setStreak(0);
  }
  sequence(step => round.item.group.nudge(step, round, option, btn));
}

function startGame(mode, groups = MODES[mode].groups) {
  state.mode = mode;
  state.groups = groups;
  state.decks = {};
  state.round = null;
  els.instructions.textContent = MODES[mode].prompt;
  showScreen('game');
  newRound();
  playCurrent();
}

// ---------------------------------------------------------------------------
// Mix screen: choose which groups "Mix it up" draws from (remembered)
// ---------------------------------------------------------------------------

// Small localStorage wrappers: the game still works (it just forgets) when
// storage is unavailable or holds something unexpected.
function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch { /* storage unavailable */ }
}

const MIX_STORAGE_KEY = 'letterGame.mix';
const mixOptions = [...document.querySelectorAll('.mix-option')];

function loadMix() {
  const valid = readList(MIX_STORAGE_KEY).filter(name => name in GROUPS);
  return valid.length ? valid : [...DEFAULT_MIX];
}

function saveMix(groups) {
  writeList(MIX_STORAGE_KEY, groups);
}

function selectedMix() {
  return mixOptions.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.group);
}

function updateMixStart() {
  const nothing = selectedMix().length === 0;
  els.mixStartBtn.disabled = nothing;
  els.mixHint.hidden = !nothing;
}

function showMixSelect() {
  const chosen = loadMix();
  for (const b of mixOptions) b.setAttribute('aria-pressed', String(chosen.includes(b.dataset.group)));
  updateMixStart();
  showScreen('mix');
}

// ---------------------------------------------------------------------------
// Streak meter: one star per first-try right answer, a sticker at STREAK_GOAL
// ---------------------------------------------------------------------------

const streakSlots = [];
const streakGift = document.createElement('span');

function buildStreakMeter() {
  for (let i = 1; i <= STREAK_GOAL; i++) {
    const slot = document.createElement('span');
    slot.className = 'streak-slot';
    slot.textContent = i; // empty slots show their number, so she can count along
    streakSlots.push(slot);
  }
  streakGift.className = 'streak-gift';
  streakGift.textContent = '🎁';
  els.streak.replaceChildren(...streakSlots, streakGift);
  renderStreakLabel();
}

function renderStreakLabel() {
  els.streak.setAttribute('aria-label', `${state.streak} of ${STREAK_GOAL} right in a row`);
}

function setStreak(count) {
  const before = state.streak;
  state.streak = count;
  streakSlots.forEach((slot, i) => {
    const filled = i < count;
    if (filled === slot.classList.contains('filled')) return;
    slot.classList.toggle('filled', filled);
    slot.textContent = filled ? '⭐' : i + 1;
    if (filled) {
      animate(slot, [
        { transform: 'scale(0) rotate(-90deg)' },
        { transform: 'scale(1.35) rotate(10deg)', offset: 0.6 },
        { transform: 'scale(1)' },
      ], { duration: 500, easing: 'ease-out' });
    } else {
      // Empty gently, from the top star down.
      animate(slot, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 300, delay: (before - 1 - i) * 45, easing: 'ease-out', fill: 'backwards' });
    }
  });
  if (count > before) setTimeout(() => sfx.star(count), 350); // after the "correct" chime
  streakGift.classList.toggle('close', count >= STREAK_GOAL - 3 && count < STREAK_GOAL);
  renderStreakLabel();
}

// ---------------------------------------------------------------------------
// Reward: a sticker for STREAK_GOAL in a row, kept in a collection
// ---------------------------------------------------------------------------

const STICKER_STORAGE_KEY = 'letterGame.stickers';

function loadStickers() {
  return readList(STICKER_STORAGE_KEY).filter(emoji => STICKERS.some(([e]) => e === emoji));
}

// A sticker she doesn't have yet, if there is one.
function pickSticker() {
  const have = loadStickers();
  const fresh = STICKERS.filter(([emoji]) => !have.includes(emoji));
  return randomOf(fresh.length ? fresh : STICKERS);
}

function renderShelf() {
  const stickers = loadStickers();
  els.shelfEmpty.hidden = stickers.length > 0;
  els.shelfList.replaceChildren(...stickers.map((emoji, i) => {
    const el = document.createElement('span');
    el.className = 'sticker';
    el.textContent = emoji;
    el.style.setProperty('--tilt', `${((i * 37) % 17) - 8}deg`); // a little hand-placed look
    return el;
  }));
}

async function giveReward(step) {
  const [emoji, name] = pickSticker();
  writeList(STICKER_STORAGE_KEY, [...loadStickers(), emoji]); // saved right away
  renderShelf();

  const won = `You won ${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name} sticker!`;
  els.rewardSticker.textContent = emoji;
  els.rewardText.textContent = won;
  els.rewardBtn.disabled = true; // until the voice is done, so an excited tap doesn't skip it
  els.reward.hidden = false;
  animate(els.rewardCard, [
    { transform: 'scale(.5)', opacity: 0 },
    { transform: 'scale(1.05)', opacity: 1, offset: 0.7 },
    { transform: 'scale(1)' },
  ], { duration: 450, easing: 'ease-out' });
  animate(els.rewardSticker, [
    { transform: 'scale(0) rotate(-200deg)' },
    { transform: 'scale(1.2) rotate(10deg)', offset: 0.7 },
    { transform: 'scale(1) rotate(0)' },
  ], { duration: 800, delay: 150, easing: 'ease-out', fill: 'backwards' });
  sfx.fanfare();
  setTimeout(() => confettiFrom(els.rewardSticker), 300);
  setTimeout(() => confettiFrom(els.rewardSticker), 1100);

  await step.say('Wow! Ten in a row!', { rate: 0.9, pitch: 1.2 });
  await step.say(won, { rate: 0.88, pitch: 1.15 });
  els.rewardBtn.disabled = false;
  els.rewardBtn.focus();
  await step.until(new Promise(resolve => els.rewardBtn.addEventListener('click', resolve, { once: true })));

  els.reward.hidden = true;
  setStreak(0);
}

// ---------------------------------------------------------------------------
// Wire up
// ---------------------------------------------------------------------------

buildStreakMeter();
renderShelf();

els.reward.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !els.rewardBtn.disabled) els.rewardBtn.click();
});

document.querySelectorAll('.mode-card').forEach(card => {
  onTap(card, () => {
    if (card.dataset.mode === 'mixed') showMixSelect();
    else startGame(card.dataset.mode);
  });
});

mixOptions.forEach(option => {
  onTap(option, () => {
    option.setAttribute('aria-pressed', String(option.getAttribute('aria-pressed') !== 'true'));
    saveMix(selectedMix());
    updateMixStart();
  });
});

onTap(els.mixStartBtn, () => {
  const groups = selectedMix();
  if (groups.length) startGame('mixed', groups);
});

onTap(els.mixBackBtn, () => showScreen('modes'));

onTap(els.playBtn, playCurrent);

onTap(els.nextBtn, () => {
  if (state.locked) return;
  newRound();
  playCurrent();
});

onTap(els.changeModeBtn, () => {
  stopSpeech();
  showScreen('modes');
});

if (!speech.supported) els.noSpeech.hidden = false;
