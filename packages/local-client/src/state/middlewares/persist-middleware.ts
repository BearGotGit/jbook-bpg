import { Dispatch } from "redux";
import { Action } from "../actions";
import { ActionType } from "../action-types";
import { RootState } from "../reducers";
import { saveCells } from "../action-creators";

// Redux middleware is covered in Lecture 318. It's described briefly, but I'd recommend checking out documentation specific to TypeScript.
export const persistMiddleware = ({
    dispatch,
    getState,
}: {
    dispatch: Dispatch<Action>,
    getState: () => RootState
}) => {

    // somehow this makes timer persist, so the inner-most debouncing code is functional
    let timer: any;

    // next is a function that forwards actions "to the next middleware on our chain"
    return (next: (action: Action) => void) => {
        return (action: Action) => {
            next(action);

            // WOW! I love this JS/TS feature! Basically, we made an array of all the action types, and used the Array.prototype.includes function to see if the action.type is in there! That's really more concise than switch-case and if-else clauses! 
            if (
                [
                    ActionType.MOVE_CELL,
                    ActionType.UPDATE_CELL,
                    ActionType.INSERT_CELL_AFTER,
                    ActionType.DELETE_CELL
                ].includes(action.type)) {

                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    (saveCells())(dispatch, getState)
                }, 1000);
            }
        };
    };
};