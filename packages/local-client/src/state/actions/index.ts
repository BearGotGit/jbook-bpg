import { ActionType } from "../action-types";
import { Cell, CellTypes } from "../cell";
import { DirectionTypes } from "../direction";

export interface MoveCellAction {
    type: ActionType.MOVE_CELL;
    payload: {
        // every cell will have an "id" (somewhat by assumption),
        // ... the id will uniquely identify cells, and using the
        // ... direction property, we can just figure out that we'll
        // ... be moving a cell up or down.
        id: string,
        direction: DirectionTypes,
    };
}

export interface DeleteCellAction {
    type: ActionType.DELETE_CELL;
    // payload is just the "id" of the string; we need to locate the cell
    // ... that we're deleting!
    payload: string;
}

export interface UpdateCellAction {
    type: ActionType.UPDATE_CELL;
    payload: {
        // which cell are we updating?
        id: string;
        // this will be the new code or the new text or whatever
        content: string;
    };
}

export interface InsertCellAfterAction {
    type: ActionType.INSERT_CELL_AFTER;
    payload: {
        // we need to be provided the id of some cell so we can figure out
        // ... where to place the new cell! 
        id: string | null;
        // what type will this new cell that we're making be?
        // ... will it be a code editor or a text editor?
        // However, this could get us some trouble. Since these types are more like
        // ... indicated rather than formally defined, there is very chance that we
        // ... just forget about them later in our program.
        // We might need to make changes to this (probably)
        type: CellTypes;
    };
}

export interface BundleStartAction {
    type: ActionType.BUNDLE_START;
    payload: {
        // id is used to tell which cell we are bundling
        cellId: string,
    };
}

export interface BundleCompleteAction {
    type: ActionType.BUNDLE_COMPLETE;
    payload: {
        // this is used to tell exactly which cell we completed bundling
        // ... because we may be bundling many cells at the same time
        cellId: string;
        // this holds the bundle with the completed code and/or error
        bundle: {
            code: string;
            err: string;
        };
    };
}

export interface FetchCellsStartAction {
    type: ActionType.FETCH_CELLS_START,
}

export interface FetchCellsCompleteAction {
    type: ActionType.FETCH_CELLS_COMPLETE,
    payload: Cell[]; // array of cells returned by the API
}

export interface FetchCellsErrorAction {
    type: ActionType.FETCH_CELLS_ERROR,
    payload: string; // error message
}

export interface SaveCellsErrorAction {
    type: ActionType.SAVE_CELLS_ERROR,
    payload: string; // error message
}

export type Action =
    MoveCellAction
    | DeleteCellAction
    | InsertCellAfterAction
    | UpdateCellAction
    | BundleStartAction
    | BundleCompleteAction
    | FetchCellsStartAction
    | FetchCellsCompleteAction
    | FetchCellsErrorAction
    | SaveCellsErrorAction;
