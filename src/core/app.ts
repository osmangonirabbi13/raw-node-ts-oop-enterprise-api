import http, {
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { ResponseHelper } from "./Response.js";
import { RequestParser } from "./RequestParser.js";


export class App {
  private readonly server: Server;

  constructor() {
    this.server = http.createServer(this.handleRequest);
  }

  private handleRequest = async (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> => {
    try {
      const method = req.method;
      const url = req.url;

      if (method === "GET" && url === "/") {
        return ResponseHelper.success(
          res,
          "Welcome to Raw Node.js TypeScript OOP API"
        );
      }

      if (method === "GET" && url === "/health") {
        return ResponseHelper.success(res, "Server is healthy", {
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }

      if (method === "POST" && url === "/echo") {
        const body = await RequestParser.parseJsonBody(req);

        return ResponseHelper.success(res, "Body parsed successfully", {
          body,
        });
      }

      return ResponseHelper.notFound(res);
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