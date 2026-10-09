import json
import re

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

# Check all questions:
# 1. Look for mismatched dates (e.g. 康和, 承暦, 治承, 元治, etc.)
# 2. Check for confusing sect names (曹洞宗 vs 臨済宗 vs 天台宗 vs 真言宗)
# 3. Check for temple founders and major deities

era_checks = [
    # pattern, correct_era or check function
]

results = []
for q in data:
    qid = q['id']
    qtext = q['question']
    ans = q['options'][q['answer']]
    exp = q['explanation']
    
    # Check sect contradictions
    if "曹洞宗" in qtext and "曹洞宗" not in exp.get("history", "") + exp.get("reason", ""):
        results.append((qid, ans, f"Question mentions 曹洞宗, but explanation does not"))
    if "臨済宗" in qtext and "臨済宗" not in exp.get("history", "") + exp.get("reason", ""):
        results.append((qid, ans, f"Question mentions 臨済宗, but explanation does not"))
        
    # Check dates in question vs reason
    years = re.findall(r'(\d{3,4})年', qtext)
    years_reason = re.findall(r'(\d{3,4})年', exp.get("history", "") + exp.get("reason", ""))
    # if years and years_reason and set(years).isdisjoint(set(years_reason)):
    #    pass

print(f"Sect check flags: {len(results)}")
for r in results:
    print(r)
