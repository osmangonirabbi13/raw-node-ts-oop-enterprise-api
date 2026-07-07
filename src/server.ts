import http, { type IncomingMessage, type ServerResponse } from "node:http";

const PORT = 4000;

function sendJson(
  res: ServerResponse,
  satusCode: number,
  data: Record<string, unknown>,
): void {
  res.writeHead(satusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function requestHandler(req: IncomingMessage, res: ServerResponse): void {
  const method = req.method;
  const url = req.url;

  if (method === "GET" && url === "/") {
    return sendJson(res, 200, {
      success: true,
      message: "Welcome to Raw Node.js TypeScript API",
    });
  }

  if (method === "GET" && url === "/health") {
    return sendJson(res, 200, {
      success: true,
      message: "Server is healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
  return sendJson(res, 404, {
    success: false,
    message: "Route not found",
  });
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
