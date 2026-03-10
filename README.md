# Archive of the Future Self

![Deploy to GitHub Pages](https://github.com/AdiKum26/archive-of-the-future-self/actions/workflows/deploy.yml/badge.svg)

An interactive art installation and AI-driven experience that allows users to send messages to their future selves and receive audio-visual "projections" from the year 2050.


## 🌌 Concept

The year is 2026. The world is at a threshold. **Archive of the Future Self** is an interactive portal where users can record a message containing their name, age, beliefs, fears, and dreams. 

Using advanced AI, the system projects these signals 24 years into the future. A simulated version of the user from 2050 — older, weathered, and wise — responds with a personalized audio transmission and a cinematic visual representation of the world they now inhabit.

## ✨ Features

- **Voice Memory Recording**: A custom-built recording interface with real-time waveform visualization.
- **Whisper Transcription**: High-accuracy voice-to-text conversion via OpenAI's Whisper-1 model.
- **Future-Self AI (GPT-4o)**: A sophisticated system prompt that transforms user input into a poetic, grounded, and intimate reflection from 2050.
- **Neural Voice Synthesis**: Text-to-speech using OpenAI's `tts-1` model, post-processed with a custom Web Audio API pipe to add "aging" effects like pitch shifting, low-pass filtering, and spatial reverb.
- **Future Visuals (DALL-E 3)**: Dynamically generates a cinematic 16:9 visualization of the AI's projected future, tailored to the user's specific words.
- **Immersive UI**: A premium, "void-style" aesthetic featuring an animated star field, floating memory echoes, and CRT-style scanline overlays.

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript, CSS3
- **Build Tool**: [Vite](https://vitejs.dev/)
- **AI Models**:
    - `whisper-1` (Transcription)
    - `gpt-4o` (Reasoning & Character Persona)
    - `tts-1` with `onyx` voice (Speech)
    - `dall-e-3` (Image Generation)
- **Audio Process**: Web Audio API (BiquadFilter, Convolver, Delay)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- An OpenAI API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AdiKum26/archive-of-the-future-self.git
   cd archive-of-the-future-self
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```env
   VITE_OPENAI_API_KEY=your_sk_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## � Deployment

### GitHub Pages (via GitHub Actions)

To host this project on GitHub Pages, use this **Vite Build & Deploy** workflow. This automatically installs dependencies, builds the project, and deploys the `dist` folder.

1.  **Create Workflow**: In your repo, create a file at `.github/workflows/deploy.yml`.
2.  **Paste this Content**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build_site:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    needs: build_site
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

3.  **API Key Configuration**:
    - For the live site to work, you need to add your OpenAI API key to GitHub.
    - Go to your repository on GitHub.
    - Navigate to **Settings** > **Secrets and variables** > **Actions**.
    - Click **New repository secret**.
    - Name: `VITE_OPENAI_API_KEY`
    - Value: `your_sk_key_here`
    - The GitHub Action will now automatically bake this key into the build!

4.  **URL**: Site live at `https://AdiKum26.github.io/archive-of-the-future-self/`.

## �🔒 Privacy & API Usage

- This project communicates directly with OpenAI's API.
- Your API key is stored locally in your `.env` file and is never exposed to external servers except OpenAI.
- Audio recordings are processed as temporary blobs and are not stored permanently by this application.

## 🎨 Acknowledgments

Designed to be a premium, immersive digital artifact. The aesthetics draw inspiration from vintage archival systems and futuristic minimalism.
