
import { useCallback, useEffect, useState } from "react";
import { Zap, Activity, RefreshCw, Gauge } from "lucide-react";
import { apiRequest } from "./api";

function EnergyPrediction() {
  const [batches, setBatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [batchData, predictionData] = await Promise.all([
        apiRequest("/production-batches"),
        apiRequest("/energy-predictions"),
      ]);

      setBatches(batchData);
      setPredictions(predictionData);

      setBatchId((current) => {
        if (batchData.some((batch) => String(batch.id) === current)) {
          return current;
        }
        return batchData.length ? String(batchData[0].id) : "";
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handlePredict(event) {
    event.preventDefault();
    if (!batchId) return;

    setPredicting(true);
    setError("");
    setResult(null);

    try {
      // Ask the existing backend to predict energy for this batch.
      const data = await apiRequest(
        `/production-batches/${batchId}/predict-energy`,
        { method: "POST" }
      );

      setResult(data);

      // Reload saved prediction history from the database.
      const history = await apiRequest("/energy-predictions");
      setPredictions(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setPredicting(false);
    }
  }

  return (
    <div className="data-page">
      <div className="data-page-heading">
        <div className="data-page-title">
          <div className="data-page-icon prediction-icon">
            <Zap size={23} />
          </div>
          <div>
            <h2>Energy Consumption Prediction</h2>
            <p>
              Estimate electricity requirements for a production batch.
            </p>
          </div>
        </div>

        <button className="secondary-button" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="prediction-layout">
        <section className="data-panel prediction-form-panel">
          <div className="prediction-section-title">
            <Activity size={19} />
            <h3>Select production batch</h3>
          </div>

          <p className="panel-description">
            Choose a saved batch to send its production details to the
            trained regression model.
          </p>

          {loading ? (
            <p className="empty-state">Loading production batches...</p>
          ) : (
            <form onSubmit={handlePredict}>
              <label htmlFor="prediction-batch">Production batch</label>

              <select
                id="prediction-batch"
                value={batchId}
                onChange={(event) => {
                  setBatchId(event.target.value);
                  setResult(null);
                }}
                required
              >
                <option value="">Select a production batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    Batch #{batch.id} · Quantity {batch.quantity} ·{" "}
                    {batch.machine_hours} hours
                  </option>
                ))}
              </select>

              {batchId && (
                <div className="selected-batch-summary">
                  {(() => {
                    const batch = batches.find(
                      (item) => String(item.id) === batchId
                    );

                    if (!batch) return null;

                    return (
                      <>
                        <div>
                          <span>Quantity</span>
                          <strong>{batch.quantity}</strong>
                        </div>
                        <div>
                          <span>Machine hours</span>
                          <strong>{batch.machine_hours}</strong>
                        </div>
                        <div>
                          <span>Production date</span>
                          <strong>{batch.production_date}</strong>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                className="primary-button prediction-submit"
                type="submit"
                disabled={!batchId || predicting || loading}
              >
                <Zap size={17} />
                {predicting ? "Predicting energy..." : "Predict energy"}
              </button>
            </form>
          )}

          {error && (
            <div className="feedback-message feedback-error" role="alert">
              {error}
            </div>
          )}
        </section>

        <section className="data-panel prediction-result-panel">
          <div className="prediction-section-title">
            <Gauge size={19} />
            <h3>Prediction result</h3>
          </div>

          {result ? (
            <>
              <p className="panel-description">
                Prediction completed for batch #{batchId}.
              </p>

              <div className="energy-result">
                <span>Estimated energy consumption</span>
                <strong>
                  {Number(
                    result.estimatedEnergy ?? result.estimated_energy
                  ).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                  <small> kWh</small>
                </strong>
              </div>

              <p className="result-note">
                This estimate is generated by the backend prediction service.
              </p>
            </>
          ) : (
            <div className="prediction-empty">
              <div className="prediction-empty-icon">
                <Zap size={28} />
              </div>
              <h4>Ready to estimate</h4>
              <p>
                Select a production batch and click Predict energy to see
                the model's result here.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="data-panel prediction-history-panel">
        <div className="table-heading">
          <div>
            <h3>Prediction history</h3>
            <p className="panel-description">
              Previously saved energy estimates.
            </p>
          </div>
          <span className="history-count">
            {predictions.length} record(s)
          </span>
        </div>

        {loading ? (
          <p className="empty-state">Loading prediction history...</p>
        ) : predictions.length === 0 ? (
          <p className="empty-state">
            No predictions recorded yet. Predict energy for a batch to
            begin.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prediction ID</th>
                  <th>Production batch</th>
                  <th>Estimated energy</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction.id}>
                    <td>#{prediction.id}</td>
                    <td>
                      #{prediction.production_batch_id}
                    </td>
                    <td className="record-name">
                      {Number(prediction.estimated_energy).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 2 }
                      )}
                    </td>
                    <td>{prediction.unit || "kWh"}</td>
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

export default EnergyPrediction;
