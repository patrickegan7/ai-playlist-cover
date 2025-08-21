const express = require('express');
const path = require('path');
const spotifyRouter = require('./spotify/spotifyRoutes');

function main() {
    const app = startServer();
    
    app.use(express.static(path.join(__dirname, '../frontend')));
    app.use('/spotify', spotifyRouter);
}

function startServer() {
    const app = express();
    const port = 3000;

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

    return app;
}

main();