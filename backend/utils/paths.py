import os

SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SERVICE_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")
SQL_DIR = os.path.join(DATA_DIR, "sql")
DB_PATH = os.path.join(SQL_DIR, "miniclc.db")

def get_gene_dir(gene_symbol):
    return os.path.join(DATA_DIR, gene_symbol)

def get_gene_file(gene_symbol, filename):
    gene_dir = get_gene_dir(gene_symbol)
    return os.path.join(gene_dir, filename)