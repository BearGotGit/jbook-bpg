import "./code-cell.css";
import { useEffect } from "react";
import "bulmaswatch/superhero/bulmaswatch.min.css";
import CodeEditor from "./code-editor";
import Preview from "./preview";
import Resizable from "./resizable";
import { Cell } from "../state";
import { useActions } from "../hooks/use-actions";
import { useTypedSelector } from "../hooks/use-typed-selector";
import { useCumulativeCode } from "../hooks/use-cumulativeCode";

interface CodeCellProps {
  cell: Cell;
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  const { updateCell, createBundle } = useActions();
  // refer to lecture 245. React Wire Up at 3:40
  const bundle = useTypedSelector((state) => state.bundles[cell.id]);

  // refer to lecture 267. Extracting a Hook
  const cumulativeCode = useCumulativeCode(cell.id);

  // useEffect will make the callback function called everytime input changes.
  // ... It will wait one second, and if no change is made again before then,
  // ... the callback will bundle the code and run the output.
  useEffect(() => {
    // this is to ensure that at start up, we don't get a weird blink for no reason
    if (!bundle) {
      // creates a bundle immediately with no set timeout so we don't get a delayed blink
      createBundle(cell.id, cumulativeCode);
      return;
    }
    // making a reference to the timer so that we can go back and cancel
    // ... if the user starts writing code again before it's done.
    const timer = setTimeout(async () => {
      // BUNDLE code
      createBundle(cell.id, cumulativeCode);
    }, 1000);

    // Apparently, useEffect can return a function that will be called
    // ... automatically the next time useEffect does its thing!
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumulativeCode, cell.id, createBundle]);

  // the component (JSX stuff)
  return (
    <Resizable direction="vertical">
      <div
        style={{
          // basically, as much room as possible for editor and
          // ... output, but still allocate 10px for the drag-bar
          // WOW! Turns out (100%-10px) vs (100% - 10px) is HUGE difference!
          height: "calc(100% - 10px)",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* Area with the code editors */}
        <Resizable direction="horizontal">
          <CodeEditor
            initialValue={cell.content}
            onChange={(value) => updateCell(cell.id, value)}
          />
        </Resizable>
        <div className="progress-wrapper">
          {!bundle || bundle.loading ? (
            <div className="progress-cover">
              <progress className="progress is-small is-primary" max="100">
                Loading
              </progress>
            </div>
          ) : (
            <Preview code={bundle.code} err={bundle.err}></Preview>
          )}
        </div>
      </div>
    </Resizable>
  );
};

export default CodeCell;
