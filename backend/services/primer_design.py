import primer3
from utils.paths import get_gene_file, DB_PATH, DATA_DIR
import sqlite3

class PrimerDesigner:
    def __init__(self, gene_symbol):
        self.gene_symbol = gene_symbol
        self.sequence = self.load_sequence()
        print(f"DEBUG: Loaded sequence for {gene_symbol}: {len(self.sequence)} bp")
        print(f"DEBUG: First 100bp: {self.sequence[:100]}")
    
    def load_sequence(self):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT sequence FROM gene_reference WHERE gene_symbol = ?", (self.gene_symbol,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise ValueError(f"No sequence found for {self.gene_symbol}")
        return row[0]
    
    def extract_region_around_mutation(self, mutation_pos, window_size=1000):
        left_flank = 500
        right_flank = 500
        
        start = max(0, mutation_pos - left_flank)
        end = min(len(self.sequence), mutation_pos + right_flank)
        
        return self.sequence[start:end], start
    
    def design_primers_for_mutation(self, mutation, mutation_pos, product_size_range=(400, 900), num_return=10):
        sequence, offset = self.extract_region_around_mutation(mutation_pos)
        
        print(f"DEBUG: Extracted region length: {len(sequence)} bp")
        print(f"DEBUG: Mutation position in full seq: {mutation_pos}")
        print(f"DEBUG: Offset for extraction: {offset}")
        print(f"DEBUG: Mutation relative position in region: {500} (centered)")

        valid_bases = set('ACGTNacgtn')
        if any(base not in valid_bases for base in sequence.upper()):
            print(f"ERROR: Sequence contains invalid characters!")
            invalid = [base for base in sequence.upper() if base not in valid_bases]
            print(f"ERROR: Invalid characters found: {set(invalid)}")
            return {'PRIMER_PAIR_NUM_RETURNED': 0}
        
        seq_args = {
            'SEQUENCE_ID': f'{self.gene_symbol}_{mutation}',
            'SEQUENCE_TEMPLATE': sequence,
        }
        
        global_args = {
            'PRIMER_PRODUCT_SIZE_RANGE': [[product_size_range[0], product_size_range[1]]],
            'PRIMER_NUM_RETURN': num_return,
        }
        print(f"DEBUG: Calling primer3...")

        try:
            result = primer3.bindings.design_primers(seq_args, global_args)
            
            print(f"DEBUG: Primer3 returned type: {type(result)}")
            print(f"DEBUG: Primer3 keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict!'}")
            
            if 'PRIMER_PAIR_NUM_RETURNED' in result:
                print(f"DEBUG: PRIMER_PAIR_NUM_RETURNED: {result['PRIMER_PAIR_NUM_RETURNED']}")
            else:
                print(f"DEBUG: No PRIMER_PAIR_NUM_RETURNED key!")
                print(f"DEBUG: Full result: {result}")
                result['PRIMER_PAIR_NUM_RETURNED'] = 0
                
            return result
            
        except Exception as e:
            print(f"ERROR: Primer3 call failed: {e}")
            import traceback
            traceback.print_exc()
            return {'PRIMER_PAIR_NUM_RETURNED': 0}   
        
    
    def filter_primers_by_mutation_distance(self, primers, mutation_rel_pos):
        filtered_pairs = []

        num_returned = primers.get('PRIMER_PAIR_NUM_RETURNED', 0)
        print(f"DEBUG: Filtering {num_returned} primers")

        if num_returned == 0:
            print(f"DEBUG: No primers to filter")
            return filtered_pairs
        
        for i in range(primers['PRIMER_PAIR_NUM_RETURNED']):
            left_pos = primers[f'PRIMER_LEFT_{i}']
            right_pos = primers[f'PRIMER_RIGHT_{i}']
            product_size = primers[f'PRIMER_PAIR_{i}_PRODUCT_SIZE']

            tm_key = f'PRIMER_PAIR_{i}_PRODUCT_TM'  # NOT f'PRIMER_PAIR_{i}_TM'
            
            if tm_key not in primers:
                print(f"DEBUG: Warning: {tm_key} not found, using default 60°C")
                tm_value = 60.0
            else:
                tm_value = primers[tm_key]
            
            dist_to_left = mutation_rel_pos - left_pos[0]
            dist_to_right = right_pos[0] - mutation_rel_pos

            print(f"DEBUG: Pair {i}: L={dist_to_left}bp, R={dist_to_right}bp, TM={tm_value}°C")
            
            if 150 <= dist_to_left <= 450 and 150 <= dist_to_right <= 450:
                ideal_score = 1 if 200 <= dist_to_left <= 300 and 200 <= dist_to_right <= 300 else 0
                
                filtered_pairs.append({
                    'pair_number': i,
                    'left_primer': primers[f'PRIMER_LEFT_{i}_SEQUENCE'],
                    'right_primer': primers[f'PRIMER_RIGHT_{i}_SEQUENCE'],
                    'product_size': product_size,
                    'tm': tm_value,
                    'dist_to_left': dist_to_left,
                    'dist_to_right': dist_to_right,
                    'ideal': ideal_score
                })

        print(f"DEBUG: After filtering: {len(filtered_pairs)} primers")
        return sorted(filtered_pairs, key=lambda x: (-x['ideal'], x['product_size']))

def design_primers_service(gene_symbol, mutation, mutation_pos, product_size_range=(200, 500), num_return=10):
    try:
        print(f"DEBUG: ===== START primer design =====")
        print(f"DEBUG: Gene: {gene_symbol}, Mutation: {mutation}, Pos: {mutation_pos}")
        designer = PrimerDesigner(gene_symbol)
        primers = designer.design_primers_for_mutation(mutation, mutation_pos, product_size_range, num_return)
        sequence, offset = designer.extract_region_around_mutation(mutation_pos)
        mutation_rel_pos = 500
        
        filtered_primers = designer.filter_primers_by_mutation_distance(primers, mutation_rel_pos)
        print(f"DEBUG: Final result: {len(filtered_primers)} primers")
        print(f"DEBUG: ===== END primer design =====")
        return {
            'mutation': mutation,
            'target_region': sequence,
            'primers': filtered_primers,
            'total_candidates': len(filtered_primers)
        }
    except Exception as e:
        raise ValueError(f"Primer design failed: {str(e)}")