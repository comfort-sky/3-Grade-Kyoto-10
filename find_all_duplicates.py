import json
import re
from collections import defaultdict

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

print(f"Total questions: {len(data)}")

# Let's inspect all questions and flag:
# 1. Any duplicate answers (same answer text used > 1 time)
# 2. Any duplicate concepts in question text (e.g. asking about the same event, person, or temple)
# 3. Known hallucinations or contradictory statements

by_ans = defaultdict(list)
for q in data:
    ans_text = q['options'][q['answer']]
    by_ans[ans_text].append(q)

dups = {k: v for k, v in by_ans.items() if len(v) > 1}

print("\n--- ALL DUPLICATE ANSWER GROUPS ---")
duplicate_ids_to_replace = []
for ans, qlist in sorted(dups.items(), key=lambda x: -len(x[1])):
    # Keep the first (or best) question in the group, mark the rest for replacement with new questions
    best_q = qlist[0]
    other_qs = qlist[1:]
    print(f"[{ans}] keep ID {best_q['id']}, replace IDs: {[q['id'] for q in other_qs]}")
    for q in other_qs:
        duplicate_ids_to_replace.append((q['id'], ans, q['category']))

print(f"\nTotal duplicate questions to replace: {len(duplicate_ids_to_replace)}")
