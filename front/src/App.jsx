import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Predict from "./pages/Predict";
import ReTrain from "./pages/ReTrain";

function Home() {
  return (

    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <img src="/logo.png" alt="Logo" className="mx-auto mb-3" style={{ width: "100px", height: "auto" }} />
      <h1 className="fw-bold">Proyecto analítica de texto - Detección de Noticias</h1>
      <h1 className="mb-4">Grupo 19</h1>
      <div>
        <Link to="/predict" className="btn btn-primary m-2">Ir a predicción de noticias</Link>
        <Link to="/retrain" className="btn btn-secondary m-2">Ir al ReTrain</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/retrain" element={<ReTrain />} />
      </Routes>
    </Router>
  );
}

export default App;
