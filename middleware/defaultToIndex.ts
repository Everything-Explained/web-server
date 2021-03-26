import {  Request, Response, NextFunction } from "express";

export function defaultToIndex(req: Request, res: Response, next: NextFunction) {
  if (~req.url.indexOf('.')) return next();
  req.url = '/index.html';
  next();
}



