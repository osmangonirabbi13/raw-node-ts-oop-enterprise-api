import { type IncomingMessage, type ServerResponse } from "node:http";

export type RouteParams = Record<string, string>;

export type QueryValue = string | string[]

export type QueryParams =Record<string  , QueryValue>

export type AppRequest = IncomingMessage & {
  params: RouteParams;
  query : QueryParams
};

export type AppResponse = ServerResponse;
