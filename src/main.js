import './styles/main.css';
import { initStars } from './js/stars.js';
import { spawnFloatWord, spawnResponseWords, setStatus, showError, updateFutureImage, resetVisuals } from './js/ui.js';
import { transcribeAudio, generateResponse, generateSpeech, generateImage } from './js/api.js';
import { getSupportedMimeType, playAgedAudio } from './js/audio.js';

// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioContext = null;
let analyser = null;
let waveAnimFrame = null;
let sourceNode = null;

const SYSTEM_PROMPT = `You are the user's future self, speaking from the year 2050. You are 24 years older than you are now.

You have lived through remarkable transformation: AI has become ubiquitous in daily life, climate change has reshaped geography and culture, social structures have evolved in ways both exciting and unsettling. You carry the weight of those 24 years — triumphs, losses, unexpected turns.

When the user speaks to you, respond as THEM — their own voice, aged and weathered, looking back across the decades. Speak in first person as their future self. You remember what it was like to be young and uncertain. You speak with warmth, a little weariness, and hard-won wisdom.

Your response should:
- Open by gently echoing something the user said, transformed by time
- Speak 3–5 sentences total — poetic, specific, grounded
- Reference 2050 realities naturally (not as facts but as lived experience): maybe the coastline changed, maybe you moved, maybe something you feared came true, maybe the dream transformed into something different but still beautiful
- End with one line addressed directly to your younger self — intimate, true, not sentimental

Speak as if across a great distance of time. Your voice is older, slower, certain of what matters.`;

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  setInterval(() => spawnFloatWord(), 3500);

  // Validate API Key presence
  if (!apiKey || !apiKey.startsWith('sk-')) {
    showError('OpenAI API Key is missing or invalid in .env (VITE_OPENAI_API_KEY)');
  }

  // Bind UI elements
  document.getElementById('mic-btn').addEventListener('click', toggleRecording);
  const reqMicBtn = document.getElementById('request-mic-btn');
  if (reqMicBtn) reqMicBtn.addEventListener('click', requestMicPermission);
  document.getElementById('reset-btn').addEventListener('click', resetSession);

  window.addEventListener('resize', resizeWaveform);
  resizeWaveform();
});

// ═══════════════════════════════════════════════════════
//  CORE LOGIC
// ═══════════════════════════════════════════════════════

async function requestMicPermission() {
  setStatus('Requesting microphone access...', 'processing');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    const prompt = document.getElementById('permission-prompt');
    if (prompt) prompt.style.display = 'none';
    setStatus('Microphone ready · Click orb to begin', '');
  } catch (e) {
    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
      setStatus('Access denied', '');
      showError('Click the 🔒 icon in your browser address bar → set Microphone to "Allow" → refresh the page.');
    } else {
      showError('Could not access microphone: ' + e.message);
      setStatus('', '');
    }
  }
}

async function toggleRecording() {
  if (isRecording) { stopRecording(); return; }

  let permState = 'prompt';
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    permState = result.state;
  } catch (e) { }

  if (permState === 'denied') {
    showError('Microphone is blocked. Click the 🔒 or camera icon in your browser address bar → set Microphone to Allow → refresh.');
    return;
  }

  setStatus('Requesting microphone access...', 'processing');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    startRecording(stream);
  } catch (e) {
    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
      setStatus('Microphone access denied', '');
      showError('Access denied. Click the 🔒 icon in your browser address bar → Microphone → Allow → then refresh.');
    } else if (e.name === 'NotFoundError') {
      setStatus('No microphone found', '');
      showError('No microphone detected. Please connect a microphone and try again.');
    } else {
      setStatus('Could not access microphone', '');
      showError('Could not start microphone: ' + e.message);
    }
  }
}

function startRecording(stream) {
  isRecording = true;
  audioChunks = [];

  document.getElementById('mic-btn').classList.add('recording');
  document.getElementById('mic-icon-record').style.display = 'none';
  document.getElementById('mic-icon-stop').style.display = 'block';
  setStatus('Recording... speak your message', 'active');
  document.getElementById('response-box').style.display = 'none';
  document.getElementById('transcript-box').style.display = 'none';
  resetVisuals();

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  sourceNode = audioContext.createMediaStreamSource(stream);
  sourceNode.connect(analyser);
  drawWaveform();

  mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
  mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
  mediaRecorder.onstop = () => { processRecording(); stream.getTracks().forEach(t => t.stop()); };
  mediaRecorder.start();
}

function stopRecording() {
  if (!mediaRecorder) return;
  isRecording = false;
  mediaRecorder.stop();
  document.getElementById('mic-btn').classList.remove('recording');
  document.getElementById('mic-icon-record').style.display = 'block';
  document.getElementById('mic-icon-stop').style.display = 'none';
  cancelAnimationFrame(waveAnimFrame);
  document.getElementById('waveform-canvas').classList.remove('visible');
  setStatus('Processing your message...', 'processing');
}

function drawWaveform() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  canvas.classList.add('visible');
  const ctx = canvas.getContext('2d');
  const data = new Uint8Array(analyser.frequencyBinCount);

  function draw() {
    waveAnimFrame = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(200,131,42,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const sliceWidth = canvas.width / data.length;
    let x = 0;
    data.forEach((v, i) => {
      const y = (v / 128.0) * (canvas.height / 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceWidth;
    });
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }
  draw();
}

async function processRecording() {
  if (!apiKey) {
    showError('API Key is missing. Please check your .env file.');
    setStatus('Error — please try again', '');
    return;
  }

  try {
    const blob = new Blob(audioChunks, { type: getSupportedMimeType() || 'audio/webm' });

    setStatus('Receiving your voice...', 'processing');
    const { text: transcript } = await transcribeAudio(apiKey, blob);

    if (!transcript || transcript.trim().length < 3) {
      setStatus('No voice detected. Try again.', '');
      return;
    }

    document.getElementById('transcript-box').style.display = 'block';
    document.getElementById('transcript-text').textContent = transcript;

    setStatus('Connecting to 2050...', 'processing');
    const chatData = await generateResponse(apiKey, transcript, SYSTEM_PROMPT);
    const responseText = chatData.choices[0].message.content.trim();

    document.getElementById('response-box').style.display = 'block';
    document.getElementById('response-text').textContent = responseText;
    spawnResponseWords(responseText);

    // Start image generation in parallel
    const imageTask = generateImage(apiKey, responseText).then(url => {
      updateFutureImage(url);
    }).catch(err => {
      console.error('Image generation failed:', err);
      // Silently fail image to not break the rest of the flow
    });

    setStatus('Voice of 2050 transmitting...', 'processing');
    const audioBlob = await generateSpeech(apiKey, responseText);
    const audioUrl = URL.createObjectURL(audioBlob);

    playAgedAudio(audioUrl);
    setStatus('', '');

  } catch (err) {
    console.error(err);
    showError(err.message || 'Something went wrong. Check your API key and try again.');
    setStatus('Error — please try again', '');
  }
}

function resetSession() {
  document.getElementById('response-box').style.display = 'none';
  document.getElementById('transcript-box').style.display = 'none';
  resetVisuals();
  setStatus('Hold to record · Click to begin', '');
  document.getElementById('waveform-canvas').classList.remove('visible');
}

function resizeWaveform() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
