var express = require('express');
var router = express.Router();
const eventEmitter = require('../eventEmitter');

/* GET home page. */
router.get('/start', function (req, res, next) {
	eventEmitter.emit('start');
	res.end();
});

router.get('/stop', function (req, res, next) {
	eventEmitter.emit('stop');
	res.end();
});
module.exports = router;
