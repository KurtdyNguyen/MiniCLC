import React, { useState } from "react";
import { api } from "./Api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { Separator } from "@radix-ui/react-menubar";
import { Spinner } from "./ui/spinner";

function GeneSearch({
  onGeneSelect,
  selectedGene,
  onSearchResults,
  searchTerm,
  onSearchTermChange,
  fetching,
}) {
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) {
      toast.warning("Enter a gene symbol!");
      return;
    }

    setLoading(true);
    try {
      const data = await api.searchGene(searchTerm);

      if (Array.isArray(data) && data.length > 0) {
        onSearchResults(data);
        onGeneSelect(searchTerm);
      } else {
        toast.error("Found no results!", {
          description: `No references found for "${searchTerm}"`,
          action: {
            label: "Copy",
            onClick: () =>
              navigator.clipboard.writeText(
                `No references found for "${searchTerm}"`,
              ),
          },
        });
        onSearchResults(null);
      }
    } catch (error) {
      toast.error("Search failed!", {
        description: error.message,
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(error.message),
        },
      });
      onSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none p-4">
      <CardHeader>
        <CardTitle>Fetch gene references</CardTitle>
        <CardDescription className="text-gray-500">
          Enter the gene symbol or the accession ID directly to get the
          reference sequence
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 pt-4">
        <form onSubmit={handleSearch}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="gene-symbol-genesearch">
                Gene Symbol
              </FieldLabel>
              <div className="flex gap-2">
                <input
                  id="gene-symbol-genesearch"
                  value={searchTerm}
                  onChange={(e) =>
                    onSearchTermChange(e.target.value.toUpperCase())
                  }
                  placeholder="HBB, ACVR1, etc."
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  disabled={fetching}
                  className="px-2 border bg-white"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading || fetching}
                  variant="default"
                  className="inset-ring-2 p-1"
                >
                  {loading ? (
                    <Spinner className="animate-spin" />
                  ) : (
                    "Search NCBI DB"
                  )}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default GeneSearch;
