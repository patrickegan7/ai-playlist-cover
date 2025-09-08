# AI Playlist Cover

## Overview

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-5.1.0-blue)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/openai-5.2.0-orange)](https://openai.com/)

## Overview

**AI Playlist Cover** is a web application that uses AI to generate unique, visually compelling cover art for your Spotify playlists. By analyzing your tracklist it creates a vivid image prompt and generates cover art using OpenAI's DALL·E 3 model.

## How It Works

1. **Spotify Integration:** Authenticates with Spotify to access your playlists and retrieve track information.
2. **Prompt Engineering:** Condenses playlist metadata and tracklist into a creative visual prompt using GPT-4o-mini.
3. **AI Image Generation:** Uses OpenAI’s DALL·E 3 to generate a 1024x1024 cover image based on the prompt.

## Prerequisites

- Node.js (v18 or newer)
- A Spotify Developer account with registered application
- OpenAI API key
- Modern web browser

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/patrickegan7/ai-playlist-cover.git
   cd ai-playlist-cover
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials:
   ```
   # Spotify API credentials
   SPOTIFY_CLIENT_ID='your_spotify_client_id'
   SPOTIFY_CLIENT_SECRET='your_spotify_client_secret'
   SPOTIFY_REDIRECT_URI='http://127.0.0.1:3000/spotify/callback'

   # OpenAI API credentials
   OPENAI_API_KEY='your_openai_api_key'

   # Express session secret
   EXPRESS_SESSION_SECRET='your_session_secret'
   ```

## Usage

1. **Start the Server**
   ```bash
   npm start
   ```
   The server will start on http://localhost:3000

2. **Access the Application**
   - Open your browser and navigate to http://localhost:3000
   - Log in with your Spotify account
   - Select a playlist, provide a description, and generate its cover art!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
