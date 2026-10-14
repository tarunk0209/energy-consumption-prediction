
import { useCallback, useEffect, useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { apiRequest } from "./api";

function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/energy-predictions");
      setPredictions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  return (
    <div className="data-page">
      <div className="data-page-heading">
        <div className="data-page-title">
          <div className="data-page-icon">
            <History size={23} />
          </div>

          <div>
            <h2>Prediction History</h2>
            <p>Review saved energy predictions.</p>
          </div>
        </div>

        <button
          className="secondary-button"
          onClick={loadPredictions}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <section className="data-panel table-panel">
        <h3>Saved predictions</h3>

        <p className="panel-description">
          {predictions.length} prediction record(s)
        </p>

        {error && (
          <div className="feedback-message feedback-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p className="empty-state">Loading predictions...</p>
        ) : predictions.length === 0 ? (
          <p className="empty-state">
            No predictions found. Predict energy for a production
            batch first.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prediction ID</th>
                  <th>Production Batch</th>
                  <th>Estimated Energy</th>
                  <th>Unit</th>
                </tr>
              </thead>

              <tbody>
                {predictions.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>#{item.production_batch_id}</td>
                    <td className="record-name">
                      {Number(item.estimated_energy).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 2 }
                      )}
                    </td>
                    <td>{item.unit || "kWh"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PredictionHistory;
