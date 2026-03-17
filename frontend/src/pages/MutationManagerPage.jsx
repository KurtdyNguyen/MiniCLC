import React, { useState } from "react";
import MutationManager from "../components/MutationManager";

function MutationManagerPage() {
  const [selectedGene, setSelectedGene] = useState("");
  const [selectedMutation, setSelectedMutation] = useState("");

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Mutations</h1>
        <p>
          Adding, changing or removing mutations from NGS reports in HGVS
          format.
        </p>
      </div>
      <MutationManager
        selectedGene={selectedGene}
        selectedMutation={selectedMutation}
        onGeneSelect={setSelectedGene}
        onMutationSelect={setSelectedMutation}
      />
      <div className="page-navigation">
        <a href="/gene-fetch" className="nav-button secondary">
          Back to Gene Fetch
        </a>
        <a href="/primer-design" className="nav-button">
          Design Primers
        </a>
      </div>
    </div>
  );
}

export default MutationManagerPage;
