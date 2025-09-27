import React, { useState } from "react";

function App() {
  const [companies, setCompanies] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);

  const handleUpload = async () => {
    if (!jsonFile) {
      alert("Please upload a JSON file");
      return;
    }

    const formData = new FormData();
    formData.append("json", jsonFile);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setFilesUploaded(true);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + err.message);
    }
  };

  const fetchCompanies = async () => {
    const res = await fetch("http://localhost:5000/companies");
    const data = await res.json();

    // Initialize status for each company
    const companiesWithStatus = data.map((c) => ({
      ...c,
      status: "Analyzing",
    }));
    setCompanies(companiesWithStatus);
  };

  const evaluateCompany = async (symbol, index) => {
    const res = await fetch(`http://localhost:5000/evaluate/${symbol}`);
    const data = await res.json();
    setPopupData(data);

    // Update status to "Analyzed" once button is clicked
    setCompanies((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, status: "Analyzed" } : c
      )
    );
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
        Stock Analyzer
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          accept=".json"
          onChange={(e) => setJsonFile(e.target.files[0])}
          style={{
            padding: "8px",
            fontSize: "1rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            background: "white",
          }}
        />
        <button
          onClick={handleUpload}
          style={{
            padding: "8px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#00b4d8",
            color: "white",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,180,216,0.5)",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0077b6")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#00b4d8")}
        >
          Upload
        </button>
      </div>

      {filesUploaded && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={fetchCompanies}
            style={{
              padding: "10px 30px",
              borderRadius: "15px",
              backgroundColor: "#90e0ef",
              border: "none",
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#03045e",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(144,224,239,0.6)",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#48cae4")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#90e0ef")}
          >
            Parser
          </button>
        </div>
      )}

      {companies.length > 0 && (
        <>
          <p
            style={{
              fontWeight: "600",
              fontSize: "1.1rem",
              marginBottom: "10px",
            }}
          >
            Loaded companies count: {companies.length}
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#90e0ef",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#00b4d8",
                  color: "white",
                  borderRadius: "10px",
                }}
              >
                <th style={{ padding: "14px 10px" }}>Stock Symbol</th>
                <th style={{ padding: "14px 10px" }}>Analyzer Status</th>
                <th style={{ padding: "14px 10px" }}>Analyzer Button</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#caf0f8" : "#ade8f4",
                    fontWeight: "600",
                    color: "#03045e",
                  }}
                >
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {c.stockSymbol}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: c.status === "Analyzed" ? "green" : "#ff8800",
                    }}
                  >
                    {c.status}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => evaluateCompany(c.stockSymbol, i)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "15px",
                        border: "none",
                        backgroundColor: "#00b4d8",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(0,180,216,0.5)",
                        transition: "background-color 0.3s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#0077b6")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#00b4d8")
                      }
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Popup Modal for evaluation results */}
      {popupData && (
        <div
          onClick={() => setPopupData(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "20px",
              maxWidth: "600px",
              width: "90%",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
                fontWeight: "bold",
                textAlign: "center",
                color: "#0077b6",
              }}
            >
              Evaluation: {popupData.stockSymbol}
            </h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#00b4d8",
                    color: "white",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px" }}>Metric</th>
                  <th style={{ padding: "10px" }}>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(popupData.feedback).map(([key, value]) => (
                  <tr
                    key={key}
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: "#caf0f8",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        color: "#0077b6",
                        textTransform: "capitalize",
                      }}
                    >
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </td>
                    <td style={{ padding: "10px", color: "#03045e" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p
              style={{
                marginTop: "15px",
                fontWeight: "bold",
                color: "#0077b6",
              }}
            >
              Summary: {popupData.summary}
            </p>
            <div style={{ textAlign: "center", marginTop: "25px" }}>
              <button
                onClick={() => setPopupData(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "15px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(220,53,69,0.5)",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#b02a3b")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#dc3545")
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;