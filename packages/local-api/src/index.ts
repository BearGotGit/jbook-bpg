import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { createCellsRouter } from "./routes/cells";

export const serve = (port: number,
    filename: string,
    dir: string,
    useProxy: boolean) => {
    const app = express();

    app.use(createCellsRouter(filename, dir));

    // If in development mode
    if (useProxy) {
        app.use(createProxyMiddleware({
            // FIXME: what's the deal with the below!? So weird!!!
            // target: `http://localhost:3000`,
            target: "http://127.0.0.1:3000",
            ws: true,
            logLevel: "silent",
        }));
    }
    // else in production mode
    else {
        // Here's some wonky code: For explanation go to lecture 301. Instructor says it's bad, but this is still way better than the Promise<void> bs from below imo.
        const packagePath = require.resolve("@jsnote-bpg/local-client/build/index.html");
        app.use(express.static(path.dirname(packagePath)));
    }

    // Somewhat wacky code: refer to lecture 294. This is to get "express to work in an async/await kind of world" because there's a try-catch block that needs to await on serve to complete in the try block.
    return new Promise<void>((resolve, reject) => {
        app.listen(port, resolve).on("error", reject);
    })
}