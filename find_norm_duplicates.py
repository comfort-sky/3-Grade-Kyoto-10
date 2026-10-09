import json
import re
from difflib import SequenceMatcher

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

# Normalize answers
def norm(s):
    # remove parens, punctuation, spaces, pref/ward
    s = re.sub(r'[（(].*?[)）]', '', s)
    s = re.sub(r'[・\s、,「」『』]', '', s)
    s = re.sub(r'^(京都市|中京区|上京区|下京区|左京区|右京区|東山区|西京区|南区|北区|伏見区|山科区)', '', s)
    return s.strip()

by_norm = {}
duplicates = []

for q in data:
    qid = q['id']
    ans = q['options'][q['answer']]
    n_ans = norm(ans)
    if n_ans in by_norm:
        duplicates.append((by_norm[n_ans], q))
    else:
        by_norm[n_ans] = q

print(f"Total normalized duplicate pairs found: {len(duplicates)}")
for q1, q2 in duplicates:
    print(f"ID {q1['id']:3d} & ID {q2['id']:3d}: Ans1='{q1['options'][q1['answer']]}' | Ans2='{q2['options'][q2['answer']]}'")
    print(f"  Q1: {q1['question'][:60]}")
    print(f"  Q2: {q2['question'][:60]}\n")
