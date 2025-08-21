const express = require('express');
const router = express.Router();

const spotifyAuthController = require('./spotifyAuthController');
const spotifyTokenController = require('./spotifyTokenController');

router.get('/login', spotifyAuthController);
router.get('/callback', spotifyTokenController);

module.exports = router;