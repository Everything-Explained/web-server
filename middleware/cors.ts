import { NextFunction, Request, Response } from "express";

const debug = require('debug')('ee:cors');

/**
 * Access-Control-Allow-Origin header assignment
 */
export function allowOrigin(origin: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', origin);
    debug('Request:', req.url);
    next();
  };
}