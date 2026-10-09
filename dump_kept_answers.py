import json
import re

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

import plan_replacements
replace_set = set(plan_replacements.sorted_ids)

kept = [q for q in data if q['id'] not in replace_set]

def norm(s):
    s = re.sub(r'[（(].*?[)）]', '', s)
    s = re.sub(r'[・\s、,「」『』]', '', s)
    s = re.sub(r'^(京都市|中京区|上京区|下京区|左京区|右京区|東山区|西京区|南区|北区|伏見区|山科区)', '', s)
    return s.strip()

kept_answers = set(norm(q['options'][q['answer']]) for q in kept)
print(f"Total unique answers in kept questions: {len(kept_answers)}")

# Let's save kept answers to a file so our question generation script can verify uniqueness
with open('kept_answers.txt', 'w', encoding='utf-8') as f:
    for ans in sorted(kept_answers):
        f.write(ans + '\n')

print("Wrote kept_answers.txt")
