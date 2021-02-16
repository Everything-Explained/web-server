import { NextFunction, Request, Response } from "express";
import { getUserState } from "../database/users";

export function catchAuthorization(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  req.isAuthorized =
    !!(   authHeader
       && authHeader.includes('Bearer ')
       && getUserState(authHeader.split(' ')[1]))
  ;
  next();
}