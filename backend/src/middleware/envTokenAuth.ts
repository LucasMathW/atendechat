import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";

type TokenPayload = {
  token: string | undefined;
};

const envTokenAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { token: bodyToken } = req.body as TokenPayload;
    const { token: queryToken } = req.query as TokenPayload;

    if (queryToken === process.env.ENV_TOKEN) {
      return next();
    }

    if (bodyToken === process.env.ENV_TOKEN) {
      return next();
    }

    return next(new AppError("Token inválido", 403)); 
  } catch (e) {
    console.log(e);
    return next(e)
  }
};

export default envTokenAuth;
