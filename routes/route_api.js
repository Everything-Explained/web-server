"use strict";
const express_1 = require("express");
const utils_1 = require("../utils");
const router = express_1.Router();
router.get('/pageData/:file', (req, res, next) => {
    if (!req.params.file)
        return next();
    req.url = req.params.file;
    res.setHeader('Cache-Control', 'no-cache');
    utils_1.loadStaticFrom('../web-client/release/web_client/_data', 'no-cache')(req, res, next);
});
module.exports = router;
