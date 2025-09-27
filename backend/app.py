from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # allow frontend to call backend

stock_data = []

def generate_feedback(params):
    return {
        "priceEarningsRatio": f"The price-to-earnings ratio of {params['priceEarningsRatio']} indicates "
                              f"{'the stock is relatively expensive compared to its earnings.' if params['priceEarningsRatio'] > 30 else 'the stock is reasonably priced.'}",
        "earningsPerShare": f"The earnings per share of {params['earningsPerShare']} is "
                            f"{'a strong indicator of the company’s profitability.' if params['earningsPerShare'] > 5 else 'moderate.'}",
        "dividendYield": f"The dividend yield of {params['dividendYield']}% is "
                         f"{'attractive for income-seeking investors.' if params['dividendYield'] > 2 else 'lower compared to the market average.'}",
        "marketCap": f"The market capitalization of ${round(params['marketCap']/1e12,2)} trillion indicates company size.",
        "debtToEquityRatio": f"The debt-to-equity ratio of {params['debtToEquityRatio']} suggests "
                             f"{'high leverage and potential financial risk.' if params['debtToEquityRatio'] > 2 else 'a moderate level of leverage.'}",
        "returnOnEquity": f"The return on equity of {params['returnOnEquity']*100:.1f}% is a healthy sign of efficiency.",
        "returnOnAssets": f"The return on assets of {params['returnOnAssets']*100:.1f}% indicates asset utilization.",
        "currentRatio": f"The current ratio of {params['currentRatio']} suggests "
                        f"{'a good short-term liquidity position.' if params['currentRatio'] >= 1 else 'a potential liquidity risk.'}",
        "quickRatio": f"The quick ratio of {params['quickRatio']} indicates "
                      f"{'a strong ability to meet short-term obligations.' if params['quickRatio'] >= 1 else 'possible liquidity issues.'}",
        "bookValuePerShare": f"The book value per share of {params['bookValuePerShare']} represents the company’s net asset value per share."
    }

@app.route("/upload", methods=["POST"])
def upload_files():
    global stock_data
    json_file = request.files.get("json")

    if not json_file:
        return jsonify({"error": "JSON file is required"}), 400

    # Parse JSON
    stock_data = json.load(json_file)

    return jsonify({"message": "JSON file uploaded successfully"})

@app.route("/companies", methods=["GET"])
def get_companies():
    # Extract company list from JSON
    companies = [{"companyName": s.get("companyName", ""), "stockSymbol": s["stockSymbol"]}
                 for s in stock_data]
    return jsonify(companies)

@app.route("/evaluate/<symbol>", methods=["GET"])
def evaluate_company(symbol):
    stock = next((s for s in stock_data if s["stockSymbol"] == symbol), None)
    if not stock:
        return jsonify({"error": "Stock not found"}), 404

    feedback = generate_feedback(stock["parameters"])
    summary = (
        f"Overall, {symbol} has strong financial metrics, including a high earnings per share "
        f"and return on equity. However, the price-to-earnings ratio is relatively high, indicating that "
        "the stock may be overvalued. The company has a moderate level of debt and good liquidity ratios, "
        "suggesting a stable financial position."
    )

    return jsonify({"stockSymbol": symbol, "feedback": feedback, "summary": summary})

if __name__ == "__main__":
    app.run(debug=True)
