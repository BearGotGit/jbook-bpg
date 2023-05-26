import produce from "immer";
import { ActionType } from "../action-types";
import { Action } from "../actions";
import { Cell } from "../cell";

interface CellsState {
    // whether or not the cell is loading for some reason
    loading: boolean;
    // whether or not an error is thrown
    error: string | null;
    // the order of the cells, relative each other
    order: string[];
    // an object where "the keys are the ids of individual cells,
    // ... and the values are the cells themselves"
    data: {
        // (computed property name, key)
        [key: string]: Cell;
    }
}

const initialState: CellsState = {
    loading: false,
    error: null,
    order: [],
    data: {},
}

// reducer receives a state and action; we annotate those types immediately,
// ... providing state with type "CellsState" so we don't ever mess up when 
// ... dispatching an action and updating state, and we also provide state with
// ... an initialState (defined above) because reducer is used to initialize 
// ... the store. Parameter "action" is annotated with the union of our various
// ... predefined ActionTypes.
// ... This function is pure and returns an object that satisfies
// ... the properties of CellsState!
// Update: Now it uses "immer" and produce function from immer! To read more, go to case,
// ... "ActionType.UPDATE_CELL"!
// Technically, it doesn't need to return anything, but this kind of helps with TS. For
// ... more information go to case "ActionType.DELETE_CELL"!
const reducer = produce((state: CellsState = initialState, action: Action): CellsState => {
    switch (action.type) {
        case ActionType.SAVE_CELLS_ERROR: {
            state.error = action.payload;

            return state;
        }
        case ActionType.FETCH_CELLS_START: {
            state.loading = true;
            state.error = null;

            return state;
        }
        case ActionType.FETCH_CELLS_COMPLETE: {
            const cells = action.payload;

            // Yikes! Honestly, using a for loop is only 3 lines of code and easier to read & understand!
            state.data = cells.reduce((accumulatingObject, cell) => {
                accumulatingObject[cell.id] = cell;
                return accumulatingObject;
            }, {} as CellsState["data"]);

            state.order = cells.map(cell => cell.id);

            return state;
        }

        case ActionType.FETCH_CELLS_ERROR: {
            state.loading = false;
            state.error = action.payload;

            return state;
        }

        case ActionType.DELETE_CELL: {
            const id = action.payload;

            // 2 things: 
            // ... 1) remove cell from data (in CellsState) & 

            delete state.data[id];

            // ... 2) remove cell from order (in CellsState)
            /*
            // This works: 
            const index = state.order.findIndex(cell_id => cell_id === id);
            if (index !== -1) state.order.splice(index, 1);
            // But the following is better...
            */
            state.order = state.order.filter(cell_id => cell_id !== id);
            // stop fall through
            // SO.... A quick heads up--This function doesn't have to return anything,
            // ... but if we just return, TypeScript might think that it actually
            // ... returns undefined. So if we ever want to access any properties of state,
            // ... we would need all of these weird case things to check and make sure it
            // ... (state, that is) is not undefined. Sorry for the confusion, future me or
            // ... somebody else!
            return state;
        }
        case ActionType.INSERT_CELL_AFTER: {
            // It turns out that in lists where towards index 0 is before and also that items
            // ... in the list are seperated by some sort of "add" button functionality, it
            // ... is useful to approach adding items with the paradigm that you add things
            // ... after--that is, these sort of divider buttons hold locators to the item before
            // ... and that they add items after those previous items. 
            // In this course, this was important because it improved functionality when hovering
            // ... over the divider buttons.

            const cell: Cell = {
                content: "",
                type: action.payload.type,
                id: randomId(),
            };

            state.data[cell.id] = cell;

            const foundIndex = state.order.findIndex((cell_id) => cell_id === action.payload.id);

            // if could not find an id that matched our payload
            if (foundIndex < 0) {
                // unshift is just the opposite of push--it puts stuff in the start of the array
                state.order.unshift(cell.id);
            }
            else {
                // splice will insert the new cell at this index, where we want it, and we'll
                // ... just push everything over one index.
                state.order.splice(foundIndex + 1, 0, cell.id);
            }

            // stop fall through
            return state;
        }
        case ActionType.MOVE_CELL: {
            const { direction, id } = action.payload;
            const index = state.order.findIndex((cell_id) => cell_id === id);
            const targetIndex = direction === "up" ? index - 1 : index + 1;

            // invalid state update: the user wants to swap the cell with something 
            // ... that's out of bounds of state.order. That is, they want to swap it
            // ... with nothing, so do nothing!
            if (targetIndex < 0 || targetIndex >= state.order.length) {
                // stop fall through
                return state;
            }
            // just some simple swapping logic; We're just swapping ids of the cells
            state.order[index] = state.order[targetIndex];
            state.order[targetIndex] = action.payload.id;
            // stop fall through
            return state;
        }
        case ActionType.UPDATE_CELL: {
            /*
            // This is kind of long-winded and verbose, but I'm gonna explain everything!
            return {
                // We're changing only the data property of state, so fill in state,
                // ... but we're going to specify changes to state.data
                ...state,
                data: {
                    // We're only going to change the content of one cell in data, so
                    // ... change nothing about state.data except state.data[action.payload.id], 
                    // ... which is the computed-key for the relevant cell!
                    ...state.data,
                    [action.payload.id]: {
                        // We don't want to change anything about the relevant cell except for its
                        // ... content, so leave fill in everything about state.data[action.payload.id],
                        // ... but we're going to specify change to the cell's content, which is identified
                        // ... with the key, state.data[action.payload.id]. We're going to pass that our
                        // ... action.payload.content, which is the new content we want in this cell!
                        ...state.data[action.payload.id],
                        content: action.payload.content,
                        // WHOO! Done!
                    }
                }
            };
            // Equivalently, you could do the following,
            const { id, content } = action.payload;

            return {
                ...state,
                data: {
                    ...state.data,
                    [id]: {
                        ...state.data[id],
                        content,
                    }
                }
            };

            // However, in any case, the above is extremely complicated compared to what
            // ... we need, so we're just going to install a library called "immer" and its 
            // ..."produce" function from lecture 206.
            // This does also mean that we're no longer returning anything of type CellsState.
            // ... immer will figure that out for us and so the return type for this reducer is
            // ... actually VOID! immer will actually directly modify state, it's really weird!
            // ... I don't even know why we started using Redux! 

            */
            const { id, content } = action.payload;

            state.data[id].content = content;
            // stop fall through
            return state;
            // GOD BLESS IMMER!
        }
        default: {
            return state;
        }
    }
}, initialState);
// Yes, above, initialState is required as the second arg for "immer"'s produce function!

// utility function to generate random ids for our cells
// FIXME: I'm pretty sure that this won't necessarily generate unique IDs.
// ... especially since we take only a substring from this!
const randomId = () => {
    // gets random number, converts it to base 36 which conveniently 
    // ... contains all the numbers and letters, then it takes only a
    // ... a portion of it
    return Math.random().toString(36).substring(2, 7);
    // By the way, this function is pretty good; you should commit it 
    // ... to memory!
}

export default reducer;