import React, { useState } from "react";
import { api } from "@/components/Api";
import { toast } from "sonner";
import GeneSearch from "../components/GeneSearch";
import ResultsTable from "../components/ResultsTable";

function GeneSearchPage() {
  const [selectedGene, setSelectedGene] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetching, setFetching] = useState(null);

  const handleFetch = async (accession) => {
    setFetching(accession);
    try {
      const data = await api.fetchByAccession(accession, searchTerm);
      if (data.status !== "success") {
        toast.error("Fetching process failed", {
          description: data.error,
          action: {
            label: "Copy",
            onClick: () => navigator.clipboard.writeText(data.error),
          },
        });
      }
    } catch (error) {
      toast.error("Fetching process failed", {
        description: error.message,
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(error.message),
        },
      });
    } finally {
      setFetching(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex shadow-md rounded-md bg-rose-100">
        <GeneSearch
          onGeneSelect={setSelectedGene}
          selectedGene={selectedGene}
          onSearchResults={setSearchResults}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          fetching={fetching !== null}
        />
      </div>

      <div
        className={`transition-all duration-1000 ${searchResults ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className={`transition-transform duration-1000 ${searchResults ? "translate-y-0" : "-translate-y-5"}`}
        >
          <ResultsTable
            results={searchResults}
            fetching={fetching}
            onFetch={handleFetch}
          />
        </div>
      </div>
    </div>
  );
}

export default GeneSearchPage;
