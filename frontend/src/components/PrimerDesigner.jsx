import React, { useState } from "react";
import { api } from "./Api";

function PrimerDesigner({ selectedGene, selectedMutation }) {
  const [primerResults, setPrimerResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [params, setParams] = useState({
    product_size_min: 300,
    product_size_max: 900,
    num_return: 10,
  });
  const [selectedPrimers, setSelectedPrimers] = useState([]);

  const handleDesignPrimers = async () => {
    if (!selectedGene || !selectedMutation) {
      setMessage("Please select a gene and mutation first.");
      return;
    }

    setLoading(true);
    setMessage("Designing primers...");
    setPrimerResults(null);
    setSelectedPrimers([]);

    try {
      const data = await api.designPrimers(
        selectedGene,
        selectedMutation,
        params,
      );
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else if (!data.primers || data.primers.length === 0) {
        setMessage("No suitable primers found. Try adjusting your parameters.");
      } else {
        setPrimerResults(data);
        setMessage(`Found ${data.total_candidates} primer result(s).`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: parseInt(value) || 0,
    }));
  };

  const togglePrimerSelection = (primerIndex) => {
    setSelectedPrimers((prev) => {
      if (prev.includes(primerIndex)) {
        return prev.filter((idx) => idx !== primerIndex);
      } else {
        return [...prev, primerIndex];
      }
    });
  };

  const exportSelectedPrimers = () => {
    if (!primerResults || selectedPrimers.length === 0) {
      alert("No primers selected.");
      return;
    }

    const selected = selectedPrimers.map((idx) => primerResults.primers[idx]);
    let table = "Primer Design Result\n\n\n";
    table += `Gene: ${selectedGene}\n`;
    table += `Mutation: ${selectedMutation}\n`;

    selected.forEach((primer, idx) => {
      table += `Primer pair #${idx + 1}\n\n`;

      const forwardGC = calculateGCpercentage(primer.left_primer);
      const reverseGC = calculateGCpercentage(primer.right_primer);

      table +=
        "Sequence (5'->3')\tTemplate strand\tLength\tStart\tStop\tTm\tGC%\tSelf complementarity\tSelf 3' complementarity\n";
      table += `${primer.left_primer}\tPlus\t${primer.left_primer.length}\t1\t${
        primer.left_primer.length
      }\t${primer.tm.toFixed(2)}\t${forwardGC.toFixed(2)}\t0.00\t0.00\n`;
      table += `${primer.right_primer}\tMinus\t${
        primer.right_primer.length
      }\t1\t${primer.right_primer.length}\t${primer.tm.toFixed(
        2,
      )}\t${reverseGC.toFixed(2)}\t0.00\t0.00\n`;
      table += `Product length\t${primer.product_size}\n`;
      table += `Mutation distance\tL=${primer.dist_to_left}bp, R=${primer.dist_to_right}bp\n`;

      navigator.clipboard
        .writeText(table)
        .then(() => {
          setMessage("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          setMessage("Failed to copy: ", err);
        });
    });
  };

  const copySingleResult = (primer) => {
    const forwardGC = calculateGCpercentage(primer.left_primer);
    const reverseGC = calculateGCpercentage(primer.right_primer);

    const text =
      "Primer pair detail:\n" +
      "Sequence (5'->3')\tTemplate strand\tLength\tStart\tStop\tTm\tGC%\n" +
      `${primer.left_primer}\tPlus\t${primer.left_primer.length}\t1\t${
        primer.left_primer.length
      }\t${primer.tm.toFixed(2)}\t${forwardGC.toFixed(2)}\t0.00\t0.00\n` +
      `${primer.right_primer}\tMinus\t${primer.right_primer.length}\t1\t${
        primer.right_primer.length
      }\t${primer.tm.toFixed(2)}\t${reverseGC.toFixed(2)}\t0.00\t0.00\n` +
      `Product length\t${primer.product_size}\n` +
      `Mutation distance\tL=${primer.dist_to_left}bp, R=${primer.dist_to_right}bp\n`;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setMessage("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setMessage("Failed to copy: ", err);
      });
  };

  const calculateGCpercentage = (sequence) => {
    const gcCount = (sequence.match(/[GC]/gi) || []).length;
    return (gcCount / sequence.length) * 100;
  };

  const loadingSpinner = () => {
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Designing primers...</p>
    </div>;
  };

  return (
    <div className="card">
      <h2>Primer Designer</h2>
      <div className="design-status">
        <p>
          <strong>Gene:</strong> {selectedGene || "None"} |
          <strong> Mutation:</strong> {selectedMutation || "None"}
        </p>

        {(!selectedGene || !selectedMutation) && (
          <p className="warning">
            Select a gene and mutation in the Mutation Manager first
          </p>
        )}
      </div>

      <div className="parameter-control">
        <h3>Parameters</h3>
        <div className="param-grid">
          <div className="param-item">
            <label>Min Product Size (bp)</label>
            <input
              type="number"
              value={params.product_size_min}
              onChange={(e) =>
                handleParamChange("product_size_min", e.target.value)
              }
              min="100"
              max="1000"
            />
            <div className="param-hint">Minimum PCR product length</div>
          </div>
          <div className="param-item">
            <label>Max Product Size (bp)</label>
            <input
              type="number"
              value={params.product_size_max}
              onChange={(e) =>
                handleParamChange("product_size_max", e.target.value)
              }
              min="200"
              max="2000"
            />
            <div className="param-hint">Maximum PCR product length</div>
          </div>
          <div className="param-item">
            <label>Max Results</label>
            <input
              type="number"
              value={params.num_return}
              onChange={(e) => handleParamChange("num_return", e.target.value)}
              min="1"
              max="50"
            />
            <div className="param-hint">Primer pairs to return (1-50)</div>
          </div>
          <div className="param-item">
            <label>Action</label>
            <button
              onClick={handleDesignPrimers}
              disabled={!selectedGene || !selectedMutation || loading}
              className="primary-btn"
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span> Designing...
                </>
              ) : (
                "Design Primers"
              )}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`message ${message.includes("Error") ? "error" : "info"}`}
        >
          {message}
        </div>
      )}

      {primerResults && (
        <div className="primer-results">
          <div className="results-header">
            <h3>Primer results: ({primerResults.total_candidates} pairs)</h3>
            <div className="results-actions">
              <button
                onClick={exportSelectedPrimers}
                disabled={selectedPrimers.length === 0}
                className="export-btn"
                title="Copy to clipboard"
              >
                Copy to clipboard ({selectedPrimers.length})
              </button>
            </div>
          </div>

          <div className="primer-list">
            {primerResults.primers.map((primer, index) => (
              <div
                key={index}
                className={`primer-item ${
                  selectedPrimers.includes(index) ? "selected" : ""
                } ${primer.ideal ? "ideal" : ""}`}
                onClick={() => togglePrimerSelection(index)}
              >
                <div className="primer-header">
                  <div className="primer-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedPrimers.includes(index)}
                      onChange={() => togglePrimerSelection(index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Pair #{index + 1}</span>
                    {primer.ideal && <span className="ideal-badge">Ideal</span>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copySingleResult(primer);
                    }}
                    className="small-btn copy-btn"
                  >
                    Copy
                  </button>
                </div>

                <div className="primer-sequences">
                  <div className="sequence">
                    <strong>Forward (5'→3'):</strong>
                    <code>{primer.left_primer}</code>
                  </div>
                  <div className="sequence">
                    <strong>Reverse (5'→3'):</strong>
                    <code>{primer.right_primer}</code>
                  </div>
                </div>

                <div className="primer-properties">
                  <div className="property">
                    <span className="label">Product Size:</span>
                    <span className="value">{primer.product_size} bp</span>
                  </div>
                  <div className="property">
                    <span className="label">TM:</span>
                    <span className="value">{primer.tm}°C</span>
                  </div>
                  <div className="property">
                    <span className="label">Distance to mutation:</span>
                    <span className="value">
                      L={primer.dist_to_left}bp, R={primer.dist_to_right}bp
                    </span>
                  </div>
                  <div className="property">
                    <span className="label">Status:</span>
                    <span
                      className={`value ${primer.ideal ? "ideal-text" : ""}`}
                    >
                      {primer.ideal
                        ? "Within ideal range (200-300bp)"
                        : "Within acceptable range (150-450bp)"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {primerResults.primers.length === 0 && (
            <div className="no-results">
              <p>No primers met the criteria. Try:</p>
              <ul>
                <li>Increasing product size range</li>
                <li>Checking if the mutation position is valid</li>
                <li>Ensuring the gene sequence is loaded</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="design-notes">
        <h4>Design Notes</h4>
        <ul>
          <li>
            <strong>Ideal range:</strong> Mutation 200-300bp from primer ends
          </li>
          <li>
            <strong>Acceptable range:</strong> Mutation 150-450bp from primer
            ends
          </li>
          <li>Select multiple primers for batch export</li>
        </ul>
      </div>
    </div>
  );
}

export default PrimerDesigner;
