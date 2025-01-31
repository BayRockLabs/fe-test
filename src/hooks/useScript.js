import { useEffect } from "react";

function useScript(url, onload) {
  useEffect(() => {
    let script = document.createElement("script");
    script.src = url;
    script.onload = onload;
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, [url, onload]);
  return <div>useScript</div>;
}

export default useScript;
