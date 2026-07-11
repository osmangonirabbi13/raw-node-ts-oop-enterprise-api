import { AppRequest, AppResponse } from "./HttpTypes";

export type NextFuncation = () => Promise<void>;

export type Middleware = (
  req: AppRequest,
  res: AppResponse,
  next: NextFuncation,
) => void | Promise<void>;

export class MiddlewareManager {
  private readonly middlewares: Middleware[] = [];

  public use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  public async run(
    req: AppRequest,
    res: AppResponse,
    finalHandler: NextFuncation,
  ): Promise<void> {
    let index = -1;

    const dispatch = async (currentIndex: number): Promise<void> => {
      if (currentIndex <= index) {
        throw new Error("next() called multiple times");
      }

      index = currentIndex;

      const middleware = this.middlewares[currentIndex];

      if (!middleware) {
        await finalHandler();
        return;
      }

      await middleware(req, res, () => dispatch(currentIndex + 1));
    };

    await dispatch(0);
  }
}
