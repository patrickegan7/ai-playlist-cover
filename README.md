# ai-playlist-cover

## Overview

**ai-playlist-cover** is a Node.js tool that uses AI to generate unique, visually compelling cover art for your Spotify playlists. By analyzing your playlist’s name, description, and tracklist, it creates a vivid image prompt and generates cover art using OpenAI’s DALL·E 3 model. This project is ideal for music lovers and playlist curators who want to give their playlists a personalized, professional look.

## How It Works

1. **Spotify Integration:** Authenticates with Spotify to access your playlists and retrieve track information.
2. **Prompt Engineering:** Condenses playlist metadata and tracklist into a creative visual prompt using GPT-4o.
3. **AI Image Generation:** Uses OpenAI’s DALL·E 3 to generate a 1024x1024 cover image based on the prompt.
4. **Output:** Saves the generated cover art as a PNG file in the `output/` directory.

## Features
- CLI-based workflow (interactive prompts)
- Secure API key management via `.env` file
- Supports custom playlist selection
- Outputs high-quality, AI-generated cover art

## Requirements
- Node.js (v18 or newer recommended)
- A Spotify Developer account (for API credentials)
- OpenAI API key (for image generation)

## Getting Started

### 1. Clone the Repository

```zsh
git clone https://github.com/yourusername/ai-playlist-cover.git
cd ai-playlist-cover
```

### 2. Install Dependencies

```zsh
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```zsh
cp .env.example .env
```

Edit `.env` and add your Spotify and OpenAI API keys:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the Application

```zsh
npm start
```

Follow the CLI prompts to select a playlist and generate your cover art. The resulting image will be saved in the `output/` directory.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [OpenAI](https://openai.com/) for DALL·E 3 and GPT-4o
- [Spotify](https://developer.spotify.com/) for the playlist API
- [HuggingFace](https://huggingface.co/) for additional AI tools