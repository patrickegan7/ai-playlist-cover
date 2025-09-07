const path = require('path');
const fs = require('fs').promises;

async function getPlaylists(req, res) {
    // Check if user is authenticated
    if (!req.session.spotifyTokens) {
        return res.redirect('/spotify/auth/login');
    }

    try {
        // Get playlists from Spotify API
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${req.session.spotifyTokens.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Generate HTML for playlist selection
        const playlistsHtml = data.items.map(playlist => `
            <div class="playlist-item">
                <img src="${playlist.images[0]?.url || ''}" alt="${playlist.name}" style="width: 100px; height: 100px;">
                <h3>${playlist.name}</h3>
                <p>${playlist.tracks.total} tracks</p>
                <button onclick="generateCover('${playlist.id}')" class="generate-button">Generate Cover</button>
            </div>
        `).join('');

        // Read the template file
        const templatePath = path.join(__dirname, '..', '..', 'frontend', 'playlists.html');
        let template = await fs.readFile(templatePath, 'utf8');
        
        // Insert the playlists HTML into the template
        template = template.replace('<!-- Playlist items will be injected here -->', playlistsHtml);
        
        res.send(template);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).send('Error fetching playlists. Please try again.');
    }
}

async function getPlaylistDataAndGenerateCover(req, res) {
    // Check if user is authenticated
    if (!req.session.spotifyTokens) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const playlistId = req.params.playlistId;
        
        // Get playlist data from Spotify API
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${req.session.spotifyTokens.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const playlist = await response.json();
        
        // TODO: Implement cover generation logic
        
        res.json({ 
            message: 'Cover generation started',
            playlistId,
            playlistName: playlist.name
        });
    } catch (error) {
        console.error('Error generating cover:', error);
        res.status(500).json({ error: 'Failed to generate cover' });
    }
}

module.exports = {
    getPlaylists,
    getPlaylistDataAndGenerateCover
};
