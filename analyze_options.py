import glob
import re

files = sorted(glob.glob('src/data/questionsPart*.ts'))

# We want to identify all options across all questions that have:
# 1. Furigana/reading in parens, e.g. （とりいがた）, （みふねまつり）, （にんせい）
# 2. Explanatory text / alias in parens, e.g. （曼荼羅山・20:20点火）, （岩倉実相院）, （天神川）, （お決まり）
# 
# Notice: In 京都検定 (Kyoto Certification Exam), multiple choice options in the real exam do NOT have:
# - Furigana only on one choice
# - Spoilers like time of lighting (20:20点火) or detailed hints
# 
# Let's inspect each question where:
# - Some options have parens while other options don't
# - Or where parens contain readings or explanations that give away the answer or create obvious asymmetry

asymmetric_issues = []

for f in files:
    content = open(f, encoding='utf-8').read()
    # Find question blocks
    # Using regex to capture:
    # id: number
    # question: string
    # options: array
    # answer: number
    # choiceExplanations: array
    pattern = r'\{\s*id:\s*(\d+),.*?category:\s*[\'"`](.*?)[\'"`],.*?difficulty:\s*[\'"`](.*?)[\'"`],.*?question:\s*[\'"`](.*?)[\'"`],.*?options:\s*\[(.*?)\]\s*,.*?answer:\s*(\d+)'
    matches = re.finditer(pattern, content, re.DOTALL)
    for m in matches:
        qid = int(m.group(1))
        category = m.group(2)
        question_text = m.group(4)
        raw_options = m.group(5)
        ans = int(m.group(6))
        
        opts = re.findall(r'[\'"`](.*?)[\'"`]', raw_options)
        if len(opts) != 4:
            continue
            
        # Check parens in opts
        has_paren = [bool(re.search(r'[（(].*?[)）]', o)) for o in opts]
        num_paren = sum(has_paren)
        
        if num_paren > 0 and num_paren < 4:
            asymmetric_issues.append({
                'file': f,
                'id': qid,
                'question': question_text,
                'options': opts,
                'answer': ans,
                'num_paren': num_paren,
                'correct_has_paren': has_paren[ans]
            })

print(f"Total questions with asymmetric parens in options: {len(asymmetric_issues)}")
for issue in asymmetric_issues[:30]:
    print(f"[{issue['file']} ID:{issue['id']}] (Correct has paren: {issue['correct_has_paren']}, total parens: {issue['num_paren']}/4)")
    print(f"  Q: {issue['question'][:50]}...")
    print(f"  Ans: {issue['options'][issue['answer']]}")
    print(f"  Opts: {issue['options']}")
