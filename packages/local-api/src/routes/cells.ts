import express from "express";
import fs from "fs/promises";
import path from "path";

interface localApiError {
    code: string;
}

// TODO: Hol up: why are we not importing this? This seems very strange to duplicate this interface definition.
interface Cell {
    id: string;
    content: string;
    type: "text" | "code";
}

export const createCellsRouter = (filename: string, dir: string) => {
    const router = express.Router();
    // "...that is our body-parsing middleware..."
    router.use(express.json());

    const fullPath = path.join(dir, filename);

    router.get("/cells", async (req, res) => {
        const isLocalApiError = (err: any): err is localApiError => {
            return typeof err.code === "string";
        };

        try {
            // Read file
            const result = await fs.readFile(fullPath, { encoding: "utf-8" });

            res.send(JSON.parse(result));
        } catch (err) {
            if (isLocalApiError(err)) {
                if (err.code === "ENOENT") {
                    // These will be improved later...
                    await fs.writeFile(fullPath, "[]", "utf-8");
                    res.send([]);
                }
                else {
                    throw err;
                }
            }
            else {
                throw err;
            }
        }

        // Parse list of cells
        // Send the list of cells to the browser 
    });

    router.post("/cells", async (req, res) => {
        // Take list of cells from the request obj (req)
        const { cells }: { cells: Cell[] } = req.body;
        // Serialize them into some format
        // Write the cells into the file
        await fs.writeFile(fullPath, JSON.stringify(cells), 'utf-8');

        res.send({ status: "ok" });
    });

    return router;
}