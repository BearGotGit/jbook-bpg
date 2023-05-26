import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

// Great! This will help us store information in
// ... the browser? But what does it do? (Lecture 9.90 @ 0:57)
const fileCache = localForage.createInstance({
    name: "filecache",
});

export const fetchPlugin = (inputCode: string) => {
    return {
        name: 'fetch-plugin',
        setup(build: esbuild.PluginBuild) {
            // Case with "index.js"
            build.onLoad({ filter: /^index\.js$/ }, async (args: any) => {
                // case 1: index.js
                return {
                    loader: "jsx",
                    contents: inputCode,
                };
            });
            // this is called if not "index.js"
            build.onLoad({ filter: /.*/ }, async (args: any) => {
                // case (pre-test) CACHE: 
                // ... have we already downloaded this file???
                const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
                // If in cache, return immediately,
                if (cachedResult) {
                    return cachedResult;
                }
            });
            // CONTINUE ON if we had no cached data to return!
            build.onLoad({ filter: /.css$/ }, async (args: any) => {
                const { data, request } = await axios.get(args.path);

                // this does not work to escape ALL css code.
                const escaped = data.
                    replace(/\n/g, '').
                    replace(/"/g, '\\"').
                    replace(/'/g, "\\'");
                const contents = `
                    const style = document.createElement('style');
                    style.innerText = '${escaped}';
                    document.head.appendChild(style);
                `;
                // (key, value) pair: args.path is like the URL: it's a 
                // ... good idea to use as the key (it's generally unique).
                // Instead of using data as the value, instead use the return
                // object for some reason.
                const result: esbuild.OnLoadResult = {
                    loader: "jsx",
                    contents: contents,
                    resolveDir: new URL("./", request.responseURL).pathname,
                };

                await fileCache.setItem(args.path, result);
                // return the data!, load it with possibly jsx
                return result;
                // removed the else case that, basically,
                // ... just provided hard-coded .. code ..
                // ... that allowed us to "import" stuff.
                // It was purely a demonstration of ESBuild's
                // ... ability to bundle stuff, but, now,
                // ... we're going to do better by 
                // ... dynamically fetching modules (Lecture 78)! 
            });
            build.onLoad({ filter: /.*/ }, async (args: any) => {
                const { data, request } = await axios.get(args.path);

                // (key, value) pair: args.path is like the URL: it's a 
                // ... good idea to use as the key (it's generally unique).
                // Instead of using data as the value, instead use the return
                // object for some reason.
                const result: esbuild.OnLoadResult = {
                    loader: "jsx",
                    contents: data,
                    resolveDir: new URL("./", request.responseURL).pathname,
                };

                await fileCache.setItem(args.path, result);
                // return the data!, load it with possibly jsx
                return result;
                // removed the else case that, basically,
                // ... just provided hard-coded .. code ..
                // ... that allowed us to "import" stuff.
                // It was purely a demonstration of ESBuild's
                // ... ability to bundle stuff, but, now,
                // ... we're going to do better by 
                // ... dynamically fetching modules (Lecture 78)! 
            });
        }
    };
};