const express = require('express');
const session = require('express-session');
const path = require('path');
const spotifyAuthRouter = require('./spotify/spotifyAuthRoutes');
const playlistRouter = require('./playlists/playlistRoutes');

function main() {
    const app = startServer();
    
    app.use(express.static(path.join(__dirname, '../frontend')));
    app.use('/spotify/auth', spotifyAuthRouter);
    app.use('/playlists', playlistRouter);
}

function startServer() {
    const app = express();
    const port = 3000;

    app.use(session({
        secret: process.env.EXPRESS_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true
        }
    }));

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

    return app;
}

main();