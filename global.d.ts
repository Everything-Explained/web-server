declare namespace Express {
  interface Request {
    hasValidID: boolean;
    isAuthorized: boolean;
    isRed33med: boolean;
    id?: string;
  }
}