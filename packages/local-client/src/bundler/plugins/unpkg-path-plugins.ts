import * as esbuild from "esbuild-wasm";

export const unpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // Resolves "index.js"
      // ... "Handle root entry file of 'index.js'"
      build.onResolve({ filter: /^index\.js$/ }, () => {
        return {
          namespace: "a",
          path: "index.js",
        };
      });
      // Resolves nested module directories (case w/ : "./"  "../")
      // ... "Handle relative paths in a module"
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: "a",
          path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/").href,
        };
      });
      // Resolves packages; big stuff: not index, nor directories
      // ... "Handle main file of a module"
      build.onResolve({ filter: /.*/ }, (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};
