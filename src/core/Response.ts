import { ServerResponse } from "node:http";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type SuccessPayload = {
  success: true;
  message: string;
  data?: JsonValue;
  meta?: JsonValue;
};

type ErrorPayload = {
  success: false;
  message: string;
  error?: JsonValue;
};

export class ResponseHelper {
  //   <----  main response sender      ---->

  private static send(
    res: ServerResponse,
    statusCode: number,
    payload: SuccessPayload | ErrorPayload,
  ): void {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(payload));
  }

  //   <----   success section      ---->

  public static success(
    res: ServerResponse,
    message: string,
    data?: JsonValue,
    statusCode = 200,
  ): void {
    const payload: SuccessPayload = {
      success: true,
      message,
    };

    if (data != undefined) {
      payload.data = data;
    }

    this.send(res, statusCode, payload);
  }

  public static created(
    res: ServerResponse,
    message: string,
    data?: JsonValue,
  ): void {
    this.success(res, message, data, 201);
  }

  //   <----   error section      ---->

  public static error(
    res: ServerResponse,
    message: string,
    statusCode = 500,
    error?: JsonValue,
  ): void {
    const payload: ErrorPayload = {
      success: false,
      message,
    };

    if (error !== undefined) {
      payload.error = error;
    }

    this.send(res, statusCode, payload);
  }

  public static notFound(
    res: ServerResponse,
    message = "Route not found",
  ): void {
    this.error(res, message, 404);
  }

  public static badRequest(
    res: ServerResponse,
    message = "Bad request",
    error?: JsonValue,
  ): void {
    this.error(res, message, 400, error);
  }

  public static unauthorized(
    res: ServerResponse,
    message = "Unauthorized",
  ): void {
    this.error(res, message, 401);
  }

  public static forbidden(res: ServerResponse, message = "Forbidden"): void {
    this.error(res, message, 403);
  }
}
