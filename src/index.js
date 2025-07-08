require("dotenv").config();
const fetchAuthToken = require('./fetchAuthToken');
const spotifyRequest = require('./spotifyApi');
const fs = require('fs');
const path = require('path');
const generatePlaylistCover = require('./generatePlaylistCover');
const OpenAI = require('openai');

// Returns an array of songs from a given playlist. Each entry in the array
// is an object with the song's name, artist, and album.
// Example: [{ name: 'Song Name', artist: 'Artist Name', album: 'Album Name' }, ...]
function getSongsFromPlaylist(playlist) {
    const songs = [];

    let currentPage = playlist;
    while (currentPage) {
        for (const item of playlist.items) {
            const track = item.track;
            if (track) {
                const song = {
                    name: track.name,
                    artist: track.artists.map(artist => artist.name).join(', '),
                    album: track.album.name
                };
                songs.push(song);
            }
        }

        currentPage = currentPage.next;
    }

    return songs;
}

// Helper to get a condensed prompt from GPT-4o using the custom compression prompt
async function getCondensedPrompt(playlistTracks, playlistDescription, playlistName) {
    const compressionPrompt = fs.readFileSync(path.join(__dirname, '../prompts/compression-prompt.txt'), 'utf8');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    // Prepare user input for the prompt
    const userInput = `Title: ${playlistName}\nDescription: ${playlistDescription || ''}\nTracks: ${playlistTracks.slice(0, 80).map(t => `${t.name} by ${t.artist}`).join('; ')}`;
    const prompt = `${compressionPrompt}\n${userInput}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.9,
    });
    return response.choices[0].message.content.trim();
}

// Load playlists from external config file
const playlists = JSON.parse(fs.readFileSync(path.join(__dirname, '../playlists.json'), 'utf8'));

async function main() {
    const authResponse = await fetchAuthToken();
    const token = await authResponse.json();

    // Get the user's Spotify ID
    const userResponse = await spotifyRequest('/me', { token: token.access_token });
    const userData = await userResponse.json();
    const userId = userData.id;

    // Ensure the output directory exists
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    for (const playlist of playlists) {
        const playlistId = playlist.id;
        const playlistName = playlist.name;
        const playlistDescription = playlist.description;

        const playlistResponse = await spotifyRequest(`/playlists/${playlistId}/tracks`, { token: token.access_token });
        const playlistJson = await playlistResponse.json();
        const playlistTracks = getSongsFromPlaylist(playlistJson);

        // Write the songs to a json file (no timestamp)
        fs.writeFileSync(`${playlistName.replace(/[^a-zA-Z0-9]/g, '_')}.json`, JSON.stringify(playlistTracks, null, 2));

        // Get condensed prompt from GPT-4o
        let condensedPrompt;
        try {
            condensedPrompt = await getCondensedPrompt(playlistTracks, playlistDescription, playlistName);
            console.log(`Condensed prompt for "${playlistName}":`, condensedPrompt);
        } catch (error) {
            console.error(`Error getting condensed prompt for playlist "${playlistName}":`, error);
            continue;
        }

        // Only use DALL-E 3 (dalle-3) for image generation
        try {
            console.log(`Generating image for playlist "${playlistName}" using DALL-E 3...`);
            const b64 = await generatePlaylistCover(condensedPrompt, 'dall-e-3');
            const buffer = Buffer.from(b64, 'base64');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${outputDir}/${playlistName.replace(/[^a-zA-Z0-9]/g, '_')}_dall-e-3_${timestamp}.png`;
            fs.writeFileSync(filename, buffer);
            console.log(`Playlist cover generated and saved as ${filename}`);
        } catch (error) {
            console.error(`Error generating image for playlist "${playlistName}" with DALL-E 3:`, error);
        }
    }
}

main();
