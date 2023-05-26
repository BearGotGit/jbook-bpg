import { legacy_createStore, applyMiddleware } from "redux";
// "legacy_createStore" is same as "createStore", but it's just to
// ... let you know that "createStore" is deprecated!
// Import "createStore" and hover over the deprecation warning to
// ... see what is recommended today!
import thunk from "redux-thunk";
import reducers from "./reducers";
import { persistMiddleware } from "./middlewares/persist-middleware";

// the order the middlewares are listed in `applyMiddleware` makes no difference in this case!
export const store = legacy_createStore(reducers, {}, applyMiddleware(persistMiddleware, thunk));
