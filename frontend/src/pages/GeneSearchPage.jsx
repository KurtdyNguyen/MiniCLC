import React from "react";
import GeneSearch from "../components/GeneSearch";

function GeneSearchPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Fetching Gene Reference</h1>
        <p>
          Search NCBI database and download reference sequences for your gene of
          interest.
        </p>
      </div>
      <GeneSearch />
      <div className="page-navigation">
        <p>After fetching a gene, proceed to:</p>
        <a href="/mutations" className="nav-button">
          Manage Mutations
        </a>
      </div>
    </div>
  );
}

export default GeneSearchPage;
