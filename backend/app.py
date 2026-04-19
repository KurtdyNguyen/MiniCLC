from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from utils.paths import DB_PATH
from services.fetch_gene import search_gene, fetch_accession
from services.add_notation import (
    add_mutation_service,
    remove_mutation_service,
    list_mutations_service
)
from services.primer_design import design_primers_service

app = Flask(__name__)
CORS(app)

@app.route("/search_gene", methods=["GET"])
def search():
    gene = request.args.get("gene")
    if not gene:
        return jsonify({"error": "gene parameter required"}), 400
    results = search_gene(gene)
    return jsonify(results)

@app.route("/fetch_gene", methods=["POST"])
def fetch():
    data = request.get_json()
    gene = data.get("gene")
    accessions = data.get("accessions", [])
    saved = []
    for acc in accessions:
        path = fetch_accession(acc, gene)
        saved.append(path)
    return jsonify({"saved": saved})

@app.route("/mutation/add", methods=["POST"])
def add_mutation():
    data = request.get_json()
    gene = data.get("gene_symbol")
    mutation = data.get("mutation")

    if not gene or not mutation:
        return jsonify({"error": "gene_symbol and mutation required"}), 400

    return add_mutation_service(gene, mutation)


@app.route("/mutation/remove", methods=["POST"])
def remove_mutation():
    data = request.get_json()
    gene = data.get("gene_symbol")
    mutation = data.get("mutation")

    if not gene or not mutation:
        return jsonify({"error": "gene_symbol and mutation required"}), 400

    return remove_mutation_service(gene, mutation)


@app.route("/mutation/list/<gene_symbol>", methods=["GET"])
def list_mutations(gene_symbol):
    return list_mutations_service(gene_symbol)

@app.route("/primers/design", methods=["POST"])
def design_primers():
    data = request.get_json()
    gene = data.get("gene_symbol")
    mutation = data.get("mutation")
    product_size_min = data.get("product_size_min", 200)
    product_size_max = data.get("product_size_max", 500)
    num_return = data.get("num_return", 10)
    
    if not gene or not mutation:
        return jsonify({"error": "gene_symbol and mutation required"}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT start_pos FROM annotations 
            WHERE gene_id = (SELECT id FROM gene_reference WHERE gene_symbol = ?) 
            AND description = ?
        """, (gene, mutation))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": f"Mutation '{mutation}' not found for gene '{gene}'"}), 400
        
        mutation_pos = row[0]
        
        result = design_primers_service(
            gene_symbol=gene,
            mutation=mutation,
            mutation_pos=mutation_pos,
            product_size_range=(product_size_min, product_size_max),
            num_return=num_return
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/fetch_by_accession", methods=["POST"])
def fetch_by_accession():
    """
    Fetch a specific sequence by accession number
    Example JSON:
    {
        "accession": "NM_001105.5",
        "gene_symbol": "ACVR1"  #optional, for folder organization
    }
    """
    data = request.get_json()
    accession = data.get("accession")
    gene_symbol = data.get("gene_symbol", accession.split('_')[0])

    if not accession:
        return jsonify({"error": "accession parameter required"}), 400
    
    try:
        from services.fetch_gene import fetch_accession
        path = fetch_accession(accession, gene_symbol)
        
        if path:
            return jsonify({
                "status": "success",
                "message": f"Fetched {accession}",
                "path": path,
                "gene_symbol": gene_symbol
            }), 200
        else:
            return jsonify({"error": f"Failed to fetch {accession}"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)