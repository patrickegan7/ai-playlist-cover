const express = require('express');
const router = express.Router();
const { getPlaylists, getPlaylistDataAndGenerateCover } = require('./playlistsController');

// GET /playlists/
router.get('/', getPlaylists);

// POST /playlists/:playlistId/cover
router.post('/:playlistId/cover', getPlaylistDataAndGenerateCover);

module.exports = router;
