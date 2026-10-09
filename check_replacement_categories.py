import json
import plan_replacements

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

# Map id to current question category
id_to_cat = {q['id']: q['category'] for q in data}

# Print target replacement ids grouped by category
from collections import defaultdict
cat_to_ids = defaultdict(list)
for qid in plan_replacements.sorted_ids:
    cat = id_to_cat[qid]
    cat_to_ids[cat].append(qid)

for cat, ids in sorted(cat_to_ids.items()):
    print(f"Category: {cat} (count {len(ids)}): {ids}")
