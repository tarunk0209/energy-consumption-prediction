
import { useCallback, useEffect, useState } from "react";
import { Layers, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { apiRequest } from "./api";

const emptyForm = {
  product_id: "",
  quantity: "100",
  machine_hours: "8",
  machine_type_id: "",
  shift_id: "",
  production_date: new Date().toISOString().slice(0, 10),
  actual_energy_consumed: "",
};

function ProductionBatches() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [batchData, productData, machineData, shiftData] =
        await Promise.all([
          apiRequest("/production-batches"),
          apiRequest("/products"),
          apiRequest("/machine-types"),
          apiRequest("/shifts"),
        ]);

      setBatches(batchData);
      setProducts(productData);
      setMachineTypes(machineData);
      setShifts(shiftData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !form.product_id ||
      !form.machine_type_id ||
      !form.shift_id
    ) {
      setError("Please select a product, machine type, and shift.");
      return;
    }

    const payload = {
      product_id: Number(form.product_id),
      quantity: Number(form.quantity),
      machine_hours: Number(form.machine_hours),
      machine_type_id: Number(form.machine_type_id),
      shift_id: Number(form.shift_id),
      production_date: form.production_date,
      actual_energy_consumed:
        form.actual_energy_consumed === ""
          ? null
          : Number(form.actual_energy_consumed),
    };

    if (
      !Number.isFinite(payload.quantity) ||
      payload.quantity <= 0 ||
      !Number.isFinite(payload.machine_hours) ||
      payload.machine_hours <= 0 ||
      (payload.actual_energy_consumed !== null &&
        (!Number.isFinite(payload.actual_energy_consumed) ||
          payload.actual_energy_consumed < 0))
    ) {
      setError("Enter valid quantity, machine hours, and actual energy.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      await apiRequest(
        isEditing
          ? `/production-batches/${editingId}`
          : "/production-batches",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      setMessage(
        isEditing
          ? "Production batch updated successfully."
          : "Production batch created successfully."
      );

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(batch) {
    setEditingId(batch.id);
    setForm({
      product_id: String(batch.product_id),
      quantity: String(batch.quantity),
      machine_hours: String(batch.machine_hours),
      machine_type_id: String(batch.machine_type_id),
      shift_id: String(batch.shift_id),
      production_date: batch.production_date,
      actual_energy_consumed:
        batch.actual_energy_consumed ?? "",
    });
    setError("");
    setMessage("");
  }

  async function deleteBatch(batch) {
    if (!window.confirm(`Delete production batch #${batch.id}?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/production-batches/${batch.id}`, {
        method: "DELETE",
      });

      setMessage("Production batch deleted successfully.");
      if (editingId === batch.id) resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function getName(items, id) {
    return items.find((item) => item.id === id)?.name ?? `ID ${id}`;
  }

  return (
    <div className="data-page">
      <div className="data-page-heading">
        <div className="data-page-title">
          <div className="data-page-icon">
            <Layers size={23} />
          </div>
          <div>
            <h2>Production Batch Management</h2>
            <p>Create and maintain production records.</p>
          </div>
        </div>

        <button className="secondary-button" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <section className="data-panel form-panel batch-form-panel">
        <h3>{editingId !== null ? "Edit batch" : "Create production batch"}</h3>
        <p className="panel-description">
          Enter the production details below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="batch-form-grid">
            <div>
              <label htmlFor="batch-product">Product</label>
              <select
                id="batch-product"
                name="product_id"
                value={form.product_id}
                onChange={updateField}
                required
              >
                <option value="">Select product</option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-quantity">Quantity</label>
              <input
                id="batch-quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={updateField}
                required
              />
            </div>

            <div>
              <label htmlFor="batch-hours">Machine hours</label>
              <input
                id="batch-hours"
                name="machine_hours"
                type="number"
                min="0.01"
                step="0.01"
                value={form.machine_hours}
                onChange={updateField}
                required
              />
            </div>

            <div>
              <label htmlFor="batch-machine">Machine type</label>
              <select
                id="batch-machine"
                name="machine_type_id"
                value={form.machine_type_id}
                onChange={updateField}
                required
              >
                <option value="">Select machine type</option>
                {machineTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-shift">Shift</label>
              <select
                id="batch-shift"
                name="shift_id"
                value={form.shift_id}
                onChange={updateField}
                required
              >
                <option value="">Select shift</option>
                {shifts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-date">Production date</label>
              <input
                id="batch-date"
                name="production_date"
                type="date"
                value={form.production_date}
                onChange={updateField}
                required
              />
            </div>

            <div>
              <label htmlFor="batch-energy">
                Actual energy consumed (kWh)
              </label>
              <input
                id="batch-energy"
                name="actual_energy_consumed"
                type="number"
                min="0"
                step="0.01"
                value={form.actual_energy_consumed}
                onChange={updateField}
                placeholder="Leave blank if not measured yet"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving || loading}
            >
              <Plus size={16} />
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Save changes"
                : "Create batch"}
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

      <section className="data-panel table-panel batch-table-panel">
        <h3>Production batches</h3>
        <p className="panel-description">
          {batches.length} record(s) in the database
        </p>

        {loading ? (
          <p className="empty-state">Loading production batches...</p>
        ) : batches.length === 0 ? (
          <p className="empty-state">No production batches found.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Machine hours</th>
                  <th>Machine type</th>
                  <th>Shift</th>
                  <th>Date</th>
                  <th>Actual energy</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id}>
                    <td>#{batch.id}</td>
                    <td>{getName(products, batch.product_id)}</td>
                    <td>{batch.quantity}</td>
                    <td>{batch.machine_hours}</td>
                    <td>{getName(machineTypes, batch.machine_type_id)}</td>
                    <td>{getName(shifts, batch.shift_id)}</td>
                    <td>{batch.production_date}</td>
                    <td>
                      {batch.actual_energy_consumed == null
                        ? "Not recorded"
                        : `${batch.actual_energy_consumed} kWh`}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-button"
                          title="Edit batch"
                          aria-label={`Edit batch ${batch.id}`}
                          onClick={() => startEditing(batch)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="action-button delete-action"
                          title="Delete batch"
                          aria-label={`Delete batch ${batch.id}`}
                          onClick={() => deleteBatch(batch)}
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
  );
}

export default ProductionBatches;
