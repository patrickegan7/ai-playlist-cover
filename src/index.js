require("dotenv").config();
const fetchAuthToken = require('./fetchAuthToken');
const spotifyRequest = require('./spotifyApi');
const fs = require('fs');
const path = require('path');
const generatePlaylistCover = require('./generatePlaylistCover');
const OpenAI = require('openai');
const inquirer = require('inquirer');

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

async function main() {
    const authResponse = await fetchAuthToken();
    const token = await authResponse.json();

    // Get the user's Spotify ID
    const userResponse = await spotifyRequest('/me', { token: token.access_token });
    const userData = await userResponse.json();
    const userId = userData.id;

    // Fetch user's playlists from Spotify
    const playlistsResponse = await spotifyRequest(`/users/${userId}/playlists`, { token: token.access_token });
    const playlistsJson = await playlistsResponse.json();
    const playlists = playlistsJson.items;

    // Prompt user to select a playlist
    const playlistChoices = playlists.map(p => ({ name: `${p.name} (${p.tracks.total} tracks)`, value: p.id }));
    const { selectedPlaylistId } = await inquirer.default.prompt([
        {
            type: 'list',
            name: 'selectedPlaylistId',
            message: 'Select a playlist:',
            choices: playlistChoices
        }
    ]);

    // Get selected playlist details
    const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

    // Prompt user for custom cover description
    const { customDescription } = await inquirer.default.prompt([
        {
            type: 'input',
            name: 'customDescription',
            message: 'Enter a description for your playlist cover:'
        }
    ]);

    // Ensure the output directory exists
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Fetch tracks for the selected playlist
    const playlistResponse = await spotifyRequest(`/playlists/${selectedPlaylistId}/tracks`, { token: token.access_token });
    const playlistJson = await playlistResponse.json();
    const playlistTracks = getSongsFromPlaylist(playlistJson);

    // Generate condensed prompt
    const condensedPrompt = await getCondensedPrompt(playlistTracks, customDescription, selectedPlaylist.name);

    // Generate playlist cover image
    const imageBase64 = await generatePlaylistCover(condensedPrompt, 'dall-e-3');
    const outputPath = path.join(outputDir, `${selectedPlaylist.name.replace(/\s+/g, '_')}_dall-e-3.png`);
    fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));
    console.log(`Playlist cover generated and saved to ${outputPath}`);
}

main().catch(err => {
    console.error('Error:', err);
});
