import glob
import re

files = sorted(glob.glob('src/data/questionsPart*.ts'))

# Check 1: Options with asymmetric furigana or extra notes
print("=== SCANNING FOR ASYMMETRIC FURIGANA / ANNOTATIONS IN OPTIONS ===")
single_paren = []
answers_giving_away = []

for f in files:
    content = open(f, encoding='utf-8').read()
    # Match question objects
    # We can split by id: or find question blocks
    q_blocks = re.findall(r'(\{[^{}]*?id:\s*(\d+)[^{}]*?question:\s*[\'"`](.*?)[\'"`][^{}]*?options:\s*\[(.*?)\][^{}]*?answer:\s*(\d+).*?\n\s*\})', content, re.DOTALL)
    
    # Or more robust parsing
    lines = content.split('\n')
    current_id = None
    current_q = None
    current_opts = []
    current_ans = None
    in_opts = False
    
    for idx, line in enumerate(lines):
        id_m = re.search(r'id:\s*(\d+)', line)
        if id_m:
            current_id = int(id_m.group(1))
        q_m = re.search(r'question:\s*[\'"`](.*?)[\'"`]', line)
        if q_m:
            current_q = q_m.group(1)
        opts_m = re.search(r'options:\s*\[(.*?)\]', line)
        if opts_m:
            raw_opts = opts_m.group(1)
            opts = re.findall(r'[\'"`](.*?)[\'"`]', raw_opts)
            ans_m = None
            # look ahead for answer: \d+
            for ahead in lines[idx:idx+15]:
                am = re.search(r'answer:\s*(\d+)', ahead)
                if am:
                    current_ans = int(am.group(1))
                    break
            
            if len(opts) == 4 and current_ans is not None and current_ans < len(opts):
                # Check for furigana (hiragana/katakana in parens)
                has_paren = [bool(re.search(r'[（(][ぁ-んァ-ヶー・]+[)）]', o)) for o in opts]
                has_any_paren = [bool(re.search(r'[（(].*?[)）]', o)) for o in opts]
                
                # If only the correct answer has paren
                if sum(has_paren) == 1 and has_paren[current_ans]:
                    single_paren.append((f, current_id, current_q, opts, current_ans, "Only correct answer has furigana!"))
                elif sum(has_any_paren) == 1 and has_any_paren[current_ans]:
                    single_paren.append((f, current_id, current_q, opts, current_ans, "Only correct answer has parens!"))
                elif sum(has_paren) > 0 and sum(has_paren) < 4:
                    # check if correct answer is one of the few with paren
                    if has_paren[current_ans] and sum(has_paren) <= 2:
                        single_paren.append((f, current_id, current_q, opts, current_ans, f"{sum(has_paren)}/4 have furigana"))

print(f"Found {len(single_paren)} potential furigana/paren giveaways:")
for item in single_paren:
    print(f"File: {item[0]}, ID: {item[1]}, Reason: {item[5]}")
    print(f"  Q: {item[2][:60]}...")
    print(f"  Correct: [{item[4]}] {item[3][item[4]]}")
    print(f"  Options: {item[3]}")
    print()
