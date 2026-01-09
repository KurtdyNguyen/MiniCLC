import os
import sys
from Bio import Entrez, SeqIO
from utils.paths import DATA_DIR
Entrez.email = "leminhhlls2002@gmail.com"

def main():
    if len(sys.argv) < 2:
        print("Usage: python fetch_by_accession.py <accession>")
        print("Example: python fetch_by_accession.py NM_001105.5")
        sys.exit(1)
    accession = sys.argv[1]
    fetch_by_accession(accession)

def fetch_by_accession(accession):
    print(f"Fetching {accession}...")
    
    try:
        handle = Entrez.efetch(db="nucleotide", id=accession, rettype="gb", retmode="text")
        record = SeqIO.read(handle, "genbank")
        handle.close()
        
        filename = f"{accession}.gb"
        output_path = os.path.join(DATA_DIR, filename)
        SeqIO.write(record, output_path, "genbank")
        
        print(f"Saved to: {output_path}")
        print(f"Title: {record.description}")
        print(f"Length: {len(record)} bp")
        
        from services.fetch_gene import load_gb_to_sql
        load_gb_to_sql(output_path)
        
        return output_path
        
    except Exception as e:
        print(f"Error fetching {accession}: {e}")
        return None

if __name__ == "__main__":
    main()