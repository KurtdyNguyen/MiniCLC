import React, { useState } from "react";
import "./App.css";
import PrimerMode from "./components/PrimerMode";

function App() {
  const [mode, setMode] = useState("primer");

  return (
    <div className="app">
      <header className="app-header">
        <h1>MiniCLC Assistant</h1>
        <h2>Primer design & NGS-Sanger cross validation</h2>
      </header>

      <div className="mode-select">
        <button
          className={mode === "primer" ? "active" : ""}
          onClick={() => setMode("primer")}
        >
          Primer Design
        </button>

        <button
          className={mode === "crossval" ? "active" : ""}
          onClick={() => setMode("crossval")}
        >
          NGS-Sanger Cross validation
        </button>
      </div>

      {mode === "primer" ? (
        <PrimerMode />
      ) : (
        <div className="crossval-mode">
          NGS-Sanger Cross validation mode(Coming soon)
        </div>
      )}
    </div>
  );
}

export default App;
