// react
import { useEffect, useRef } from "react";

// css
import "./preview.css";

interface PreviewProps {
  code: string;
  err: string;
}

// Function "window.addEventListener" is clever way to listen to a message coming from
// ... the parent document. Several important things happen, which you need to know
// ... to understand this HTML. In this order, stuff happens:
// 1) Bundle code
// 2) Emit event down into iframe (I think, contentWindow.postMessage())
// 3) iframe receives event with all the code (event.data)
// 4) This "html" is set up such that the iframe executes the event.data
//    ... with eval function.
const html = `
  <html>
    <head>
      <style>html { background-color: white; }</style>
    </head>
    <body>
      <div id="root"></div>
      <script>
        const handleError = (err) => {
          const root = document.querySelector('#root');
          root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
          console.error(err);
        };
        
        window.addEventListener("error", (event) => {
          event.preventDefault();
          handleError(event.error);
        });

        window.addEventListener(
          "message", 
          (event) => {
            try {
              eval(event.data);
            } catch (err){
              handleError(err);
            }
          }, 
          false);
      </script>
    </body>
  </html>`;

const Preview: React.FC<PreviewProps> = ({ code, err }) => {
  // Holds a reference to the iframe, which will be used to
  // ... emit a message down to the iframe.
  const iframe = useRef<any>();

  useEffect(() => {
    // Instead of linking the iframe to some other html through
    // ... a URL or path, the srcdoc attribute allows you to
    // ... reference some string, instead.
    iframe.current.srcdoc = html;

    // By using ".contentWindow.postMessage()", we post the code that esbuild service
    // ... returned in result = build() to the iframe.
    // This timeout is required so that the preview window doesn't just briefly display
    // ... some output, then immediately get rid of it...
    setTimeout(() => {
      iframe.current.contentWindow.postMessage(code, "*");
    }, 50);
  }, [code]);

  err && console.log(err);

  return (
    <div className="preview-wrapper">
      <iframe
        style={{ background: "white" }}
        title="preview"
        ref={iframe}
        sandbox="allow-scripts"
        srcDoc={html}
      />
      {err && <div className="preview-error">{err}</div>}
    </div>
  );
};

export default Preview;
