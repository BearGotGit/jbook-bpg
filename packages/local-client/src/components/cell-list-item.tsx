import "./cell-list-item.css";
import { Cell } from "../state";
import CodeCell from "./code-cell";
import TextEditor from "./text-editor";
import ActionBar from "./action-bar";

interface CellListItemProps {
  cell: Cell;
}

const CellListItem: React.FC<CellListItemProps> = ({ cell }) => {
  let child: JSX.Element;
  if (cell.type === "code") {
    child = (
      <>
        <div className="action-bar-wrapper">
          <ActionBar id={cell.id} />
        </div>
        <CodeCell cell={cell} />
      </>
    );
  } else if (cell.type === "text") {
    child = (
      <>
        <TextEditor cell={cell} />
        <ActionBar id={cell.id} />
      </>
    );
  } else {
    child = (
      <div>
        Entered the else clause of CellListItem from
        "src\components\cell-list-item.tsx"
      </div>
    );
  }

  return (
    <div className="cell-list-item">
      {/* Yes! So child JSX.Element needs to be placed before the ActionBar
       so that it can render, and then ActionBar component is placed after, 
       so it sort of renders on top of the component! Otherwise, the ActionBar 
       would have been hidden behind the component that it was supposed to be on top of! */}
      {child}
    </div>
  );
};

export default CellListItem;
