const floatWords = [
    '2050', 'MEMORY', 'THRESHOLD', 'IDENTITY', 'TIME',
    'VOICE', 'FUTURE', 'ARCHIVE', 'SELF', 'BECOMING',
    'SIGNAL', 'ECHO', 'TOMORROW', 'DATA', 'SOUL',
    'CHANGE', 'LIGHT', 'REMAIN', 'CARRY', 'KNOW'
];

export function spawnFloatWord(word) {
    const layer = document.getElementById('floating-text-layer');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'float-word';
    el.textContent = word || floatWords[Math.floor(Math.random() * floatWords.length)];
    el.style.left = (5 + Math.random() * 85) + '%';
    el.style.top = (20 + Math.random() * 60) + '%';
    el.style.opacity = '0';
    el.style.fontSize = (10 + Math.random() * 10) + 'px';
    el.style.animationDuration = (6 + Math.random() * 4) + 's';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 12000);
}

export function spawnResponseWords(text) {
    const words = text.split(' ').filter(w => w.length > 4);
    words.forEach((w, i) => {
        setTimeout(() => spawnFloatWord(w.toUpperCase().replace(/[^A-Z]/g, '')), i * 400);
    });
}

export function setStatus(msg, cls) {
    const el = document.getElementById('mic-status');
    if (!el) return;
    el.textContent = msg || 'Hold to record · Click to begin';
    el.className = 'mic-status' + (cls ? ' ' + cls : '');
}

export function showError(msg) {
    const toast = document.getElementById('error-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 5000);
}

export async function updateFutureImage(imgUrl) {
    const img = document.getElementById('future-image');
    const container = document.getElementById('response-visual-container');
    const loader = document.getElementById('visual-loading');
    if (!img || !container || !loader) return;

    container.style.display = 'block';
    loader.style.display = 'block';
    img.style.opacity = '0';

    img.src = imgUrl;
    img.onload = () => {
        loader.style.display = 'none';
        img.style.opacity = '1';
    };
}

export function resetVisuals() {
    const container = document.getElementById('response-visual-container');
    const img = document.getElementById('future-image');
    if (container) container.style.display = 'none';
    if (img) img.src = '';
}
