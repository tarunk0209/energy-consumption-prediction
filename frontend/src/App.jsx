
import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Products from "./Products";
import MasterData from "./MasterData";
import ProductionBatches from "./ProductionBatches";
import EnergyPrediction from "./EnergyPrediction";
import PredictionHistory from "./PredictionHistory";

import {
  Factory,
  LayoutDashboard,
  Package,
  Cpu,
  Clock3,
  Layers,
  Zap,
  History,
  Menu,
  Activity,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import "./App.css";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Products", icon: Package },
  { label: "Machine Types", icon: Cpu },
  { label: "Shifts", icon: Clock3 },
  { label: "Production Batches", icon: Layers },
  { label: "Energy Prediction", icon: Zap },
  { label: "Prediction History", icon: History },
];

const descriptions = [
  "Manage manufacturing products.",
  "Maintain machine type records.",
  "Configure production shifts.",
  "Create and manage production batches.",
  "Estimate energy using the trained ML model.",
  "Review previously saved predictions.",
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/products")
      .then((data) => {
        setProducts(data);
        setApiError("");
      })
      .catch((error) => setApiError(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${sidebarOpen ? "" : "sidebar-hidden"}`}
      >
        <div className="brand">
          <div className="brand-icon">
            <Factory size={24} />
          </div>
          <div>
            <h2>Energy Consumption</h2>
            <p>MANUFACTURING INTELLIGENCE</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <div>
            <strong>System status</strong>
            <p>Local environment</p>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="icon-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>

          <div className="user-profile">
            <div className="avatar">ECPS</div>
            <div>
              <strong>Energy Operations</strong>
              <p>Administrator</p>
            </div>
          </div>
        </header>

        <section className="page-content">
          {/* Common heading */}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                MANUFACTURING ANALYTICS
              </div>
              <h1>{activePage}</h1>
              <p>
                Monitor production activity and estimate energy
                consumption.
              </p>
            </div>

            <div className="live-status">
              <span className="status-dot" />
              Development environment
            </div>
          </div>

          {/* Overview dashboard: only visible on Overview */}
          {activePage === "Overview" && (
            <>
              <div className="connection-card">
                <div className="connection-icon">
                  {loading ? (
                    <LoaderCircle
                      size={22}
                      className="spin-icon"
                    />
                  ) : apiError ? (
                    <AlertCircle size={22} />
                  ) : (
                    <CheckCircle size={22} />
                  )}
                </div>

                <div className="connection-details">
                  <h3>Backend Connection</h3>

                  {loading ? (
                    <p>Loading products from the database...</p>
                  ) : apiError ? (
                    <p
                      className="connection-error"
                      role="alert"
                    >
                      Backend error: {apiError}
                    </p>
                  ) : (
                    <>
                      <p>
                        Successfully connected to the FastAPI backend.
                      </p>
                      <strong>
                        Products retrieved: {products.length}
                      </strong>
                    </>
                  )}
                </div>

                <span
                  className={`connection-badge ${
                    loading
                      ? "badge-loading"
                      : apiError
                      ? "badge-error"
                      : "badge-success"
                  }`}
                >
                  {loading
                    ? "Connecting"
                    : apiError
                    ? "Offline"
                    : "Connected"}
                </span>
              </div>

              <div className="welcome-banner">
                <div className="banner-copy">
                  <div className="banner-label">
                    <Activity size={15} />
                    ENERGY INTELLIGENCE
                  </div>

                  <h2>Make every production batch count.</h2>

                  <p>
                    Manage production records and predict electricity
                    requirements using your trained regression model.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      setActivePage("Energy Prediction")
                    }
                  >
                    <Zap size={17} />
                    Predict energy
                  </button>
                </div>

                <div className="banner-illustration">
                  <div className="energy-orbit orbit-one" />
                  <div className="energy-orbit orbit-two" />

                  <div className="energy-core">
                    <Factory size={48} />
                  </div>

                  <Zap
                    className="floating-zap"
                    size={30}
                  />
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Workspace modules</h2>
                  <p>
                    Access the features required for energy prediction.
                  </p>
                </div>
              </div>

              <div className="module-grid">
                {navigation.slice(1).map(
                  ({ label, icon: Icon }, index) => (
                    <button
                      type="button"
                      key={label}
                      className="module-card"
                      onClick={() => setActivePage(label)}
                    >
                      <div
                        className={`module-icon module-color-${index}`}
                      >
                        <Icon size={23} />
                      </div>

                      <h3>{label}</h3>
                      <p>{descriptions[index]}</p>

                      <span className="module-link">
                        Open module →
                      </span>
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {/* Each module appears only on its own page */}
          {activePage === "Products" && <Products />}

          {activePage === "Machine Types" && (
            <MasterData type="machines" />
          )}

          {activePage === "Shifts" && (
            <MasterData type="shifts" />
          )}

          {activePage === "Production Batches" && (
            <ProductionBatches />
          )}

          {activePage === "Energy Prediction" && (
            <EnergyPrediction />
          )}

          {activePage === "Prediction History" && (
            <PredictionHistory />
          )}

          <footer className="page-footer">
            Energy Consumption Prediction System
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
