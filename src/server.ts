import { env } from "./config/env";
import { App } from "./core/app";



const app = new App();

app.listen(env.PORT)
