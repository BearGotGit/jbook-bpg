import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import {
    Action,
    UpdateCellAction,
    DeleteCellAction,
    MoveCellAction,
    InsertCellAfterAction,
} from "../actions";
import { Cell, CellTypes } from "../cell";
import { DirectionTypes } from "../direction";
import bundle from "../../bundler";
import axios from "axios";
import { RootState } from "../reducers";

export const updateCell = (id: string, content: string): UpdateCellAction => {
    return {
        type: ActionType.UPDATE_CELL,
        payload: {
            id,
            content,
        }
    }
};

export const deleteCell = (id: string): DeleteCellAction => {
    return {
        type: ActionType.DELETE_CELL,
        payload: id,
    };
};

export const moveCell = (id: string, direction: DirectionTypes): MoveCellAction => {
    return {
        type: ActionType.MOVE_CELL,
        payload: {
            id,
            direction,
        }
    };
};

export const insertCellAfter = (id: string | null, type: CellTypes): InsertCellAfterAction => {
    return {
        type: ActionType.INSERT_CELL_AFTER,
        payload: {
            id,
            type,
        }
    };
};

// input is the actual raw code that we want to feed into bundle function
export const createBundle = (cellId: string, input: string) => {
    return async (dispatch: Dispatch<Action>) => {
        // dispatch bundle start (we start trying to get the bundle)
        dispatch({
            type: ActionType.BUNDLE_START,
            payload: {
                cellId,
            }
        });

        const result = await bundle(input);

        // dispatch bundle complete (we have completed getting the bundle)
        dispatch(
            {
                type: ActionType.BUNDLE_COMPLETE,
                payload: {
                    cellId,
                    bundle: result,
                }
            }
        );
    };
};

export const fetchCells = () => {
    /** We're going to be using some asynchronous logic right here, so instead of using
     * the vanilla synchronous dispatch function Redux provides, we're goint to use Redux Thunk!
     * There's a similar example of this in `createBundle` action creator. 
     */
    return async (dispatch: Dispatch<Action>) => {
        dispatch({ type: ActionType.FETCH_CELLS_START });

        try {
            const { data }: { data: Cell[] } = await axios.get("/cells");

            dispatch({
                type: ActionType.FETCH_CELLS_COMPLETE,
                payload: data,
            });
        } catch (err) {
            if (err instanceof Error) {
                dispatch({
                    type: ActionType.FETCH_CELLS_ERROR,
                    payload: err.message,
                });
            }
        }
    };
};

export const saveCells = () => {
    // again, async, gonna use Redux-thunk
    /**getState is a redux thing that returns the state of the whole redux store: 
     *  In this case we had `CellsState` and `BundlesState` in our reducers. The 
     * return type of reducers is the state of the program, so using that return 
     * type, we got a type which we called `RootState`.
     */
    return (async (dispatch: Dispatch<Action>, getState: () => RootState) => {
        // here, `cells` is of type `CellsState`
        const { cells: { data, order } } = getState();

        // here, `cells` is array of cells
        const cells = order.map(id => data[id]);
        try {
            await axios.post("/cells", { cells });
        } catch (err) {
            if (err instanceof Error) {
                dispatch({
                    type: ActionType.SAVE_CELLS_ERROR,
                    payload: err.message,
                });
            }
        }
    });
}