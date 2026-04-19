import os
import sys
import argparse
import sqlite3
import re
from Bio import Entrez, SeqIO
from utils.paths import SQL_DIR, DB_PATH, get_gene_dir
Entrez.email = "leminhhlls2002@gmail.com"

os.makedirs(SQL_DIR, exist_ok=True)

def main():
    parser = argparse.ArgumentParser(description="Fetch reference sequences from NCBI by gene name")
    parser.add_argument("gene", help="Gene symbol (e.g. HBB)")
    args = parser.parse_args()

    gene = args.gene
    gene_dir = get_gene_dir(gene)
    os.makedirs(gene_dir, exist_ok=True)
    ids = search_gene(gene)

    if not ids:
        print(f"[!] No hits for {gene}")
        sys.exit(1)

    summaries = []
    
    print("[*] Getting summaries...")
    handle = Entrez.esummary(db="nucleotide", id=",".join(ids))
    records = Entrez.read(handle)
    print("[+] Summaries received.")
    handle.close()

    print(f"\nResults for {gene}:")
    for i, rec in enumerate(records, 1): #type: ignore
        acc = rec["AccessionVersion"]
        title = rec["Title"]
        summaries.append(acc)
        print(f"{i}. {acc} — {title}")

    choice = input("\nEnter numbers to fetch (e.g. 2 3 5, or 0 to exit): ").strip()
    if choice == "0":
        print("[*] Exiting without fetching.")
        sys.exit(0)
    if choice:
        nums = [int(x) for x in choice.split() if x.isdigit()]
        for n in nums:
            if 1 <= n <= len(summaries):
                print("[*] Fetching accessions...")
                fetch_accession(summaries[n-1], gene)
                print("[+] Finished!")
            else:
                print(f"[!] Invalid choice: {n}")

def search_gene(gene_name, retmax = 10):
    if is_accession(gene_name):
        print(f"[*] Detected accession format, fetching summary for {gene_name}...")
        try:
            handle = handle = Entrez.esummary(db="nucleotide", id=gene_name)
            records = Entrez.read(handle)
            handle.close()
            if not records:
                return []
            rec = records[0] #type: ignore
            return [{
                "id": rec["Id"],
                "accession": rec["AccessionVersion"],
                "title": rec["Title"],
                "length": rec.get("Length", 0)
            }]
        except Exception as e:
            print(f"[!] Failed to fetch accession summary: {e}")
            return []

    print(f"[*] Searching Entrez for {gene_name}...")
    search_term = f"{gene_name}[Gene] AND Homo sapiens[Organism]"
    handle = Entrez.esearch(
        db="nucleotide",
        term=search_term,
        retmax=retmax
    )
    print("[+] Search done.")
    record = Entrez.read(handle)
    handle.close()

    ids = record["IdList"] #type: ignore
    print(f"[+] Search done. Found {len(ids)} ID(s).")
    if not ids:
        return []
    
    print("[*] Getting summaries...")
    handle = Entrez.esummary(db="nucleotide", id=",".join(ids))
    records = Entrez.read(handle)
    print("[+] Summaries received.")
    handle.close()

    results = []
    for rec in records: #type: ignore
        results.append({
            "id": rec["Id"],
            "accession": rec["AccessionVersion"],
            "title": rec["Title"],
            "length": rec.get("Length", 0)
        })
    
    return results

def fetch_accession(accession_id, gene_symbol):
    gene_dir = get_gene_dir(gene_symbol)
    os.makedirs(gene_dir, exist_ok=True)

    handle = Entrez.efetch(db="nucleotide", id=accession_id, rettype="gb", retmode="text")
    records = list(SeqIO.parse(handle, "genbank"))
    handle.close()

    if not records: #type: ignore
        print(f"[!] No sequence found for {accession_id}")
        return None
    
    seq_record = records[0]
    acc_name = seq_record.id.split("|")[0]

    out_path = os.path.join(gene_dir, f"{acc_name}.gb")
    SeqIO.write(seq_record, out_path, "genbank")
    print(f"[+] Saved {accession_id} → {out_path}")

    load_gb_to_sql(out_path)

    return out_path

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS gene_reference (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gene_symbol TEXT,
        accession TEXT UNIQUE,
        sequence TEXT,
        length INTEGER
    )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS annotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gene_id INTEGER,
        start_pos INTEGER,
        end_pos INTEGER,
        type TEXT,
        description TEXT,
        FOREIGN KEY (gene_id) REFERENCES gene_reference(id)
    )
    """)
    conn.commit()
    return conn

def load_gb_to_sql(gbfile):
    conn = init_db()
    c = conn.cursor()
    
    record = SeqIO.read(gbfile, "genbank")

    accession = record.id
    sequence = str(record.seq)
    length = len(record.seq)

    gene_symbol = None
    for feature in record.features:
        if feature.type == "gene" and "gene" in feature.qualifiers:
            gene_symbol = feature.qualifiers["gene"][0]
            break
    if not gene_symbol:
        gene_symbol = record.name

    c.execute("""
        INSERT OR IGNORE INTO gene_reference (gene_symbol, accession, sequence, length)
        VALUES (?, ?, ?, ?)
    """, (gene_symbol, accession, sequence, length))
    conn.commit()
    conn.close()

def is_accession(term):
    return bool(re.match(r'^[A-Z]{1,2}_\d+(\.\d+)?$', term.strip()))

if __name__ == "__main__":
    main()