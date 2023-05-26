// css
import "./resizable.css";

// react
import { useEffect, useState } from "react";
// react-resizable
import { ResizableBoxProps } from "react-resizable";
// TODO: Learn why you have to use the latter import, and not
// ... the immediately below one! Like what?
// import ResizableBox from "react-resizable";
const ResizableBox = require("react-resizable").ResizableBox;
// const ResizableBoxProps = require("react-resizable").ResizableBoxProps;

interface resizableProps {
  direction: "horizontal" | "vertical";
  children?: React.ReactNode;
}

const Resizable: React.FC<resizableProps> = ({ direction, children }) => {
  /* We're using state because when it updates (we update in the 
  eventListener in useEffect), it causes a re-render, which
  corrects the dimensions of out Resizable component (it 
  wouldn't have, otherwise). */
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);
  // width refers to the width of the resizable component. This will be
  // ... used to help fix that panel snapping thing when the window resizes!
  const [width, setWidth] = useState(window.innerWidth * 0.75);

  let resizableProps: ResizableBoxProps;

  // Do the below only once!
  useEffect(() => {
    // 1) Define a listener --> What does it do?: This is what,
    // ... The listener has the contents of our window resize
    // ... whenever there is a "resize" event.
    // It does this by updating state, which re-renders the component.
    // IMPORANT: This listener is going to use a technique called
    // ... "de-bouncing" to help improve the lag in case there's a
    // ... lot of requests to this.
    let timer: any;
    const listener = () => {
      // Basically, if we made a request to resize already, but it wasn't
      // ... resolved yet, then we need to just clear that request, and
      // ... now, just make a new one.
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        setInnerWidth(window.innerWidth);
        setInnerHeight(window.innerHeight);
        // Due to a bug in Resizable that isn't declared in documentation
        // ... or anything, the window can become smaller than the width of
        // ... the component, which is weird to be honest. We're just going to
        // ... correct that.
        if (window.innerWidth * 0.75 < width) {
          setWidth(window.innerWidth * 0.75);
        }
        // Why isn't this corrected for the vertical direction?
        // ... It turns out the user can just scroll down, so it's really
        // ... no big deal.
      }, 100);
    };

    // 2) Give the window the listener we just defined; have the
    // ... window call back the listener when the window resizes!
    window.addEventListener("resize", listener);

    // END) We are "cleaning up after ourselves". When we're done using
    // ... a global event listener defined in a component, we always
    // ... (namely, in a useEffect function), we need
    // ... to remove the listener. (I guess kind of like Scanner.close() from java?)
    return () => {
      window.removeEventListener("resize", listener);
    };
  }, [width]);

  if (direction === "horizontal") {
    resizableProps = {
      // allows us to attach css only when the component
      // ... is horizontally resizing
      className: "resize-horizontal",
      // minConstraints requires that the width be >= left side;
      // ... vertical is irrelevant in this case, so Infinity
      minConstraints: [innerWidth * 0.2, Infinity],
      // maxConstraints requires that the width be <= left side;
      // ... vertical is irrelevant in this case, so Infinity
      maxConstraints: [innerWidth * 0.75, Infinity],
      // height is irrelevant in this case
      height: Infinity,
      // width is default to the maximum
      width,
      // == width: width,
      // puts a resize handle, that the user can grab onto,
      // ... at the Southern ("s") portion of the component.
      resizeHandles: ["e"],
      // this function is going to be called after the user is done dragging the panel
      // ... (It will be called when the user has stopped resizing the panel)
      // ... What it does is synchronize the width state, so it stops that
      // ... resizable component snapping thing when the window resizes.
      onResizeStop: (event, data) => {
        // data is a JSON that contains useful data whenever onResizeStop is called
        // ... console log it to learn more.
        setWidth(data.size.width);
      },
    };
  } else {
    // vertical: I used else b/c need to instantiate
    // ... resizableBoxProps before use
    resizableProps = {
      minConstraints: [Infinity, 24],
      maxConstraints: [Infinity, innerHeight * 0.9],
      height: 300,
      width: Infinity,
      resizeHandles: ["s"],
    };
  }

  return (
    // ResizableBox won't accep "100%" like normal CSS, so we have
    // ... to say "Infinity" which does the same thing.
    <ResizableBox {...resizableProps}>{children}</ResizableBox>
  );
};

export default Resizable;
