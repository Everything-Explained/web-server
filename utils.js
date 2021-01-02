"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStaticFrom = void 0;
const express_static_gzip_1 = __importDefault(require("express-static-gzip"));
function loadStaticFrom(dir, cache) {
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;
    const options = {
        enableBrotli: true,
        orderPreference: ['br']
    };
    if (cache == 'cache') {
        options.serveStatic = {
            maxAge: thirtyDays
        };
    }
    else
        options.serveStatic = { cacheControl: false };
    return express_static_gzip_1.default(dir, options);
}
exports.loadStaticFrom = loadStaticFrom;
