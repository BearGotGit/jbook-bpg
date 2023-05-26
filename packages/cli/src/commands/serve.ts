import { Command } from "commander";
import { serve } from "@jsnote-bpg/local-api";
import path from "path";

interface LocalApiError {
    code: string;
}

/* This is a very interesting from lecture 303--watch the lecture to understand this!
It's really wonky backdoor-type shit: before publishing to npm, we go and find 
"process.env.NODE_ENV" and run a script that makes it "production". Really weird! But, 
if we're in development, process.env.NODE_ENV still won't === "production", 
so we know it's development.
*/
const isProduction = process.env.NODE_ENV === 'production';

export const serveCommand = new Command()
    .command("serve [filename]")
    .description("Open a file for editing.")
    .option('-p, --port <number>', 'port to run server on', '4005')
    .action(async (filename = "notebook.js", options: { port: string }) => {

        const isLocalApiError = (error: any): error is LocalApiError => {
            return typeof error.code === "string";
        }

        try {
            const directory = path.join(process.cwd(), path.dirname(filename))
            const port = parseInt(options.port);
            await serve(port, path.basename(filename), directory, !isProduction);
            console.log(`Opened ${path.basename(filename)}. Navigate to http://localhost:${port} to edit the file.`);
        } catch (err: any) {
            if (isLocalApiError(err)) {
                if (err.code === "EADDRINUSE")
                    console.error("Port is in use. Try running on a different port.");
            }
            else if (err instanceof Error) {
                console.log("Here's the problem:", err.message)
            }
            // forcibly stops the program because of error; just kicks user back to terminal
            process.exit(1);
        }
    });