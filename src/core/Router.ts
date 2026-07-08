import { IncomingMessage, ServerResponse } from "node:http";
import { ResponseHelper } from "./Response";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => void | Promise<void>;

type Route = {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
};

export class Router {
  private readonly routes: Route[] = [];

  private register(
    method: HttpMethod,
    path: string,
    handler: RouteHandler,
  ): void {
    this.routes.push({
      method,
      path,
      handler,
    });
  }

  private getPathname(url: string | undefined): string {
    if (!url) {
      return "/";
    }

    const parsedUrl = new URL(url, "http://localhost");

    return parsedUrl.pathname;
  }

  public get(path: string, handler: RouteHandler): void {
    this.register("GET", path, handler);
  }

  public post(path: string, handler: RouteHandler): void {
    this.register("POST", path, handler);
  }

  public put(path: string, handler: RouteHandler): void {
    this.register("PUT", path, handler);
  }

  public patch(path: string, handler: RouteHandler): void {
    this.register("PATCH", path, handler);
  }

  public delete(path: string, handler: RouteHandler): void {
    this.register("DELETE", path, handler);
  }

  public async handle(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const method = req.method as HttpMethod;
    const path = this.getPathname(req.url);

    if (!method) {
      return ResponseHelper.badRequest(res, "HTTP method is missing");
    }

    const matchedRoute = this.routes.find((route) => {
      return route.method === method && route.path === path;
    });

    if (!matchedRoute) {
      return ResponseHelper.notFound(res);
    }

    await matchedRoute.handler(req, res);
  }
}
