import http, {
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { type AppRequest } from "./HttpTypes.js";
import { RequestParser } from "./RequestParser.js";
import { ResponseHelper } from "./Response.js";
import { Router } from "./Router.js";

export class App {
  private readonly server: Server;
  private readonly router: Router;

  constructor() {
    this.router = new Router();
    this.registerRoutes();

    this.server = http.createServer(this.handleRequest);
  }

  private registerRoutes(): void {
    this.router.get("/", (_req, res) => {
      return ResponseHelper.success(
        res,
        "Welcome to Raw Node.js TypeScript OOP API"
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
  }

  private getSingleQueryValue(value: string | string[] | undefined): string | null {
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
    res: ServerResponse
  ): Promise<void> => {
    try {
      const appReq = req as AppRequest;
      appReq.params = {};
      appReq.query = {};

      await this.router.handle(appReq, res);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error";

      if (message === "Invalid JSON body") {
        return ResponseHelper.badRequest(res, message);
      }

      if (message === "Request body too large") {
        return ResponseHelper.error(res, message, 413);
      }

      return ResponseHelper.error(res, "Internal server error", 500);
    }
  };

  public listen(port: number): void {
    this.server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}