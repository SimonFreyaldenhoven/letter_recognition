// Simple Letter Recognition Game
// Uses Web Speech (speechSynthesis) for audio playback so no external audio files are required.

const wordsMap = {
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

const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const choices = document.getElementById('choices');
const message = document.getElementById('message');

let currentLetter = 'A';

function randLetter(){
  const letters = Object.keys(wordsMap);
  return letters[Math.floor(Math.random()*letters.length)];
}

function createChoices(letter){
  choices.innerHTML = '';
  const other = (()=>{
    let pick;
    do{ pick = randLetter(); } while(pick === letter);
    return pick;
  })();

  // present two buttons in random order
  const opts = [letter, other].sort(()=>Math.random()-0.5);

  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = opt;
    btn.setAttribute('aria-label', `Letter ${opt}`);
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

async function playLetterAudio(letter){
  const words = wordsMap[letter] || [];
  // Friendly, paced playback with emphasis on the single-letter sound.
  // 1) Intro prompt
  await speakAsync('Okay, listen closely.', {rate:0.82, pitch:1.05});
  // small pause
  await new Promise(r => setTimeout(r, 350));

  // 2) Lead-in phrase (do NOT include the letter here so we can pause before it)
  await speakAsync('This is the letter', {rate:0.82, pitch:1.05});
  // deliberate pause to build emphasis before the single-letter utterance
  await new Promise(r => setTimeout(r, 420));

  // 3) The emphasized single-letter utterance (slower, slightly higher pitch)
  await speakAsync(letter, {rate:0.62, pitch:1.18});

  // small pause after the letter to give the child time to process
  await new Promise(r => setTimeout(r, 520));

  // 4) Example words
  const wordsPhrase = `Words that start with ${letter} are: ${words.slice(0,3).join(', ')}.`;
  await speakAsync(wordsPhrase, {rate:0.86, pitch:1.03});
}

async function onChoiceClicked(choice, btn){
  if(choice === currentLetter){
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
  currentLetter = randLetter();
  createChoices(currentLetter);
  showMessage('');
}

// wire up buttons
playBtn.addEventListener('click', ()=>{
  playLetterAudio(currentLetter);
});

nextBtn.addEventListener('click', ()=>{
  nextRound();
});

// initialize
nextRound();
