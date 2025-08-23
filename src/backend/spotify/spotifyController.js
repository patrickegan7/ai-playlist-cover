require('dotenv').config();
const crypto = require('crypto');

function login(req, res) {
    const scope = 'playlist-read-private playlist-read-collaborative';
    const state = crypto.randomBytes(8).toString('hex').slice(0, 16);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: 'http://127.0.0.1:3000/spotify/callback',
        state: state
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    res.redirect(authUrl);
}

async function callback(req, res) {
    const code = req.query.code;
    
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
                ).toString('base64')
            },
            body: new URLSearchParams({
                code: code,
                redirect_uri: 'http://127.0.0.1:3000/spotify/callback',
                grant_type: 'authorization_code'
            })
        });

        // Store tokens in session
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Error exchanging code for tokens:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}/error?message=Failed to authenticate with Spotify`);
    }
}

module.exports = {
    login,
    callback
};
