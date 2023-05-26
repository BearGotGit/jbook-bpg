import { useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState } from "../state";

// Admittedly, the Lecturer basically introduces this code (and from the other file
// ... where we imported it from) as something kind of a "mystery" and doesn't really
// ... elaborate too much on it! But he does say that "OK, so now whenever we want to
// ... access any kind of state in a component, we're going to use our 'useTypedSelector'
// ... and this thing is going to understand the type of data that is inside our store".

// IDK, what that means tbh.

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;