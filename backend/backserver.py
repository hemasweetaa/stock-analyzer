# -----------------------------------------------------------------------------
# Portfolio Analyzer - Flask Backend
# -----------------------------------------------------------------------------
# To run this server:
# 1. Make sure you have Flask and Flask-CORS installed:
#    pip install Flask Flask-CORS
# 2. Run the script from your terminal:
#    python server.py
# -----------------------------------------------------------------------------

from flask import Flask, request, jsonify
from flask_cors import CORS

# --- App Initialization ---
app = Flask(__name__)
# This is the crucial line that allows the React frontend (from a different origin)
# to make requests to this backend.
CORS(app)

# --- In-Memory Storage ---
# This variable will temporarily store the data from the uploaded JSON file.
# In a real application, you would use a database.
uploaded_data = []

# --- API Routes ---

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

        # --- Analysis Logic ---

        # 1. Fund Overlaps
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

# --- Run the App ---
if __name__ == "__main__":
    # Runs the server on port 5000 and allows debugging.
    app.run(port=3000,debug =True)