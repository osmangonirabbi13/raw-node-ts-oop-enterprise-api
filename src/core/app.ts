import http, {
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { ResponseHelper } from "./Response.js";
import { RequestParser } from "./RequestParser.js";
import { Router } from "./Router.js";

export class App {
  private readonly server: Server;
  private readonly router: Router;

  constructor() {
    this.server = http.createServer(this.handleRequest);
    this.router = new Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get("/", (req, res) => {
      return ResponseHelper.success(
        res,
        "Welcome to Raw Node.js TypeScript OOP API",
      );
    });

    this.router.get("/health", (req, res) => {
      return ResponseHelper.success(res, "Server is healthy", {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    this.router.post("/echo", async (req, res) => {
      const body = await RequestParser.parseJsonBody(req);

      return ResponseHelper.success(res, "Body parsed successfully", { body });
    });
  }

  private handleRequest = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    try {
      await this.router.handle(req, res);
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
