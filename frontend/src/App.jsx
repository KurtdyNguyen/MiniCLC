import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Navigator from "./components/Navigator";
import GeneSearchPage from "./pages/GeneSearchPage";
import MutationManagerPage from "./pages/MutationManagerPage";
import PrimerDesignPage from "./pages/PrimerDesignPage";

function App() {
  return (
    <Router>
      <div className="min-w-screen bg-background">
        <Navigator />

        <main className="container mx-auto px-2 py-4">
          <Routes>
            <Route path="/" element={<Navigate to="/gene-search" replace />} />
            <Route path="/gene-search" element={<GeneSearchPage />} />
            <Route path="/mutations" element={<MutationManagerPage />} />
            <Route path="/primer-design" element={<PrimerDesignPage />} />
            <Route
              path="/cross-validation"
              element={
                <div className="page">
                  <div className="page-header">
                    <h1>Cross-Validation Mode (Coming Soon)</h1>
                    <p>Compare Sanger sequencing with NGS results.</p>
                  </div>
                  <div className="card">
                    <p>
                      This feature is under development. It will allow you to:
                    </p>
                    <ul>
                      <li>Upload Sanger .ab1 files</li>
                      <li>Compare with NGS mutation calls</li>
                      <li>Generate validation reports</li>
                    </ul>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
