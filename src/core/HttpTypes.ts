import { type IncomingMessage, type ServerResponse } from "node:http";

export type RouteParams = Record<string, string>;

export type AppRequest = IncomingMessage & {
  params: RouteParams;
};

export type AppResponse = ServerResponse;
