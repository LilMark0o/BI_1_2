import React, { useState } from "react";

function ReTrain() {
    // Mode: "manual" for textarea, "upload" for file upload
    const [mode, setMode] = useState("manual");

    // For manual JSON input (preload with a sample if needed)
    const [jsonInput, setJsonInput] = useState(``);
    const [fileData, setFileData] = useState(null);

    const [responseData, setResponseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // When file is selected, read its content
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            setFileData(evt.target.result);
        };
        reader.onerror = () => {
            setError("Failed to read file");
        };
        reader.readAsText(file);
    };

    // On form submission, choose data from manual input or file upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponseData(null);

        // Use fileData if in upload mode, otherwise use the manual jsonInput
        const payload = mode === "upload" ? fileData : jsonInput;

        try {
            const response = await fetch("http://0.0.0.0:8000/retrain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setResponseData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to render the metrics in a pretty table
    const renderMetrics = (metrics) => {
        return (
            <div className="mt-4">
                <h3>Resultados metricas reentrenamiento</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th>Precision</th>
                            <th>Recall</th>
                            <th>F1-Score</th>
                            <th>Support</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(metrics).map(([key, value]) => {
                            // If value is an object, render its keys; otherwise, show it as a single value row
                            if (typeof value === "object") {
                                return (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{value.precision?.toFixed(3)}</td>
                                        <td>{value.recall?.toFixed(3)}</td>
                                        <td>{value["f1-score"]?.toFixed(3)}</td>
                                        <td>{value.support}</td>
                                    </tr>
                                );
                            } else {
                                return (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td colSpan="4">{value}</td>
                                    </tr>
                                );
                            }
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container mt-5">
            <div className="text-center">
                <img src="/logo.png" alt="Logo" className="mx-auto mb-3" style={{ width: "100px", height: "auto" }} />
                <h1 className="fw-bold">ReTrain del modelo de analítica de texto - Detección de Noticias</h1> <br />
            </div>

            <strong>Instrucciones reentrenamiento del modelo: </strong>
            <p>
                Usa esta sección para mejorar la precisión del modelo con nuevos datos. Puedes elegir entre:
            </p>
            <ul>
                <li><strong>Entrada manual:</strong>  Ingresa noticias en formato JSON en el cuadro de texto.</li>
                <li><strong>Subida de archivo:</strong> Carga un archivo JSON con múltiples noticias para analizar.</li>
            </ul>
            <p>
                Luego, haz clic en <strong>"Subir noticias y reentrenar"</strong> para actualizar el modelo con la nueva información.
            </p>
            <hr className="my-4" /> 
            <h3>Ingresar noticias para reentrenamiento:</h3>
            <div className="mb-4">
                <label className="me-3">
                    <input
                        type="radio"
                        name="mode"
                        value="manual"
                        checked={mode === "manual"}
                        onChange={() => setMode("manual")}
                    />
                    Entrada manual JSON
                </label>
                <label>
                    <input
                        type="radio"
                        name="mode"
                        value="upload"
                        checked={mode === "upload"}
                        onChange={() => setMode("upload")}
                    />
                    Subir archivo JSON
                </label>
            </div>
            <form onSubmit={handleSubmit}>
                {mode === "manual" ? (
                    <div className="mb-3">
                        <label htmlFor="jsonInput" className="form-label">
                            JSON Input
                        </label>
                        <textarea
                            id="jsonInput"
                            className="form-control"
                            rows="10"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        ></textarea>
                    </div>
                ) : (
                    <div className="mb-3">
                        <label htmlFor="fileUpload" className="form-label">
                            Subir archivo JSON
                        </label>
                        <input
                            id="fileUpload"
                            type="file"
                            accept=".json,application/json"
                            className="form-control"
                            onChange={handleFileChange}
                        />
                        {fileData && (
                            <small className="text-success">File loaded successfully.</small>
                        )}
                    </div>
                )}
                <button type="submit" className="btn btn-primary">
                    Subir noticias y reentrenar
                </button>
            </form>

            {loading && <p className="mt-3">Loading...</p>}
            {error && <p className="mt-3 text-danger">Error: {error}</p>}

            {responseData && (
                <div className="mt-5">  
                    <div className="alert alert-success" role="alert">
                        {responseData.message}
                    </div>
                    {responseData.metrics && renderMetrics(responseData.metrics)}
                </div>
            )}
        </div>
    );
}

export default ReTrain;
