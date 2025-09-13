require('dotenv').config();
const crypto = require('crypto');

function login(req, res) {
    const scope = 'playlist-read-private playlist-read-collaborative';
    const state = crypto.randomBytes(8).toString('hex').slice(0, 16);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: state
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    res.redirect(authUrl);
}

async function callback(req, res) {
    const code = req.query.code;

    if (!code) {
        console.error('No authorization code returned from Spotify');
        return res.redirect(`${process.env.FRONTEND_URL}/error?message=No code from Spotify`);
    }

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
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Spotify token exchange failed:', response.status, text);
            return res.redirect(`${process.env.FRONTEND_URL}/error?message=Failed to exchange code`);
        }

        const data = await response.json();

        // Store token data in session
        req.session.spotifyTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type
        };

        res.redirect('/playlists');

    } catch (err) {
        console.error('Unexpected error exchanging code for tokens:', err);
        res.redirect(`${process.env.FRONTEND_URL}/error?message=Unexpected error`);
    }
}

module.exports = {
    login,
    callback
};
