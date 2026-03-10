export function getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

export async function playAgedAudio(url) {
    const dot = document.getElementById('response-playing-dot');
    if (dot) dot.style.display = 'inline';

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Convolver for subtle reverb (space/distance effect)
    const convolver = ctx.createConvolver();
    const impulseLength = ctx.sampleRate * 1.5;
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
        const d = impulse.getChannelData(c);
        for (let i = 0; i < impulseLength; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2.5);
        }
    }
    convolver.buffer = impulse;

    // EQ: slight low-pass to warm/age the voice
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3800;
    lowpass.Q.value = 0.8;

    // Very slight high-pass to remove low rumble
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 80;

    // Slight pitch shift down via playback rate
    source.playbackRate.value = 0.96;

    // Dry/wet mix for reverb
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.value = 0.82;
    wetGain.gain.value = 0.18;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(dryGain);
    lowpass.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);

    source.start();
    source.onended = () => {
        if (dot) dot.style.display = 'none';
        ctx.close();
        URL.revokeObjectURL(url);
    };
}
