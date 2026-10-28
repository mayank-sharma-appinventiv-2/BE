import { RedisProvider } from "./providers/redis/RedisProvider.js";
import express, { type Express } from "express";
import { ApiRoutes } from "./routes/ApiRoutes.js";
import { ErrorMiddleware } from "./middlewares/ErrorMiddleware.js";
import { Config } from "./constants/config.js";
import { DatabaseProvider } from "./providers/database/DatabaseProvider.js";

class Server {
    private port!: number;
    private app:Express = express();

    constructor() {
        this.initialize();
    }

    async initialize() {
        this.port = Config.env.PORT;
        this.app.use(express.json());
        await DatabaseProvider.connect();
        await RedisProvider.connect();
        this.app.use("/api", new ApiRoutes().router);
        this.app.use(new ErrorMiddleware().handle);
        this.startServer();
    }
 
    startServer() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

}

new Server();
