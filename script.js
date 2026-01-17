// Simple Letter & Number Recognition Game
// Uses Web Speech (speechSynthesis) for audio playback so no external audio files are required.

const lettersMap = {
  A: ['apple','ant','airplane'],
  B: ['ball','banana','butterfly'],
  C: ['cat','car','cup'],
  D: ['dog','duck','door'],
  E: ['elephant','egg','engine'],
  F: ['fish','flower','fork'],
  G: ['goat','grape','guitar'],
  H: ['hat','horse','house'],
  I: ['ice','igloo','insect'],
  J: ['juice','jelly','jacket'],
  K: ['kite','key','kangaroo'],
  L: ['lion','lamp','leaf'],
  M: ['moon','mouse','milk'],
  N: ['nose','nest','nap'],
  O: ['orange','owl','octopus'],
  P: ['pig','pen','piano'],
  Q: ['queen','quilt','quail'],
  R: ['rabbit','rain','ring'],
  S: ['sun','snake','sock'],
  T: ['tiger','tree','towel'],
  U: ['umbrella','uniform','urchin'],
  V: ['violin','van','vase'],
  W: ['whale','watch','water'],
  X: ['xylophone','x-ray','xenops'],
  Y: ['yacht','yogurt','yak'],
  Z: ['zebra','zoo','zipper']
};

const numbersMap = {
  '1': ['one sun','one nose','one moon'],
  '2': ['two eyes','two hands','two feet'],
  '3': ['three bears','three little pigs','triangle sides'],
  '4': ['four wheels on a car','four legs on a dog','four seasons'],
  '5': ['five fingers','five toes','star points'],
  '6': ['six legs on an insect','six sides on a dice','half dozen'],
  '7': ['seven days in a week','seven colors of the rainbow','seven dwarfs'],
  '8': ['eight legs on a spider','eight tentacles on an octopus','octagon sides'],
  '9': ['nine planets','nine lives of a cat','baseball innings'],
  '10': ['ten fingers','ten toes','bowling pins'],
  '11': ['eleven players on a soccer team','eleven pipers piping','number after ten'],
  '12': ['twelve months in a year','dozen eggs','twelve hours on a clock'],
  '13': ['thirteen stripes on the flag','a baker\'s dozen','unlucky number'],
  '14': ['fourteen days in two weeks','valentines day','fourteen lines in a sonnet'],
  '15': ['fifteen minutes','quarter hour','fifteen puzzle'],
  '16': ['sixteen ounces in a pound','sweet sixteen','sixteen candles'],
  '17': ['seventeen syllables in a haiku','number after sixteen','seventeen magazine'],
  '18': ['eighteen holes of golf','eighteen wheels on a big truck','voting age'],
  '19': ['nineteen','one less than twenty','nineteen hundred'],
  '20': ['twenty fingers and toes','score','twenty questions']
};

// Combined map for easy lookup
const itemsMap = { ...lettersMap, ...numbersMap };

function isNumber(item) {
  return item in numbersMap;
}

const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const choices = document.getElementById('choices');
const message = document.getElementById('message');

let currentItem = 'A';

function randItem(){
  const items = Object.keys(itemsMap);
  return items[Math.floor(Math.random()*items.length)];
}

function createChoices(item){
  choices.innerHTML = '';
  const itemIsNumber = isNumber(item);

  // generate 3 unique distractors of the same type (letters or numbers)
  const distractors = [];
  const pool = itemIsNumber ? Object.keys(numbersMap) : Object.keys(lettersMap);
  while(distractors.length < 3){
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if(pick !== item && !distractors.includes(pick)){
      distractors.push(pick);
    }
  }

  // present four buttons in random order
  const opts = [item, ...distractors].sort(()=>Math.random()-0.5);

  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = opt;
    const typeLabel = isNumber(opt) ? 'Number' : 'Letter';
    btn.setAttribute('aria-label', `${typeLabel} ${opt}`);
    btn.addEventListener('click', ()=>onChoiceClicked(opt, btn));
    choices.appendChild(btn);
  });
}

