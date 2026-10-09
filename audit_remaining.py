import json
import re

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

with open('plan_replacements.py', 'r', encoding='utf-8') as f:
    # get sorted_ids
    pass

# We can import plan_replacements
import plan_replacements
replace_set = set(plan_replacements.sorted_ids)

remaining = [q for q in data if q['id'] not in replace_set]
print(f"Remaining questions to keep and audit: {len(remaining)}")

# Check remaining for factual issues or anomalies
anomalies = []
for q in remaining:
    qid = q['id']
    qtext = q['question']
    ans = q['options'][q['answer']]
    exp = q['explanation']
    
    # 1. Check if answer index matches
    if not q['choiceExplanations'][q['answer']]['isCorrect']:
        anomalies.append((qid, ans, "Answer index not marked isCorrect"))
        
    # 2. Check for missing or suspicious explanation fields
    for field in ['reason', 'history', 'trivia', 'tip']:
        if not exp.get(field) or len(exp.get(field).strip()) < 10:
            anomalies.append((qid, ans, f"Field '{field}' empty or too short"))

    # 3. Check for specific known historical pitfalls:
    # - "阿弥陀如来" vs "釈迦如来"
    # - "真言宗" vs "天台宗" vs "浄土宗" vs "臨済宗" vs "律宗"
    # - Imperial reign or era contradictions

print(f"Total anomalies found: {len(anomalies)}")
for a in anomalies:
    print(a)
