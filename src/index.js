require("dotenv").config();
const fetchAuthToken = require('./fetchAuthToken');
const spotifyRequest = require('./spotifyApi');
const fs = require('fs');
const path = require('path');
const generatePlaylistCover = require('./generatePlaylistCover');

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

const models = {
    blackForest: 'black-forest-labs/FLUX.1-dev',
    latentConsistency: 'latent-consistency/lcm-lora-sdxl',
    stabilityAi: 'stabilityai/stable-diffusion-3-medium-diffusers',
};

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

        // Write the songs to a json file
        fs.writeFileSync(`${playlistName.replace(/[^a-zA-Z0-9]/g, '_')}.json`, JSON.stringify(playlistTracks, null, 2));

        for (const modelName in models) {
            const model = models[modelName];
            try {
                console.log(`Generating image for playlist "${playlistName}" using model "${modelName}"...`);
                const playlistCoverBlob = await generatePlaylistCover(playlistTracks, playlistDescription, model);
                const buffer = Buffer.from(await playlistCoverBlob.arrayBuffer());
                const filename = `${outputDir}/${playlistName.replace(/[^a-zA-Z0-9]/g, '_')}_${modelName}.png`;
                fs.writeFileSync(filename, buffer);
                console.log(`Playlist cover generated and saved as ${filename}`);
            } catch (error) {
                console.error(`Error generating image for playlist "${playlistName}" with model "${modelName}":`, error);
            }
        }
    }
}

main();
