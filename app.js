"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
const utils_1 = require("./utils");
const debug = require('debug')('app');
const app = express_1.default();
app.use(express_1.default.urlencoded({ extended: false }));
if (process.env.NODE_ENV == 'development') {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log(req.url);
        next();
    });
}
app.use('/api', require('./routes/route_api'));
// Rewrite request URL to index.html, if request is not a file
app.use(connect_history_api_fallback_1.default());
// Default handler for all file requests
app.use('/', utils_1.loadStaticFrom('../web-client/release/web_client', 'cache'));
app.listen(3003, '0.0.0.0', () => {
    console.log(`hello world on port 3003`);
});
