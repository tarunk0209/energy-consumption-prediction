
import { useCallback, useEffect, useState } from "react";
import { Package, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { apiRequest } from "./api";

function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function resetForm() {
    setName("");
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId !== null) {
        await apiRequest(`/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ name: name.trim() }),
        });
        setMessage("Product updated successfully.");
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify({ name: name.trim() }),
        });
        setMessage("Product created successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(product) {
    setEditingId(product.id);
    setName(product.name);
    setError("");
    setMessage("");
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete product "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`/products/${product.id}`, {
        method: "DELETE",
      });

      setMessage("Product deleted successfully.");
      if (editingId === product.id) resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="data-page">
      <div className="data-page-heading">
        <div className="data-page-title">
          <div className="data-page-icon">
            <Package size={23} />
          </div>
          <div>
            <h2>Product Management</h2>
            <p>Manage the products manufactured at your facility.</p>
          </div>
        </div>

        <button className="secondary-button" onClick={loadProducts}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="data-layout">
        <section className="data-panel form-panel">
          <h3>{editingId !== null ? "Edit product" : "Add product"}</h3>
          <p className="panel-description">
            Enter the product details below.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="product-name">Product name</label>
            <input
              id="product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Metal Part"
              maxLength={100}
              required
            />

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                <Plus size={16} />
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Save changes"
                  : "Create product"}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-button"
                  type="button"
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
          <div className="table-heading">
            <div>
              <h3>Products</h3>
              <p className="panel-description">
                {products.length} record(s) in the database
              </p>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="empty-state">
              No products found. Create your first product.
            </p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td className="record-name">{product.name}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-button"
                            aria-label={`Edit ${product.name}`}
                            title="Edit product"
                            onClick={() => startEditing(product)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="action-button delete-action"
                            aria-label={`Delete ${product.name}`}
                            title="Delete product"
                            onClick={() => deleteProduct(product)}
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

export default Products;
