import type { Session, User } from "better-auth";
import type { Request } from "express";

export type Context = {
  req: Request;
  session: { user: User; session: Session } | null;
};

export function createContext(
  req: Request,
  session: { user: User; session: Session } | null,
): Context {
  return {
    req,
    session,
  };
}
