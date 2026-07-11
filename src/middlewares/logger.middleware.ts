import { Middleware } from "../core/Middleware";

export const loggerMiddleware: Middleware = async (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log(
      `${req.method ?? "UNKNOWN"} ${req.url ?? "/"} ${res.statusCode} - ${duration}ms`,
    );
  });
  await next()
};
