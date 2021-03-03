import { NextFunction, Request, Response } from "express";
import { getUserState } from "../database/users";


export function catchAuthorization(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let userID    : string = '';
  let userState : string|undefined = '';

  req.hasValidID =
    !!(    authHeader
        && authHeader.includes('Bearer ')
        && (userID = authHeader.split(' ')[1])
        && userID.trim().length)
  ;

  req.id = req.hasValidID ? userID : undefined;

  req.isAuthorized = !!(req.hasValidID && (userState = getUserState(userID)));

  req.isRed33med =
      !!(req.isAuthorized && (userState == 'code'))
  ;
  next();
}