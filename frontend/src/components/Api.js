const API_BASE = '/api';

export const api = {
    searchGene: async (gene) => {
        const response = await fetch(`${API_BASE}/search_gene?gene=${gene}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },

    fetchGene: async (gene, accessions) => {
        const response = await fetch(`${API_BASE}/fetch_gene`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({gene, accessions})
        });
        return response.json();
    },

    fetchByAccession: async (accession, geneSymbol) => {
        const response = await fetch(`${API_BASE}/fetch_by_accession`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({accession, gene_symbol: geneSymbol})
        });
        return response.json();
    },

    addMutation: async (geneSymbol, mutation) => {
        const response = await fetch(`${API_BASE}/mutation/add`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({gene_symbol: geneSymbol, mutation})
        });
        return response.json();
    },

    removeMutation: async (geneSymbol, mutation) => {
        try{
            const response = await fetch(`${API_BASE}/mutation/remove`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gene_symbol: geneSymbol, mutation})
            });
            const data = await response.json();
            return data;
        } catch(error){
            throw error;
        }
    },

    listMutation: async (geneSymbol) => {
        const response = await fetch(`${API_BASE}/mutation/list/${geneSymbol}`);
        return response.json();
    },

    designPrimers: async (geneSymbol, mutation, params) => {
        const response = await fetch(`${API_BASE}/primers/design`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({gene_symbol: geneSymbol, mutation, ...params})
        });
        return response.json();
    }
};