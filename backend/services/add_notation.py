import os
import sqlite3
import shutil
from Bio import SeqIO
from Bio.SeqFeature import SeqFeature, FeatureLocation
from utils.paths import DB_PATH, get_gene_dir, get_gene_file
from flask import jsonify

class MutationAnnotator:
    def __init__(self, gene_symbol):
        self.gene_symbol = gene_symbol
        self.conn = sqlite3.connect(DB_PATH)
        self.cursor = self.conn.cursor()
        self.gene_id, self.record, self.cds_start = self.load_reference()
    
    def load_reference(self):
        # get accession and sequence from DB
        self.cursor.execute("SELECT id, accession, sequence FROM gene_reference WHERE gene_symbol = ?", (self.gene_symbol,))
        row = self.cursor.fetchone()
        if not row:
            raise ValueError(f"No gene found for {self.gene_symbol}")
        gene_id, accession, sequence = row

        # read .gb to locate CDS start
        gene_dir = get_gene_dir(self.gene_symbol)
        gbfile = get_gene_file(self.gene_symbol, f"{accession}.gb")
        if not os.path.exists(gbfile):
            raise FileNotFoundError(f"Reference file not found: {gbfile}")
    
        record = SeqIO.read(gbfile, "genbank")
        cds_start = None
        for f in record.features:
            if f.type == "CDS":
                cds_start = f.location.start
                break
        if cds_start is None:
            raise ValueError("No CDS found in reference")
        return gene_id, record, cds_start

    def addMutation(self, mut):
        if ">" in mut and mut.startswith("c."):
            try:
                pos = int(mut.split(".")[1].split(">")[0][:-1])
                abs_pos = int(self.cds_start) + pos - 1
                self.cursor.execute("""
                    INSERT INTO annotations (gene_id, start_pos, end_pos, type, description)
                    VALUES (?, ?, ?, ?, ?)
                """, (self.gene_id, abs_pos, abs_pos + 1, "variation", mut))
                self.conn.commit()
                print(f"Added mutation {mut} at {abs_pos}")
            except Exception as e:
                print(f"Could not parse {mut}: {e}")
        else:
            print(f"Not yet implemented {mut}")
    
    def removeMutation(self, mut):
        self.cursor.execute("""
            DELETE FROM annotations WHERE gene_id = ? AND description = ?
        """, (self.gene_id, mut))
        self.conn.commit()
        print(f"Removed mutation {mut}")
    
    def summary(self):
        self.cursor.execute("SELECT description, start_pos FROM annotations WHERE gene_id = ?", (self.gene_id,))
        rows = self.cursor.fetchall()
        if not rows:
            print("No mutations annotated.")
        else:
            print("\nCurrent mutation(s):")
            for desc, pos in rows:
                print(f"- {desc} (pos {pos})")
    
    def close(self):
        self.conn.close()
    

def main():
    gene = input("Enter the gene we are working with: ").strip()
    anno = MutationAnnotator(gene)

    print("\nEnter mutations in HGVS format 'c.20C>G'.")
    print("Multiple mutations separated by commas are allowed.")
    print("Commands: 'exit' to save & quit, 'remove <mutation>' to delete one.\n")

    while True:
        line = input("> ").strip()
        if not line:
            continue
        if line.lower() == "exit":
            break
        if line.startswith("remove"):
            mut = line.split(" ", 1)[1].strip()
            anno.removeMutation(mut)
            continue

        for mut in [m.strip() for m in line.split(",") if m.strip()]:
            anno.addMutation(mut)

    print("\nFinal summary:")
    anno.summary()

def add_mutation_service(gene_symbol, mutation):
    try:
        annotator = MutationAnnotator(gene_symbol)
        annotator.addMutation(mutation)
        annotator.close()
        
        return jsonify({
            "status": "success",
            "message": f"Added mutation '{mutation}' to {gene_symbol}"
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


def remove_mutation_service(gene_symbol, mutation):
    try:
        annotator = MutationAnnotator(gene_symbol)
        annotator.removeMutation(mutation)
        annotator.close()

        return jsonify({
            "status": "success",
            "message": f"Removed mutation '{mutation}' from {gene_symbol}"
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


def list_mutations_service(gene_symbol):
    try:
        annotator = MutationAnnotator(gene_symbol)
        annotator.cursor.execute(
            "SELECT description, start_pos FROM annotations WHERE gene_id = ?",
            (annotator.gene_id,)
        )
        rows = annotator.cursor.fetchall()
        annotator.close()

        return jsonify([
            {"mutation": desc, "position": pos} for desc, pos in rows
        ]), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == "__main__":
    main()