// esbuild
import * as esbuild from "esbuild-wasm";
// ... plugins
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugins";
import { fetchPlugin } from "./plugins/fetch-plugin";

// 1) Define service
let service: esbuild.Service;
const bundle = async (rawCode: string) => {
    // 2.1) ... if esbuild isn't initialized, initialize it
    if (!service) {
        // start service and initialize the "service" variable
        service = await esbuild.startService({
            worker: true,
            wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
        });
    }
    // 2.2) Get the transpiled and bundled code!
    try {
        const result = await service.build({
            entryPoints: ["index.js"],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
            define: {
                "process.env.NODE_ENV": '"production"', // alternating quotes are necessary
                global: "window",
            },
            jsxFactory: "_React.createElement",
            jsxFragment: "_React.Fragment",
        });

        // 3) Return the transpiled and bundled code
        return {
            code: result.outputFiles[0].text,
            err: "",
        }
    } catch (err) {
        // This complicated mess was copied and pasted from Gale Udemy.
        // ... If we don't do this, TypeScript can't figure out what type "err" is,
        // ... even though we know it's an error!
        if (err instanceof Error) {
            return {
                code: "",
                err: err.message,
            };
        } else {
            throw err;
        }
    }
};

export default bundle;