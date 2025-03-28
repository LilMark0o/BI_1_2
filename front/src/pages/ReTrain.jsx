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
            const response = await fetch("http://localhost:8000/retrain", {
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

    const interpretarAccuracy = (accuracy) => {
        if (accuracy > 0.90) {
            return "Excelente precisión global: el modelo clasifica correctamente la mayoría de las noticias.";
        } else if (accuracy > 0.80) {
            return "Buena precisión: aunque el modelo es confiable, algunos errores pueden ocurrir.";
        } else if (accuracy > 0.70) {
            return "Precisión aceptable: el modelo podría necesitar mejoras en algunas clasificaciones.";
        } else {
            return "Precisión baja: considera revisar los datos de entrenamiento o ajustar el modelo.";
        }
    };

    const interpretarResultados = (value) => {
        if (!value) return "No hay resultados disponibles.";
    
        const precision = value.precision || 0;
        const recall = value.recall || 0;
        const f1Score = value["f1-score"] || 0;
    
        let interpretacion = "";
    
        //  Precisión
        if (precision > 0.90) {
            interpretacion += " Alta precisión: el modelo evita falsos positivos en su mayoría.\n";
        } else if (precision > 0.80) {
            interpretacion += " Buena precisión: el modelo tiene algunos falsos positivos, pero sigue siendo confiable.\n";
        } else {
            interpretacion += " Precisión moderada: el modelo podría clasificar erróneamente algunas noticias como falsas o verdaderas. \n";
        }
    
        //  Recall
        if (recall > 0.90) {
            interpretacion += " Alto recall: el modelo detecta la mayoría de las noticias relevantes.\n ";
        } else if (recall > 0.80) {
            interpretacion += " Buen recall: el modelo captura la mayoría de los casos, aunque algunos pueden escaparse.\n ";
        } else {
            interpretacion += " Recall bajo: puede estar dejando pasar noticias que deberían haber sido detectadas. \n";
        }
    
        //  F1-Score
        if (f1Score > 0.90) {
            interpretacion += " Excelente balance entre precisión y recall. \n";
        } else if (f1Score > 0.80) {
            interpretacion += " Buen balance entre precisión y recall.\n ";
        } else {
            interpretacion += " Balance moderado: revisar el modelo para mejorar precisión y recall.\n ";
        }
    
        return interpretacion;
    };
    
    // Function to render the metrics in a pretty table
    const renderMetrics = (metrics) => {
        return (
            <div className="mt-4">
                <h3>Resultados métricas reentrenamiento</h3>
                
                <strong>Descripción de las métricas:</strong> <br />
                <ul>
                    <li><b>Precisión (Precision):</b> Indica qué porcentaje de las noticias clasificadas como verdaderas realmente lo son. Un valor alto significa que hay pocos falsos positivos.</li>
                    <li><b>Recall:</b> Mide cuántas noticias verdaderas fueron correctamente identificadas por el modelo. Un valor alto indica que el modelo detecta la mayoría de las noticias verdaderas.</li>
                    <li><b>F1-Score:</b> Es un equilibrio entre precisión y recall. Un F1-Score alto significa que el modelo es consistente en ambas métricas.</li>
                    <li><b>Accuracy:</b> Representa el porcentaje total de clasificaciones correctas sobre todas las noticias analizadas.</li>
                    <li><b>Macro Avg:</b> Promedio de precisión, recall y F1-score entre todas las clases, sin considerar el tamaño de cada clase.</li>
                    <li><b>Weighted Avg:</b> Similar a macro avg, pero ponderando cada métrica según el número de ejemplos en cada clase.</li>
                </ul>

                <strong>Interpretación:</strong> <br />
                <ul>
                    <li>Valores altos en precisión y recall indican que el modelo es confiable en sus predicciones.</li>
                    <li>Si el recall es alto pero la precisión es baja, significa que el modelo identifica muchas noticias verdaderas pero también genera falsos positivos.</li>
                    <li>El F1-Score es útil cuando hay un desbalance entre clases (por ejemplo, si hay más noticias falsas que verdaderas).</li>
                </ul>
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
                        {Object.entries(metrics).filter(([key]) => !["accuracy"].includes(key)).map(([key, value]) => {
                            // If value is an object, render its keys; otherwise, show it as a single value row
                            if (typeof value === "object") {
                                return (
                                    <React.Fragment key={key}>
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{value.precision?.toFixed(3)}</td>
                                        <td>{value.recall?.toFixed(3)}</td>
                                        <td>{value["f1-score"]?.toFixed(3)}</td>
                                        <td>{value.support}</td>
                                    </tr>

                                    <tr>
                                    <td colSpan="5" className="text-muted">
                                        <small>{interpretarResultados(value)}</small>
                                    </td>
                                    </tr>
                                     </React.Fragment>
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

                {/* Bloque de Accuracy - Se muestra solo una vez */}
                {metrics.accuracy && (
                    <div className="mt-4">
                    <h5>Accuracy del modelo</h5>
                    <div className="progress">
                        <div 
                            className="progress-bar" 
                            role="progressbar"
                            style={{
                                width: `${metrics.accuracy * 100}%`,
                                backgroundColor: metrics.accuracy >= 0.8 ? "green" : "red"
                            }}
                        >
                            {`${(metrics.accuracy * 100).toFixed(1)}%`}
                        </div>
                    </div>

                    {/* <ProgressBar now={metrics.accuracy * 100} label={`${(metrics.accuracy * 100).toFixed(2)}%`} /> */}
                    <p className="mt-2">
                        <strong>Análisis:</strong> {interpretarAccuracy(metrics.accuracy)}
                    </p>
                    </div>
                )}
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
