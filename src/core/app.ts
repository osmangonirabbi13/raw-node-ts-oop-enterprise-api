import http, {
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { type AppRequest } from "./HttpTypes.js";
import { MiddlewareManager, type Middleware } from "./Middleware.js";
import { RequestParser } from "./RequestParser.js";
import { ResponseHelper } from "./Response.js";
import { Router } from "./Router.js";
import { loggerMiddleware } from "../middlewares/logger.middleware.js";
import { ErrorHandler } from "../middlewares/error-handler.middleware.js";

export class App {
  private readonly server: Server;
  private readonly router: Router;
  private readonly middlewareManager: MiddlewareManager;

  constructor() {
    this.router = new Router();
    this.middlewareManager = new MiddlewareManager();

    this.registerMiddlewares();
    this.registerRoutes();

    this.server = http.createServer(this.handleRequest);
  }

  public use(middleware: Middleware): void {
    this.middlewareManager.use(middleware);
  }

  private registerMiddlewares(): void {
    this.use(loggerMiddleware);
  }

  private registerRoutes(): void {
    this.router.get("/", (_req, res) => {
      return ResponseHelper.success(
        res,
        "Welcome to Raw Node.js TypeScript OOP API",
      );
    });

    this.router.get("/health", (_req, res) => {
      return ResponseHelper.success(res, "Server is healthy", {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    this.router.post("/echo", async (req, res) => {
      const body = await RequestParser.parseJsonBody(req);

      return ResponseHelper.success(res, "Body parsed successfully", {
        body,
      });
    });

    this.router.get("/users/:id", (req, res) => {
      const userId = req.params.id;

      if (!userId) {
        return ResponseHelper.badRequest(res, "User id is required");
      }

      return ResponseHelper.success(res, "User route param loaded", {
        params: req.params,
        userId,
      });
    });

    this.router.get("/products", (req, res) => {
      return ResponseHelper.success(res, "Product query params loaded", {
        query: req.query,
        search: this.getSingleQueryValue(req.query.search),
        page: this.getSingleQueryValue(req.query.page),
        limit: this.getSingleQueryValue(req.query.limit),
        sort: this.getSingleQueryValue(req.query.sort),
      });
    });

    this.router.get("/products/:slug", (req, res) => {
      const slug = req.params.slug;

      if (!slug) {
        return ResponseHelper.badRequest(res, "Product slug is required");
      }

      return ResponseHelper.success(res, "Product route param loaded", {
        params: req.params,
        slug,
      });
    });

    this.router.get("/error-test", () => {
      throw new Error("This is unexpected error test");
    });
  }

  private getSingleQueryValue(
    value: string | string[] | undefined,
  ): string | null {
    if (value === undefined) {
      return null;
    }

    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value;
  }

  private handleRequest = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    try {
      const appReq = req as AppRequest;
      appReq.params = {};
      appReq.query = {};

      await this.middlewareManager.run(appReq, res, async () => {
        await this.router.handle(appReq, res);
      });
    } catch (error) {
      ErrorHandler.handle(error, res);
    }
  };

  public listen(port: number): void {
    this.server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}
