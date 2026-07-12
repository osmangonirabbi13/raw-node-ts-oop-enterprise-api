import { JsonValue } from "./Response";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: JsonValue;

  constructor(massage : string , statusCode = 500 , details?: JsonValue, isOperational =  true){
    super(massage)

    this.name =  "AppError";
    this.statusCode= statusCode;
    this.isOperational= isOperational

    if(details !== undefined){
        this.details = details
    }

    Error.captureStackTrace(this , this.constructor)

  }


}
