// the routes contains different folders like v1, v2,... for api versioning containing different versions of api

const express = require('express');

const v1Routes = require('./v1');

const router = express.Router();

router.use('/v1', v1Routes);

module.exports = router;