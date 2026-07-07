import http, { IncomingMessage, Server, ServerResponse } from "node:http";
import { ResponseHelper } from "./Response";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonResponse = {
  success: boolean;
  message: string;
  data?: JsonValue;
  error?: JsonValue;
  uptime?: number;
  timestamp?: string;
};

export class App {
  private readonly server: Server;

  constructor() {
    this.server = http.createServer(this.handleRequest);
  }

  // private sendJson(
  //   res: ServerResponse,
  //   statusCode: number,
  //   payload: JsonResponse,
  // ): void {
  //   res.writeHead(statusCode, { "Content-Type": "application/json" });

  //   res.end(JSON.stringify(payload));
  // }

  private handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
    const method = req.method;
    const url = req.url;

    if (method === "GET" && url === "/") {
      return ResponseHelper.success(
        res,
        "Welcome to Raw Node.js TypeScript OOP API",
      );
    }

    if (method === "GET" && url === "/health") {
      return ResponseHelper.success(res, "Server is healthy", {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }

    return ResponseHelper.notFound(res);
  };

  public listen(port: number): void {
    this.server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}
