require('dotenv').config();
const crypto = require('crypto');


function spotifyAuthController(req, res) {
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

module.exports = spotifyAuthController;