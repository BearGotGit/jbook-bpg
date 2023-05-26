// You can verify this with cmd+click to find the type of

// ... editorDidMount(), but "EditorDidMount" is actually a type.
// ... This is an alternative way of listing the type, as opposed
// ... to writing our own interface. We can just import it, and
// ... use that!
// The significance of the above is that (before) in the 'CodeEditor'
// ... function, in the 'onEditorDidMount' function, we no longer need to
// ... stick the type of 'any' for monacoEditor prop. We can use built-in
// ... stuff, which is cleaner and more accurate.
import { useRef } from "react";
import MonacoEditor, { EditorDidMount } from "@monaco-editor/react";
import prettier from "prettier";
import parser from "prettier/parser-babel";

// css
import "./code-editor.css";

interface CodeEditorProps {
  initialValue: string;
  // this function just updates state (input) from index.tsx
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  // holds a reference to the current intance of the monacoEditor
  // ... This is useful for getting and setting the current editor's
  // ... code text that's stored in it.
  const editorRef = useRef<any>();

  // Sort of weird, but this callback function calls another
  // ... call back, getValue, which returns the value held by
  // ... the Monaco editor (ModelContent). Whenever the ModelContent
  // ... is changed, monacoEditor.onDidChangeModelContent is called,
  // ... which calls onChange (which edits the state (input) from index.tsx).
  const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
    editorRef.current = monacoEditor;
    monacoEditor.onDidChangeModelContent(() => {
      onChange(getValue());
    });

    // TBH, IDK why he put the ?. I have no idea why
    // ... getModel would return null, but whatever, it's
    // ... probably just a TS safety thing.
    monacoEditor.getModel()?.updateOptions({ tabSize: 2 });
  };

  // callback for the formatting the code in the editor
  // ... using prettier (you know, that beautifying thing)
  const onFormatClick = () => {
    // get current value from editor
    //        ... I bet that getModel() without '?' is going to throw an error
    //        ... when we type editorRef later...
    const unformatted = editorRef.current.getModel().getValue();

    // format that value
    const formatted = prettier
      .format(unformatted, {
        parser: "babel",
        plugins: [parser],
        useTabs: false,
        semi: true,
        singleQuote: false, // I want double quotes
      })
      .replace(/\n$/, "");

    // set the formatted value back in the editor
    editorRef.current.setValue(formatted);
    return;
  };

  // JSX b/c React.FC, remember?
  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        editorDidMount={onEditorDidMount}
        value={initialValue}
        theme="vs-dark"
        language="javascript"
        height="100%"
        options={{
          wordWrap: "on",
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
