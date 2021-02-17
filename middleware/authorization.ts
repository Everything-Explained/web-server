import { NextFunction, Request, Response } from "express";
import { getUserState } from "../database/users";


export function catchAuthorization(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let userid = '';

  req.isAuthorized =
    !!(   authHeader
       && authHeader.includes('Bearer ')
       && getUserState(userid = authHeader.split(' ')[1])
       && userid.length > 30)
  ;

  req.id =
      req.isAuthorized ? userid : undefined
  ;

  req.isRed33med =
      !!(req.isAuthorized && (getUserState(userid) == 'code'))
  ;
  next();
}