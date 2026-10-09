import json
from collections import defaultdict

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

print(f"Total questions loaded: {len(data)}")

# 1. Check duplicate answers
by_ans = defaultdict(list)
for q in data:
    ans_text = q['options'][q['answer']]
    by_ans[ans_text].append(q)

dups = {k: v for k, v in by_ans.items() if len(v) > 1}
print(f"\n=== DUPLICATE ANSWERS ({len(dups)} groups) ===")
for ans, qlist in sorted(dups.items(), key=lambda x: -len(x[1])):
    ids = [q['id'] for q in qlist]
    print(f"\n[{ans}] (Count: {len(qlist)}, IDs: {ids})")
    for q in qlist:
        print(f"  ID {q['id']:3d}: {q['question'][:80]}")

# 2. Check duplicate questions texts (similarity or identical)
print("\n=== SUSPICIOUS DUPLICATE TOPICS ===")
# Check questions asking about the same key entities
entities = [
    "詩仙堂", "修学院離宮", "安楽寺", "法然院", "半木神社", "火焚祭", "貴船神社",
    "吉田神社", "通天橋", "白砂壇", "大的全国大会", "大根焚き", "追儺式",
    "二条河原の落書", "型友禅", "御室桜", "をけら詣り", "林丘寺", "西陣焼け",
    "京銘竹", "宝厳院", "寺田屋", "伏見城", "芭蕉庵", "御手洗祭", "保元の乱",
    "承久の乱", "嘉吉の乱", "仁和寺", "神護寺", "粟田焼", "御霊神社", "平野神社",
    "壬生寺", "正中の変", "晴明神社", "若冲忌", "野村美術館", "細見美術館",
    "松尾大社", "清水寺", "平安神宮"
]
for ent in entities:
    matched = [q for q in data if ent in q['question'] or ent == q['options'][q['answer']]]
    if len(matched) > 2:
        print(f"\nEntity '{ent}' mentioned in {len(matched)} questions: IDs {[q['id'] for q in matched]}")
