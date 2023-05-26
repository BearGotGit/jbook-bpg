import { combineReducers } from "redux"
import cellsReducer from "./cellsReducer"
import bundlesReducer from "./bundlesReducer";

// Reducers is the combined reducer of all the reducers.
const reducers = combineReducers({
    cells: cellsReducer,
    bundles: bundlesReducer,
});

export default reducers;

// Apparently, this is some kind of housekeeping thing for
// ... apply some types to the "useSelector" hook in React-Redux.
// ... We gotta define this new type here called "RootState";
// ... "This all about applying some types to React Redux"(Instructor)
export type RootState = ReturnType<typeof reducers>;