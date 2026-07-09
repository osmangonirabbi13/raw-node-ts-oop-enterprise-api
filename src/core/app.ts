import http, {
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { ResponseHelper } from "./Response";
import { RequestParser } from "./RequestParser";
import { AppRequest } from "./HttpTypes";
import { Router } from "./Router";


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
      return ResponseHelper.success(res, "User route param loaded", {
        params: req.params,
        userId: req.params.id,
      });
    });

    this.router.get("/products/:slug", (req, res) => {
      return ResponseHelper.success(res, "Product route param loaded", {
        params: req.params,
        slug: req.params.slug,
      });
    });
  }

  private handleRequest = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    try {
      const appReq = req as AppRequest;
      appReq.params = {};

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
