import React, { useState } from "react";
import { api } from "./Api";

function GeneSearch({ onGeneSelect, selectedGene }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage("Enter a gene symbol!");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const data = await api.searchGene(searchTerm);

      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
        onGeneSelect(searchTerm);
        setMessage(`Found ${data.length} reference(s) for ${searchTerm}`);
      } else {
        setMessage("Found no results!");
        setSearchResults(null);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async (accession) => {
    setFetching(true);
    try {
      const data = await api.fetchByAccession(accession, searchTerm);
      if (data.status === "success") {
        setMessage(`Successfully fetched ${accession}`);
      } else {
        setMessage(`Failed to fetch: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="card">
      <h2>Fetch gene references</h2>

      <div className="input-group">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          placeholder="Enter gene symbol"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          disabled={fetching}
        />
        <button onClick={handleSearch} disabled={loading || fetching}>
          {loading ? "Searching..." : "Search NCBI DB"}
        </button>
      </div>

      {selectedGene && (
        <div className="current-gene">
          <strong>Current gene:</strong> {selectedGene}
        </div>
      )}

      {message && (
        <div
          className={`message ${message.includes("Error") ? "error" : "info"}`}
        >
          {message}
        </div>
      )}

      {fetching && (
        <div className="fetching-overlay">
          <div className="spinner"></div>
          <p>Downloading sequence from NCBI...</p>
        </div>
      )}

      {searchResults && !fetching && (
        <div className="search-results">
          <h3>Available References ({searchResults.length}):</h3>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>Accession</th>
                  <th>Description</th>
                  <th>Length</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{item.accession}</strong>
                    </td>
                    <td>{item.title}</td>
                    <td>
                      {item.length
                        ? `${item.length.toLocaleString()} bp`
                        : "N/A"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleFetch(item.accession)}
                        className="small-btn"
                        disabled={fetching}
                      >
                        {fetching ? "Fetching..." : "Fetch"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneSearch;
