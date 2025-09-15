const express = require('express');
const { registerAttendee } = require('../controllers/registration.controller');
const router = express.Router();

router.post('/', registerAttendee);

module.exports = router;
