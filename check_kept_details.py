import json

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

import plan_replacements
replace_set = set(plan_replacements.sorted_ids)

# Check all kept questions
kept = [q for q in data if q['id'] not in replace_set]

# Let's verify each kept question's facts
# We can search for any known errors in kept questions:
known_fixes = []

for q in kept:
    qid = q['id']
    qtext = q['question']
    opts = q['options']
    ans = opts[q['answer']]
    
    # Check for parens in options
    for i, opt in enumerate(opts):
        if '(' in opt or '（' in opt:
            # Let's inspect
            known_fixes.append((qid, f"Option {i} has parens: {opt}"))

print(f"Total options with parens in kept questions: {len(known_fixes)}")
for k in known_fixes[:30]:
    print(k)
