import "./text-editor.css";
import { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Cell } from "../state";
import { useActions } from "../hooks/use-actions";

interface TextEditorProps {
  cell: Cell;
}

const TextEditor: React.FC<TextEditorProps> = ({ cell }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  // const [value, setValue] = useState<string>("# Header");
  const { updateCell } = useActions();

  useEffect(() => {
    // THE LOGIC FOR DECIDING WHICH WINDOW TO BE IN IS KINDA JANK
    // ... BUT IT TURNS OUT THAT IT'S KIND OF HARD TO SAY,
    // ... "did NOT click in some window" because you need to know
    // ... from the window you did NOT click in, that some OTHER
    // ... window was clicked! That doesn't make sense. So we
    // ..., instead, say "we DID click this window, so stay in it!
    // ... Otherwise, GTFO".

    // WAIT! THAT IS NOT LOGIC! IT'S STILL JUST WEIRD! THAT CAN'T BE EFFICIENT! DOESN'T IT RE-RENDER?
    const listener = (event: MouseEvent) => {
      if (
        ref.current &&
        event.target &&
        ref.current.contains(event.target as Node)
      ) {
        setEditing(true);
        // The Element clicked on is INSIDE OF the editor
        return;
      }
      // The Element clicked on is OUT OF the editor
      setEditing(false);
    };
    document.addEventListener("click", listener, { capture: true });

    return () => {
      document.removeEventListener("click", listener, { capture: true });
    };
  }, []);

  // this is EDITING MODE
  if (editing) {
    return (
      <div className="text-editor" ref={ref}>
        <MDEditor
          value={cell.content}
          onChange={(v) => {
            // I wouldn't use "as string", instead, use the line after that...
            // setValue(v as string);
            updateCell(cell.id, v || ""); // if v = undefined, then will do the right arg ("");
          }}
        />
      </div>
    );
  }

  // this is PREVIEW MODE
  return (
    <div
      // class "card" and "card-content" are from Bulma CSS
      className="text-editor card"
      onClick={() => {
        setEditing(true);
      }}
    >
      <div className="card-content">
        {/* By default if cell.content contains no string (that may mean empty string),
         then it wll simply add the default text, "Click to edit" */}
        <MDEditor.Markdown source={cell.content || "# Click me to edit..."} />
      </div>
    </div>
  );
};

export default TextEditor;
