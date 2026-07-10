import { ResponseHelper } from "./Response.js";
import {
  type AppRequest,
  type AppResponse,
  type QueryParams,
  type RouteParams,
} from "./HttpTypes.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteHandler = (
  req: AppRequest,
  res: AppResponse
) => void | Promise<void>;

type Route = {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
};

type MatchResult = {
  matched: boolean;
  params: RouteParams;
};

type ParsedUrl = {
  pathname: string;
  query: QueryParams;
};

export class Router {
  private readonly routes: Route[] = [];

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

  private register(
    method: HttpMethod,
    path: string,
    handler: RouteHandler
  ): void {
    this.routes.push({
      method,
      path,
      handler,
    });
  }

  public async handle(req: AppRequest, res: AppResponse): Promise<void> {
    const method = req.method as HttpMethod | undefined;
    const parsedUrl = this.parseUrl(req.url);

    req.query = parsedUrl.query;

    if (!method) {
      return ResponseHelper.badRequest(res, "HTTP method is missing");
    }

    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }

      const matchResult = this.matchPath(route.path, parsedUrl.pathname);

      if (matchResult.matched) {
        req.params = matchResult.params;
        await route.handler(req, res);
        return;
      }
    }

    return ResponseHelper.notFound(res);
  }

  private parseUrl(url: string | undefined): ParsedUrl {
    if (!url) {
      return {
        pathname: "/",
        query: {},
      };
    }

    const parsedUrl = new URL(url, "http://localhost");

    return {
      pathname: parsedUrl.pathname,
      query: this.parseQuery(parsedUrl.searchParams),
    };
  }

  private parseQuery(searchParams: URLSearchParams): QueryParams {
    const query: QueryParams = {};

    for (const [key, value] of searchParams.entries()) {
      const existingValue = query[key];

      if (existingValue === undefined) {
        query[key] = value;
        continue;
      }

      if (Array.isArray(existingValue)) {
        existingValue.push(value);
        continue;
      }

      query[key] = [existingValue, value];
    }

    return query;
  }

  private matchPath(routePath: string, requestPath: string): MatchResult {
    const routeParts = this.splitPath(routePath);
    const requestParts = this.splitPath(requestPath);

    if (routeParts.length !== requestParts.length) {
      return {
        matched: false,
        params: {},
      };
    }

    const params: RouteParams = {};

    for (let index = 0; index < routeParts.length; index += 1) {
      const routePart = routeParts[index];
      const requestPart = requestParts[index];

      if (!routePart || !requestPart) {
        return {
          matched: false,
          params: {},
        };
      }

      if (routePart.startsWith(":")) {
        const paramName = routePart.slice(1);

        if (!paramName) {
          return {
            matched: false,
            params: {},
          };
        }

        params[paramName] = decodeURIComponent(requestPart);
        continue;
      }

      if (routePart !== requestPart) {
        return {
          matched: false,
          params: {},
        };
      }
    }

    return {
      matched: true,
      params,
    };
  }

  private splitPath(path: string): string[] {
    return path.split("/").filter(Boolean);
  }
}