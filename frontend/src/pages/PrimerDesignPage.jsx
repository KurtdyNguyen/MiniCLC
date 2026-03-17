import React, { useState } from "react";
import PrimerDesigner from "../components/PrimerDesigner";

function PrimerDesignPage() {
  const [selectedGene, setSelectedGene] = useState("");
  const [selectedMutation, setSelectedMutation] = useState("");

  return (
    <div className="page">
      <div className="page-header">
        <h1>Design Primers</h1>
        <p>Designing PCR primers around your selected mutation.</p>
      </div>
      <PrimerDesigner
        selectedGene={selectedGene}
        selectedMutation={selectedMutation}
      />
      <div className="page-navigation">
        <a href="/mutations" className="nav-button secondary">
          Back to Manage Mutations
        </a>
      </div>
    </div>
  );
}

export default PrimerDesignPage;
