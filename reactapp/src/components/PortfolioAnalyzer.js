import React, { useState } from "react";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {
  const [jsonFile, setJsonFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setJsonFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!jsonFile) return alert("Please upload a JSON file");
    setLoading(true);
    try {
      const textData = await jsonFile.text();
      const parsedData = JSON.parse(textData);
      const res = await fetch("http://localhost:5000/upload-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setCustomers(json.customers);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + err.message);
    }
    setLoading(false);
  };

  const handleEvaluate = async (clientId) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/evaluate-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Evaluation failed");
      setSelectedCustomer(json);
    } catch (err) {
      console.error("Evaluation failed:", err);
      alert("Evaluation failed: " + err.message);
    }
    setLoading(false);
  };

  const getPieData = (dataObj, colors) => ({
    labels: Object.keys(dataObj),
    datasets: [
      {
        data: Object.values(dataObj),
        backgroundColor: colors,
      },
    ],
  });

  const getGaugeData = (score) => ({
    labels: ["Score", "Remaining"],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: ["#10b981", "#d1d5db"],
        borderWidth: 0,
      },
    ],
  });

  const gaugeOptions = {
    rotation: -90,
    circumference: 180,
    plugins: { 
        legend: { display: false }, 
        tooltip: { enabled: false } 
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    },
    layout: {
        padding: 10,
    }
  };


  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        minHeight: "100vh",
        color: "#222",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "3rem",
          color: "#023e8a",
          textShadow: "2px 2px #ade8f4",
          marginBottom: "30px",
        }}
      >
        Portfolio Analyzer
      </h2>

      {!selectedCustomer && (
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}
        >
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{
              padding: "10px",
              fontSize: "1rem",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "white",
              width: "100%",
              marginBottom: "15px",
              cursor: "pointer",
            }}
          />
          <button
            onClick={handleUpload}
            style={{
              padding: "10px 25px",
              borderRadius: "15px",
              border: "none",
              backgroundColor: "#00b4d8",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,180,216,0.5)",
              transition: "background-color 0.3s ease",
              marginBottom: "20px",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0077b6")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#00b4d8")}
          >
            Upload
          </button>

          {customers.length > 0 && (
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Customers</h3>
              {customers.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleEvaluate(c.clientId)}
                  style={{
                    display: "block",
                    margin: "8px auto",
                    padding: "8px 15px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#90e0ef",
                    color: "#03045e",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(144,224,239,0.5)",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#48cae4")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#90e0ef")}
                >
                  {c.clientId} → Evaluate
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCustomer && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
            maxWidth: "900px", // REDUCED MAX WIDTH FOR OVERALL BETTER FIT
            margin: "20px auto",
          }}
        >
          {/* Sector Diversification Pie */}
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              height: "300px", 
            }}
          >
            <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}>
              Sector Diversification
            </h3>
            <Pie
              data={getPieData(selectedCustomer.weightedSectorExposure, [
                "#4ade80",
                "#60a5fa",
                "#f87171",
                "#fbbf24",
                "#a78bfa",
                "#f472b6",
              ])}
              options={pieOptions}
            />
          </div>

          {/* Fund Overlaps Pie */}
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              height: "300px", 
            }}
          >
            <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}>
              Fund Overlaps
            </h3>
            <Pie
              data={getPieData(selectedCustomer.fundOverlap, [
                "#60a5fa",
                "#f87171",
                "#fbbf24",
                "#4ade80",
                "#a78bfa",
              ])}
              options={pieOptions}
            />
          </div>

          {/* Portfolio Summary and Recommendations (Full Width) */}
          {selectedCustomer.summary && (
            <div
              style={{
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "15px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                gridColumn: "1 / -1",
              }}
            >
              <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}>
                Portfolio Insights
              </h3>
              
              {/* Summary */}
              <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "10px", background: "#f8f8f8" }}>
                <h4 style={{ fontWeight: "bold", color: "#00b4d8", marginBottom: "5px" }}>Summary:</h4>
                <p>{selectedCustomer.summary}</p>
              </div>

              {/* Recommendations */}
              {selectedCustomer.possibleDiversification && selectedCustomer.possibleDiversification.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: "bold", color: "#023e8a", marginBottom: "5px" }}>Diversification Recommendations:</h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                    {selectedCustomer.possibleDiversification.map((rec, index) => (
                      <li key={index} style={{ marginBottom: "5px" }}>
                        <strong style={{ color: "#dc3545" }}>{rec.sector}:</strong> {rec.recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Horizontal Bar Chart (Reduced Width) */}
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              height: "300px",
              gridColumn: "1 / -1",
              display: "flex", // Enable flex to center content
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h3 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}>
              Overlapping Fund Values
            </h3>
            <div 
              style={{
                width: "80%", // REDUCED WIDTH for bar chart
                height: "calc(100% - 40px)", // Allocate remaining space for chart
                margin: "0 auto", // Center the inner chart container
              }}
            >
              <Bar
                data={getPieData(selectedCustomer.fundOverlap, ["#60a5fa"])}
                options={{
                  indexAxis: "y",
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  responsive: true,
                }}
              />
            </div>
          </div>

          {/* Final Score Gauge (Full Width) */}
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              textAlign: "center",
              gridColumn: "1 / -1",
              display: "flex", 
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "5px" }}>Final Score</h3>
            
            <div style={{ width: "200px", height: "100px", margin: "0 auto", position: "relative" }}>
                <Doughnut
                    data={getGaugeData(selectedCustomer.finalScore)}
                    options={gaugeOptions}
                />
                <p style={{ 
                    position: "absolute", 
                    bottom: "0", 
                    left: "50%", 
                    transform: "translateX(-50%)", 
                    fontWeight: "bold", 
                    fontSize: "1.2rem",
                    color: "#222"
                }}>
                    {selectedCustomer.finalScore.toFixed(2)}
                </p>
            </div>
            
            <button
              onClick={() => setSelectedCustomer(null)}
              style={{
                marginTop: "15px", 
                padding: "8px 20px",
                borderRadius: "15px",
                border: "none",
                backgroundColor: "#dc3545",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(220,53,69,0.5)",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#b02a3b")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
            >
              Back to Upload
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.5rem",
            zIndex: 1000,
          }}
        >
          Processing...
        </div>
      )}
    </div>
  );
}

export default App;
