import json
import re

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

# Print questions where:
# 1. Option text in explanation doesn't match the answer option
# 2. Key phrases indicate confusion
# 3. Known problematic words (e.g. 曹洞宗, 臨済宗, 創建, etc. with questionable combinations)

suspicious = []
for q in data:
    qid = q['id']
    qtext = q['question']
    opts = q['options']
    ans_idx = q['answer']
    ans_text = opts[ans_idx]
    reason = q.get('explanation', {}).get('reason', '')
    history = q.get('explanation', {}).get('history', '')
    tip = q.get('explanation', {}).get('tip', '')
    
    # Check if correct option name is mentioned in reason
    # (sometimes the reason mentions a completely different temple or person!)
    clean_ans = re.sub(r'[（(].*?[)）]', '', ans_text).strip()
    if clean_ans not in reason and clean_ans not in qtext:
        suspicious.append((qid, f"Answer '{clean_ans}' not mentioned in reason or question: reason is '{reason}'"))

print(f"Total flagged by answer mismatch: {len(suspicious)}")
for qid, msg in suspicious[:40]:
    print(f"ID {qid:3d}: {msg}")
