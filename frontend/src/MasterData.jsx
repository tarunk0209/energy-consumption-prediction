
import { useCallback, useEffect, useState } from "react";
import { Cpu, Clock3, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { apiRequest } from "./api";

function MasterData({ type }) {
  const config = {
    machines: {
      title: "Machine Types",
      singular: "Machine Type",
      endpoint: "/machine-types",
      Icon: Cpu,
    },
    shifts: {
      title: "Shifts",
      singular: "Shift",
      endpoint: "/shifts",
      Icon: Clock3,
    },
  }[type];

  const [records, setRecords] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setRecords(await apiRequest(config.endpoint));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function resetForm() {
    setName("");
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const isEditing = editingId !== null;
      await apiRequest(
        isEditing
          ? `${config.endpoint}/${editingId}`
          : config.endpoint,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({ name: name.trim() }),
        }
      );

      setMessage(
        `${config.singular} ${isEditing ? "updated" : "created"} successfully.`
      );
      resetForm();
      await loadRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record) {
    if (!window.confirm(`Delete "${record.name}"?`)) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`${config.endpoint}/${record.id}`, {
        method: "DELETE",
      });

      setMessage(`${config.singular} deleted successfully.`);
      if (editingId === record.id) resetForm();
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  const { Icon } = config;

  return (
    <div className="data-page">
      <div className="data-page-heading">
        <div className="data-page-title">
          <div className="data-page-icon">
            <Icon size={23} />
          </div>
          <div>
            <h2>{config.title} Management</h2>
            <p>Create and maintain {config.title.toLowerCase()} records.</p>
          </div>
        </div>
        <button className="secondary-button" onClick={loadRecords}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="data-layout">
        <section className="data-panel form-panel">
          <h3>
            {editingId !== null ? "Edit" : "Add"} {config.singular}
          </h3>
          <p className="panel-description">
            Enter the {config.singular.toLowerCase()} name.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor={`${type}-name`}>Name</label>
            <input
              id={`${type}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`e.g. ${type === "machines" ? "CNC" : "Morning"}`}
              maxLength={100}
              required
            />
            <div className="form-actions">
              <button className="primary-button" disabled={saving}>
                <Plus size={16} />
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Save changes"
                  : `Create ${config.singular.toLowerCase()}`}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="feedback-message feedback-error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="feedback-message feedback-success" role="status">
              {message}
            </div>
          )}
        </section>

        <section className="data-panel table-panel">
          <h3>{config.title}</h3>
          <p className="panel-description">
            {records.length} record(s) in the database
          </p>

          {loading ? (
            <p className="empty-state">Loading records...</p>
          ) : records.length === 0 ? (
            <p className="empty-state">No records found. Create one to begin.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>#{record.id}</td>
                      <td className="record-name">{record.name}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-button"
                            title="Edit"
                            aria-label={`Edit ${record.name}`}
                            onClick={() => {
                              setEditingId(record.id);
                              setName(record.name);
                              setError("");
                              setMessage("");
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="action-button delete-action"
                            title="Delete"
                            aria-label={`Delete ${record.name}`}
                            onClick={() => deleteRecord(record)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MasterData;
