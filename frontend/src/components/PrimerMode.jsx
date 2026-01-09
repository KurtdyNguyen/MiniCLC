import React, { useState } from "react";
import GeneSearch from "./GeneSearch";
import MutationManager from "./MutationManager";
import PrimerDesigner from "./PrimerDesigner";

function PrimerMode() {
  const [selectedGene, setSelectedGene] = useState("");
  const [selectedMutation, setSelectedMutation] = useState("");

  return (
    <div className="primer-mode">
      <GeneSearch onGeneSelect={setSelectedGene} selectedGene={selectedGene} />
      <MutationManager
        onGeneSelect={setSelectedGene}
        onMutationSelect={setSelectedMutation}
        selectedGene={selectedGene}
        selectedMutation={selectedMutation}
      />
      <PrimerDesigner
        selectedGene={selectedGene}
        selectedMutation={selectedMutation}
      />
    </div>
  );
}

export default PrimerMode;
