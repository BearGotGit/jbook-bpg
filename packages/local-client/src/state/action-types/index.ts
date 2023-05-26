/** 
 * God, I didn't even think about it, but an enum type is really useful for this
 * sort of thing!
*/


export enum ActionType {
    MOVE_CELL = "move_cell",
    DELETE_CELL = "delete_cell",
    INSERT_CELL_AFTER = "insert_cell_after",
    UPDATE_CELL = "update_cell",
    // perhaps we have two for bundling since it is asynchronous--that is,
    // ... we use start and end to simply logic
    BUNDLE_START = "bundle_start",
    BUNDLE_COMPLETE = "bundle_complete",
    // again, async but he has an action for error, too
    FETCH_CELLS_START = "fetch_cells_start",
    FETCH_CELLS_COMPLETE = "fetch_cells_complete",
    FETCH_CELLS_ERROR = "fetch_cells_error",
    SAVE_CELLS_ERROR = "save_cells_error",
}