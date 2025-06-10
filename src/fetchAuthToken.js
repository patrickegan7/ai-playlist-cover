const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, '.spotify-token.json');

function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

async function saveTokens(tokens) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
}

async function loadTokens() {
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            const data = fs.readFileSync(TOKEN_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading cached tokens:', error);
    }
    return null;
}

async function refreshAccessToken(refreshToken) {
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
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });

        const tokens = await response.json();
        if (tokens.access_token) {
            // Keep the existing refresh token if a new one wasn't provided
            tokens.refresh_token = tokens.refresh_token || refreshToken;
            await saveTokens(tokens);
            return tokens;
        }
        throw new Error('Failed to refresh token');
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}

async function fetchAuthToken() {
    // Try to load cached tokens first
    const cachedTokens = await loadTokens();
    if (cachedTokens && cachedTokens.refresh_token) {
        const refreshed = await refreshAccessToken(cachedTokens.refresh_token);
        if (refreshed) {
            return { json: () => refreshed };
        }
    }

    // If we couldn't use cached tokens, proceed with the full auth flow
    return new Promise((resolve, reject) => {
        const app = express();
        const server = app.listen(3000, () => {
            console.log('Please visit http://127.0.0.1:3000/login to authenticate with Spotify');
        });

        const state = generateRandomString(16);
        const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';
        
        app.get('/login', (req, res) => {
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: process.env.SPOTIFY_CLIENT_ID,
                scope: scope,
                redirect_uri: 'http://127.0.0.1:3000/callback',
                state: state
            });
            
            res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
        });

        app.get('/callback', async (req, res) => {
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
                        redirect_uri: 'http://127.0.0.1:3000/callback',
                        grant_type: 'authorization_code'
                    })
                });

                const tokens = await response.json();
                await saveTokens(tokens);
                
                res.send('Authentication successful! You can close this window.');
                server.close();
                resolve({ json: () => tokens });
            } catch (error) {
                reject(error);
            }
        });
    });
};

module.exports = fetchAuthToken;
