# Archive of the Future Self

[![Live Site](https://img.shields.io/badge/Live-Site-amber?style=for-the-badge&logo=vercel)](https://AdiKum26.github.io/archive-of-the-future-self/)
[![Video Demo](https://img.shields.io/badge/Video-Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/iP8wX5w4UdQ?si=GG0CSSh0Mg7QiB3H)

An interactive art installation and AI-driven experience that allows users to send messages to their future selves and receive audio-visual "projections" from the year 2050.

## 📺 Project Demo

Watch the walkthrough of the project and see it in action:
**[View on YouTube](https://youtu.be/iP8wX5w4UdQ?si=GG0CSSh0Mg7QiB3H)**

---

## 🌌 Concept

The year is 2026. The world is at a threshold. **Archive of the Future Self** is an interactive portal where users can record a message containing their name, age, beliefs, fears, and dreams. 

Using advanced AI, the system projects these signals 24 years into the future. A simulated version of the user from 2050 — older, weathered, and wise — responds with a personalized audio transmission and a cinematic visual representation of the world they now inhabit.

## ✨ Key Features

- **Voice Memory Recording**: A custom-built recording interface with real-time waveform visualization.
- **Future-Self AI (GPT-4o)**: A sophisticated system prompt that transforms user input into a poetic, grounded, and intimate reflection from 2050.
- **Neural Voice Synthesis**: Text-to-speech post-processed with a custom Web Audio API pipe to add "aging" effects like pitch shifting, low-pass filtering, and spatial reverb.
- **Future Visuals (DALL-E 3)**: Dynamically generates a cinematic 16:9 visualization of the AI's projected future, tailored to the user's specific words.
- **Immersive UI**: A premium, "void-style" aesthetic featuring an animated star field, floating memory echoes, and CRT-style scanline overlays.

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript, CSS3
- **Intelligence**: OpenAI API (Whisper, GPT-4o, TTS, DALL-E 3)
- **Audio Processing**: Web Audio API (Spatial reverb, Biquad filters)
- **Development**: Vite, GitHub Actions

---

## 🔒 Privacy & Usage

- **Direct Communication**: This project communicates directly with OpenAI's API.
- **Security**: API keys are handled securely via environment variables and are never stored on-screen or in plain text.
- **Audio Privacy**: Voice recordings are processed as temporary segments and are not stored permanently by this application.

## 🎨 Acknowledgments

Designed to be a premium, immersive digital artifact. The aesthetics draw inspiration from vintage archival systems and futuristic minimalism.
