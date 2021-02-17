declare namespace Express {
  interface Request {
    isAuthorized: boolean;
    isRed33med: boolean;
    id?: string;
  }
}