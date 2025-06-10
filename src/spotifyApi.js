const spotifyApiDomain = require('./spotifyApiDomain');

async function spotifyRequest(endpoint, { method = 'GET', token, body } = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${spotifyApiDomain}${endpoint}`;
    
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    if (body) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const response = await fetch(url, {
        method,
        headers,
        ...(body && { body: new URLSearchParams(body) })
    });

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return response;
}

module.exports = spotifyRequest;
