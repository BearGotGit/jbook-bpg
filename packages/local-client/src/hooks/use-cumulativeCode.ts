import { useTypedSelector } from "./use-typed-selector";

export const useCumulativeCode = (cellId: string) => {
    // refer to lecture 257. Calculating Cumulative Code @0:24
    // From ChatGPT, I could gather that selector is basically this thing
    // ... that allows you to access the state in the redux store. This for
    // ... some reason is good to use whenever you want some kind of
    // ... derived state because otherwise you would need to compute the
    // ... derived states that you need from the Redux store (which might be
    // ... annoying, costly, inconvient, ugly because Redux is pure).
    // Now, I imagine that a typed selector is probably this thing we did because
    // ... of TypeScript but I could be wrong (I think that because if you look
    // ... at the definition, "useTypedSelector" has this weird declaration, which
    // ... might be a TypeScript thing...)
    return useTypedSelector((state) => {
        const { data, order } = state.cells;
        const orderedCells = order.map((id) => data[id]);
        // We're injecting cumulativeCode so we can provide users of this
        // ... application with an in-built function. That function is "show()",
        // ... which basically just puts whatever the user wants to display
        // ... in the preview of the CodeCell component.

        // This bit with showFunc and showFuncNoop is kind of weird, but let me elaborate.
        // ... Showfunc will be injected into cumulativeCode if the code cell is the one we
        // ... where we typed "show(...)". The problem was that before if we used "show(...)",
        // ... it would show whatever it was in ALL of the preview windows, instead of just
        // ... the one next to the code cell with the "show(...) function.
        const showFunc = `
    import _React from "react";
    import _ReactDOM from "react-dom";

    var show = (value) => {
      const root = document.querySelector("#root");

      if (typeof value === "object")
      {
        if (value.$$typeof && value.props)
        {
          // Assume it's a react object
          _ReactDOM.render(value, root);
        }
        else
        {
          root.innerHTML = JSON.stringify(value);
        }
      } 
      else
      {
        root.innerHTML = value;
      }
    };
  `;
        const showFuncNoop = "var show = () => {}";
        // JSON.stringify allows us to print both objects and arrays as expected (in JSON)
        // FIXME: make the JSON print arrays and objects and complicated stuff in pretty way.
        const cumulativeCode = [""];
        for (let c of orderedCells) {
            if (c.type === "code") {
                if (c.id === cellId) {
                    cumulativeCode.push(showFunc);
                } else {
                    cumulativeCode.push(showFuncNoop);
                }
                cumulativeCode.push(c.content);
            }
            if (c.id === cellId) {
                break;
            }
        }
        return cumulativeCode;
    }).join("\n");
}