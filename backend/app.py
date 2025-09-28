from flask import Flask, request, jsonify
from flask_cors import CORS
import json

import os
from mistralai import Mistral

api_key = "OdiZyl1L89SipmYTIcBlV68RrC1kxvgV"
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

app = Flask(__name__)
CORS(app)  # allow frontend to call backend

stock_data = []

uploaded_data = []

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

    chat_response = client.chat.complete(
    model= model,
    messages = [
        {
            "role": "user",
            "content": f"Provide a concise summary of the following financial analysis feedback for a stock: with params ['priceEarningsRatio'] ['priceperShare'] ['dividendYield'] ['debttor'] for each parameter:",
        },
    ]
)
#print(chat_response.choices[0].message.content),

    return jsonify({"stockSymbol": symbol, "feedback": feedback, "summary": chat_response.choices[0].message.content})

@app.route("/")
def index():
    """ A simple root route to easily check if the server is running. """
    return "<h1>Backend is running!</h1><p>You can now use the React application.</p>"

@app.route("/upload-json", methods=["POST"])
def upload_json():
    """
    Receives a JSON file from the frontend, stores its content,
    and returns a list of customer client IDs.
    """
    global uploaded_data
    try:
        data = request.get_json()
        if not data or not isinstance(data, list):
            return jsonify({"error": "Invalid or empty JSON. Expected a list of customers."}), 400
        
        uploaded_data = data
        
        # Extract just the client IDs to send back to the frontend for selection.
        customer_list = [{"clientId": c.get("clientId")} for c in uploaded_data if "clientId" in c]
        return jsonify({"customers": customer_list})

    except Exception as e:
        print(f"Error in /upload-json: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route("/evaluate-customer", methods=["POST"])
def evaluate_customer():
    """
    Evaluates a specific customer based on their clientId and returns a full analysis.
    """
    try:
        client_id = request.json.get("clientId")
        if not client_id:
            return jsonify({"error": "clientId is required."}), 400

        customer = next((c for c in uploaded_data if c.get("clientId") == client_id), None)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        funds = customer.get("funds", [])
        if not funds:
            return jsonify({"error": "Customer has no funds to analyze."}), 400
            
        total_amount = sum(f.get("amount", 0) for f in funds)
        if total_amount == 0:
            # Handle case where funds exist but total amount is zero
            return jsonify({
                "clientId": client_id, "currency": customer.get("currency"),
                "fundOverlap": {}, "overlapScore": 100, "sectorScore": 100,
                "finalScore": 100, "weightedSectorExposure": {}
            })
        fundOverlap = {}
        overlapList = []
        for i in range(len(funds)):
            for j in range(i + 1, len(funds)):
                f1 = funds[i]
                f2 = funds[j]
                common_holdings = set(f1.get("holdings", {}).keys()) & set(f2.get("holdings", {}).keys())
                overlap = sum(min(f1["holdings"][h], f2["holdings"][h]) for h in common_holdings)
                overlapList.append(overlap)
                fundOverlap[f"{f1.get('fundCode', 'N/A')} vs {f2.get('fundCode', 'N/A')}"] = overlap
        
        avgOverlap = sum(overlapList) / len(overlapList) if overlapList else 0
        overlapScore = max(0, (1 - avgOverlap) * 100)

        # 2. Sector Diversification (using Herfindahl-Hirschman Index - HHI)
        sectorExposure = {}
        for f in funds:
            share = f.get("amount", 0) / total_amount
            for sec, val in f.get("sectors", {}).items():
                sectorExposure[sec] = sectorExposure.get(sec, 0) + share * val
        
        HHI = sum(v**2 for v in sectorExposure.values())
        sectorScore = max(0, (1 - HHI) * 100)

        # 3. Final Weighted Score
        finalScore = 0.5 * overlapScore + 0.5 * sectorScore

        result = {
            "clientId": customer.get("clientId"),
            "currency": customer.get("currency"),
            "fundOverlap": fundOverlap,
            "overlapScore": overlapScore,
            "sectorScore": sectorScore,
            "finalScore": finalScore,
            "weightedSectorExposure": sectorExposure
        }
        return jsonify(result)

    except Exception as e:
        print(f"Error in /evaluate-customer: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == "__main__":
    app.run(debug=True)
