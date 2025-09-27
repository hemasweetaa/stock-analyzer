import json
from itertools import combinations

# Use the correct path to your JSON file
with open("C:\\Users\\sweet\\Downloads\\dataset\\data.json", "r") as f:
    data = json.load(f)

# --- FIX IS HERE ---
# Your JSON is a list `[]` containing one portfolio object `{}`.
# We first need to get that object from the list using its index `[0]`.
portfolio_object = data[0]
funds = portfolio_object["funds"]

# The rest of your logic remains the same
total_portfolio_value = sum(fund["amount"] for fund in funds)

def fund_overlap(fund1, fund2):
    all_stocks = set(fund1["holdings"].keys()) | set(fund2["holdings"].keys())
    overlap = 0
    for stock in all_stocks:
        overlap += min(fund1["holdings"].get(stock, 0), fund2["holdings"].get(stock, 0))
    return overlap * 100

pair_overlaps = []
if len(funds) > 1:
    for f1, f2 in combinations(funds, 2):
        pair_overlaps.append(fund_overlap(f1, f2))
    
    avg_overlap = sum(pair_overlaps) / len(pair_overlaps)
    overlap_score = (1 - avg_overlap / 100) * 100
else:
    # Handle case with only one fund (no overlap possible)
    avg_overlap = 0
    overlap_score = 100

sector_totals = {}
if total_portfolio_value > 0:
    for fund in funds:
        weight = fund["amount"] / total_portfolio_value
        for sector, pct in fund["sectors"].items():
            sector_totals[sector] = sector_totals.get(sector, 0) + pct * weight

hhi = sum(v**2 for v in sector_totals.values())
sector_score = (1 - hhi) * 100

final_score = 0.5 * overlap_score + 0.5 * sector_score

print(f"Average Overlap: {avg_overlap:.2f}%")
print(f"Overlap Score: {overlap_score:.2f}")
print(f"Weighted Sector Exposure: {sector_totals}")
print(f"HHI: {hhi:.3f}")
print(f"Sector Score: {sector_score:.2f}")
print(f"Final Diversification Score: {final_score:.2f}")