function speak(text, opts={rate:0.85, pitch:1.05, volume:1}){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  // Slower, slightly higher pitch for a friendly, child-appealing voice
  u.rate = opts.rate || 0.85;
  u.pitch = (typeof opts.pitch === 'number') ? opts.pitch : 1.05;
  u.volume = (typeof opts.volume === 'number') ? opts.volume : 1;

  // Try to pick a friendly-sounding English voice (prefer named female or en-GB if present)
  const voices = speechSynthesis.getVoices();
  if(voices && voices.length){
    const preferred = voices.find(v => /female|woman|Google UK English Female|Microsoft|Samantha|Alloy/i.test(v.name))
      || voices.find(v => /en-GB/i.test(v.lang))
      || voices.find(v => /en-US|en/i.test(v.lang));
    if(preferred) u.voice = preferred;
  }

  // Cancel any ongoing speech to keep playback responsive and predictable
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// Async version of speak that returns a Promise which resolves when the utterance ends.
// Does NOT cancel existing speech by default so it can be used to chain phrases with pauses.
function speakAsync(text, opts={rate:0.85, pitch:1.05, volume:1}){
  return new Promise((resolve)=>{
    if(!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate || 0.85;
    u.pitch = (typeof opts.pitch === 'number') ? opts.pitch : 1.05;
    u.volume = (typeof opts.volume === 'number') ? opts.volume : 1;
    const voices = speechSynthesis.getVoices();
    if(voices && voices.length){
      const preferred = voices.find(v => /female|woman|Google UK English Female|Microsoft|Samantha|Alloy/i.test(v.name))
        || voices.find(v => /en-GB/i.test(v.lang))
        || voices.find(v => /en-US|en/i.test(v.lang));
      if(preferred) u.voice = preferred;
    }
    u.onend = () => resolve();
    u.onerror = () => resolve();
    // do not cancel existing speech so chains can flow naturally
    speechSynthesis.speak(u);
  });
}

async function playItemAudio(item){
  const examples = itemsMap[item] || [];
  const itemIsNumber = isNumber(item);
  const typeWord = itemIsNumber ? 'number' : 'letter';

  // Friendly, paced playback with emphasis on the item.
  // 1) Intro prompt
  await speakAsync('Okay, listen closely.', {rate:0.82, pitch:1.05});
  // small pause
  await new Promise(r => setTimeout(r, 350));

  // 2) Lead-in phrase (do NOT include the item here so we can pause before it)
  await speakAsync(`This is the ${typeWord}`, {rate:0.82, pitch:1.05});
  // deliberate pause to build emphasis before the single utterance
  await new Promise(r => setTimeout(r, 420));

  // 3) The emphasized item utterance (slower, slightly higher pitch)
  await speakAsync(item, {rate:0.62, pitch:1.18});

  // small pause after to give the child time to process
  await new Promise(r => setTimeout(r, 520));

  // 4) Example words/concepts
  if (itemIsNumber) {
    const examplesPhrase = `Examples of ${item} are: ${examples.slice(0,3).join(', ')}.`;
    await speakAsync(examplesPhrase, {rate:0.86, pitch:1.03});
  } else {
    const wordsPhrase = `Words that start with ${item} are: ${examples.slice(0,3).join(', ')}.`;
    await speakAsync(wordsPhrase, {rate:0.86, pitch:1.03});
  }
}

async function onChoiceClicked(choice, btn){
  if(choice === currentItem){
    // Prevent further clicks while feedback & animation play
    choices.querySelectorAll('button').forEach(b => b.disabled = true);
    btn.classList.add('correct');
    showMessage("That's right! 🎉");
    await playCorrectFeedback();
    // playCorrectFeedback will call nextRound() after the animation finishes
  } else {
    btn.classList.add('wrong');
    showMessage('Not quite — try again.');
    // friendly nudge
    speak('Not quite, give it another try.', {rate:0.86, pitch:1.05});
    setTimeout(()=>btn.classList.remove('wrong'), 700);
  }
}

function showMessage(txt){
  message.textContent = txt;
}

async function playCorrectFeedback(){
  // enthusiastic, friendly confirmation
  await speakAsync("That's right! Great job!", {rate:0.9, pitch:1.15});
  // play confetti and wait for it to finish
  await spawnConfetti();
  // small pause to let the user register the celebration
  await new Promise(r => setTimeout(r, 220));
  // automatically proceed to the next round (draw two new letters)
  nextRound();
}

function spawnConfetti(){
  return new Promise(resolve => {
    const wrapper = document.createElement('div');
    wrapper.className = 'confetti';
    document.body.appendChild(wrapper);
    const emojis = ['🎉','✨','🎈','🌟','💫','🍭'];
    for(let i=0;i<18;i++){
      const s = document.createElement('span');
      s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      s.style.left = `${-160 + Math.random()*320}px`;
      s.style.top = `${-40 + Math.random()*40}px`;
      s.style.fontSize = `${12 + Math.random()*22}px`;
      s.style.animationDelay = `${Math.random()*300}ms`;
      wrapper.appendChild(s);
    }
    // remove after animation completes and resolve
    setTimeout(()=>{
      wrapper.remove();
      resolve();
    }, 1600);
  });
}

function nextRound(){
  currentItem = randItem();
  createChoices(currentItem);
  showMessage('');
}

// wire up buttons
playBtn.addEventListener('click', ()=>{
  playItemAudio(currentItem);
});

nextBtn.addEventListener('click', ()=>{
  nextRound();
});

// initialize
nextRound();
