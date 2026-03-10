export async function transcribeAudio(apiKey, blob, mimeType) {
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Transcription failed');
    }

    return await response.json();
}

export async function generateResponse(apiKey, transcript, systemPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: transcript }
            ],
            max_tokens: 300,
            temperature: 0.85
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Generation failed');
    }

    return await response.json();
}

export async function generateSpeech(apiKey, text) {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'onyx',
            speed: 0.88
        })
    });

    if (!response.ok) throw new Error('TTS generation failed');

    return await response.blob();
}

export async function generateImage(apiKey, description) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `An atmospheric, cinematic, and slightly melancholic image from the year 2050. The scene should feel grounded yet futuristic, illustrating: ${description}. Film grain, muted colors, Cinestill 800T style, realistic, 16:9 aspect ratio.`,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Image generation failed');
    }

    const data = await response.json();
    return data.data[0].url;
}
