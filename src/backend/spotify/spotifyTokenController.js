async function spotifyTokenController(req, res) {
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

module.exports = spotifyTokenController;
