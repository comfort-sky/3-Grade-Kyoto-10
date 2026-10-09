import json
import re

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

# Let's inspect each question's question text, correct option, and explanation
# Print each question's key facts to inspect
with open('all_questions_summary.txt', 'w', encoding='utf-8') as out:
    for q in data:
        qid = q['id']
        ans = q['options'][q['answer']]
        out.write(f"ID {qid:3d} | Cat: {q.get('category')} | Ans: {ans}\n")
        out.write(f"  Q: {q['question']}\n")
        out.write(f"  Opts: {q['options']}\n")
        out.write(f"  Reason: {q.get('explanation', {}).get('reason', '')}\n\n")

print("Wrote all_questions_summary.txt")
