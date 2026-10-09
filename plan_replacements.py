import json
import re
from collections import defaultdict

with open('src/data/questionsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('= [') + 2
end = text.rfind('];') + 1
data = json.loads(text[start:end])

def norm(s):
    s = re.sub(r'[（(].*?[)）]', '', s)
    s = re.sub(r'[・\s、,「」『』]', '', s)
    s = re.sub(r'^(京都市|中京区|上京区|下京区|左京区|右京区|東山区|西京区|南区|北区|伏見区|山科区)', '', s)
    return s.strip()

# Build groups
groups = defaultdict(list)
for q in data:
    ans = norm(q['options'][q['answer']])
    groups[ans].append(q)

# Special cases:
# - 御金神社: ID 51 is hallucinated, ID 547 is correct. So keep 547, replace 51!
# - 狸谷山不動院: ID 507 is correct, ID 362 and 657 are hallucinated. Keep 507, replace 362 and 657!
# - 石峰寺: ID 184 is correct, ID 402 is hallucinated, ID 120 and 665 are duplicates. Keep 184, replace 120, 402, 665!
# - 祇王寺: ID 281 is correct, ID 452 is hallucinated. Keep 281, replace 452!
# - 宝厳院: ID 542 is correct, ID 648 is hallucinated. Keep 542, replace 648!
# - 圓光寺: ID 337 is correct, ID 117, 442, 487, 688 are duplicates/hallucinated. Keep 337, replace 117, 442, 487, 688!
# - 本能寺跡: ID 39 and ID 516. Keep 39, replace 516!
# - 曼殊院: ID 183 is correct, replace 342, 552, 637, 692!
# - 詩仙堂: ID 73 is correct, replace 152, 188, 248, 323, 382, 567, 633!
# - 事始め: ID 63 is correct, replace 160, 229, 385, 515, 645!
# - 鞍馬の火祭: ID 79 is correct, replace 225, 400, 525, 620!
# - やすらい祭: ID 205 is correct, replace 272, 364, 410, 610!
# - 松琴亭: ID 4 is correct, replace 113, 268, 408, 558!
# - 琵琶湖疏水: ID 65 is correct, replace 191, 286, 375!
# - 無鄰菴: ID 101 is correct, replace 298, 518, 613!
# - 実相院: ID 497 is correct, replace 122, 623, 683!
# - 野々村仁清: ID 159 is correct, replace 150, 228, 294!
# - 水無月: ID 200 is correct, replace 434, 509, 600!
# - 廬山寺: ID 212 is correct, replace 277, 532, 617!
# - 東求堂: ID 230 is correct, replace 261, 338, 463!
# - 法勝寺: ID 30 is correct, replace 481, 586!
# - 表千家: ID 105 is correct, replace 194, 439 (ID 439 had "長男" hallucination)!

# Let's collect ALL ids to replace
replace_map = {} # id -> (reason, category)

# Add all duplicate groups
for ans, qlist in groups.items():
    if len(qlist) > 1:
        # Determine keeper
        if ans == "御金神社":
            keeper = 547
        elif ans == "狸谷山不動院":
            keeper = 507
        elif ans == "石峰寺":
            keeper = 184
        elif ans == "祇王寺":
            keeper = 281
        elif ans == "宝厳院":
            keeper = 542
        elif ans == "圓光寺":
            keeper = 337
        elif ans == "実相院":
            keeper = 497
        else:
            keeper = qlist[0]['id']
            
        for q in qlist:
            if q['id'] != keeper:
                replace_map[q['id']] = (f"Duplicate of {ans} (keeper: ID {keeper})", q['category'])

# Also check Honno-ji duplicate (ID 39 vs 516)
if 516 not in replace_map:
    replace_map[516] = ("Duplicate of 本能寺跡 (keeper: ID 39)", "歴史・史跡")

print(f"Total questions marked for replacement: {len(replace_map)}")
print("IDs to replace sorted:")
sorted_ids = sorted(replace_map.keys())
print(sorted_ids)

# Check categories of questions to replace
cat_counts = defaultdict(int)
for qid in sorted_ids:
    cat = replace_map[qid][1]
    cat_counts[cat] += 1
print("\nCategories to replace:")
for c, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f"  {c}: {cnt}")
