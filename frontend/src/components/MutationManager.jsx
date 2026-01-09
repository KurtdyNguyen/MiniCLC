import React, { useState, useEffect } from "react";
import { api } from "./Api";

function MutationManager({
  selectedGene,
  selectedMutation,
  onGeneSelect,
  onMutationSelect,
}) {
  const [mutationInput, setMutationInput] = useState("");
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [geneInput, setGeneInput] = useState(selectedGene || "");

  useEffect(() => {
    if (selectedGene) {
      loadMutations(selectedGene);
      setGeneInput(selectedGene);
    } else {
      setMutations([]);
    }
  }, [selectedGene]);

  const loadMutations = async (geneSymbol) => {
    if (!geneSymbol) return;
    setLoading(true);
    try {
      const data = await api.listMutation(geneSymbol);
      if (Array.isArray(data)) {
        setMutations(data);
      } else {
        setMutations([]);
      }
    } catch (error) {
      console.error("Failed to load mutations: ", error);
      setMutations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMutation = async () => {
    const gene = geneInput.trim();
    const mutation = mutationInput.trim();

    if (!gene) {
      setMessage("Please enter a gene symbol.");
      return;
    }
    if (!mutation) {
      setMessage("Please enter a mutation in HVGS format.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const result = await api.addMutation(gene, mutation);
      if (result.status === "success") {
        setMessage(`Added mutation: ${mutation}`);
        setMutationInput("");
        onGeneSelect(gene);
        onMutationSelect(mutation);
        loadMutations(gene);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMutation = async (mutation) => {
    if (!selectedGene) {
      console.error("No gene selected!");
      setMessage("Error: No gene selected");
      return;
    }
    if (!window.confirm(`Remove mutation ${mutation} from ${selectedGene}?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await api.removeMutation(selectedGene, mutation);
      if (result.status === "success") {
        setMessage(`Removed mutation: ${mutation}`);
        if (selectedMutation === mutation) {
          onMutationSelect("");
        }
        loadMutations(selectedGene);
      } else {
        setMessage(`Error: ${result.error || "failed to remove mutation"}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMutation = (mutation) => {
    onMutationSelect(mutation);
    setMessage(`Selected mutation ${mutation}`);
  };

  return (
    <div className="card">
      <h2>Mutation Manager</h2>
      <div className="input-group">
        <input
          type="text"
          value={geneInput}
          onChange={(e) => setGeneInput(e.target.value.toUpperCase())}
          placeholder="Gene symbol"
          onKeyDown={(e) => e.key === "Enter" && handleAddMutation()}
        />
        <input
          type="text"
          value={mutationInput}
          onChange={(e) => setMutationInput(e.target.value)}
          placeholder="Mutation"
          onKeyDown={(e) => e.key === "Enter" && handleAddMutation()}
        />
        <button onClick={handleAddMutation} disabled={loading}>
          {loading ? "Processing..." : "Add mutation"}
        </button>
      </div>

      {message && (
        <div
          className={`message ${message.includes("Error") ? "error" : "info"}`}
        >
          {message}
        </div>
      )}

      <div className="current-selection">
        <p>
          <strong>Selected Gene:</strong> {selectedGene || "None"}
          <strong>Selected Mutation:</strong> {selectedMutation || "None"}
        </p>
      </div>

      {selectedGene && (
        <div className="mutation-list">
          <h2>
            Mutations for {selectedGene}
            {loading && <span>Loading...</span>}
          </h2>
          {mutations.length === 0 ? (
            <p>No mutations added yet.</p>
          ) : (
            <div className="mutation-items">
              {mutations.map((mut, index) => (
                <div
                  key={index}
                  className={`mutation-item ${
                    selectedMutation === mut.mutation ? "selected" : ""
                  }`}
                >
                  <div className="mutation-info">
                    <span className="mutation-text">{mut.mutation}</span>
                    {mut.position && (
                      <span className="mutation-position">
                        (position {mut.position})
                      </span>
                    )}
                  </div>
                  <div className="mutation-actions">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectMutation(mut.mutation);
                      }}
                      className="small-btn select-btn"
                    >
                      {selectedMutation === mut.mutation
                        ? "Selected"
                        : "Select"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveMutation(mut.mutation);
                      }}
                      className="small-btn remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MutationManager;
