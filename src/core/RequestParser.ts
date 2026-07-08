import { IncomingMessage } from "node:http";
import { Buffer } from "node:buffer";

export class RequestParser {
  private static readonly MAX_BODY_SIZE = 1024 * 1024; // 1MB

  public static parseJsonBody<T = any>(req: IncomingMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      let body = "";
      let bodySize = 0;

      req.on("data", (chunk: Buffer) => {
        bodySize += chunk.length;

        if (bodySize > this.MAX_BODY_SIZE) {
          reject(new Error("Request body too large"));
          req.destroy();
          return;
        }

        body += chunk.toString("utf-8");
      });

      req.on("end", () => {
        if (!body.trim()) {
          resolve({} as T);
          return;
        }

        try {
          const parsedBody = JSON.parse(body) as T;
          resolve(parsedBody);
        } catch {
          reject(new Error("Invalid JSON body"));
        }
      });

      req.on("error", () => {
        reject(new Error("Unable to read request body"));
      });
    });
  }
}
