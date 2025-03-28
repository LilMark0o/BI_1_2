import React, { useState } from "react";

function Predict() {
    // Mode: "json", "form", or "upload"
    const [mode, setMode] = useState("json");

    // Preloaded JSON (shortened for brevity)
    const [jsonInput, setJsonInput] = useState(`[
  {
      "ID": "ID",
      "Titulo": "La mesa del congreso censura un encuentro internacional de parlamentarios prosáhara en el parlamento",
      "Descripcion": "Portavoces de Ciudadanos, PNV, UPN, PSOE, Unidos PP y EQUO denuncian juntos esta censura que consideran injustificable.",
      "Fecha": "30/10/2018"
  },
  {
      "ID": "ID",
      "Titulo": "La brecha digital que dificulta el acceso de ayudas a las personas vulnerables: 'Llega un momento en el que uno se rinde'",
      "Descripcion": "No es la primera vez que los ciudadanos vulnerables se topan con obstáculos a la hora de solicitar ayudas debido al lenguaje burocrático, el obligatoriedad de la Cl@ve Pin o la conexión a internet.",
      "Fecha": "15/03/2023"
  }
]`);

    // Form state: an array of objects, one per item
    const [formData, setFormData] = useState([
        { ID: "", Titulo: "", Descripcion: "", Fecha: "" },
    ]);

    // File upload state
    const [fileData, setFileData] = useState(null);

    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add a new empty form
    const handleAddForm = () => {
        setFormData([...formData, { ID: "", Titulo: "", Descripcion: "", Fecha: "" }]);
    };

    // Handle change in any form field
    const handleFormChange = (index, field, value) => {
        const newData = [...formData];
        newData[index][field] = value;
        setFormData(newData);
    };

    // Handle file input change
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

    // On form submission, prepare the data based on the mode and send it to the endpoint
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let bodyData;
        if (mode === "json") {
            bodyData = jsonInput;
        } else if (mode === "form") {
            // Convert the form data to a JSON string
            bodyData = JSON.stringify(formData);
        } else if (mode === "upload") {
            // Use the fileData if available
            if (!fileData) {
                setError("Please select a file first");
                setLoading(false);
                return;
            }
            bodyData = fileData;
        }

        try {
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: bodyData,
            });
            if (!response.ok) {
                throw new Error("Network response was not ok - Revisa la noticia que estás intentando analizar");
            }
            const data = await response.json();
            setPredictions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }

        if (mode === "form") {
            // Validación: Verificar que todos los campos estén llenos
            const isFormValid = formData.every(item =>
                item.ID.trim() !== "" &&
                item.Titulo.trim() !== "" &&
                item.Descripcion.trim() !== "" &&
                item.Fecha.trim() !== ""
            );
    
            if (!isFormValid) {
                setError("Por favor completa todos los campos antes de enviar.");
                setLoading(false);
                return;
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="text-center">
                <img src="/logo.png" alt="Logo" className="mx-auto mb-3" style={{ width: "100px", height: "auto" }} />
                <h1 className="fw-bold">Predecir detección de noticias falsas o verdaderas</h1> <br />
            </div>
            
            <p className="text-gray-600">
            Esta aplicación utiliza modelos de aprendizaje automático para analizar noticias y determinar si son verdaderas o falsas. 
            Basándose en el contenido del título y la descripción, el sistema calcula una probabilidad que indica la certeza de su predicción. 
            Esto puede ayudar a los usuarios a identificar posibles noticias falsas y tomar decisiones informadas. <br /> <br />

            <strong>Cómo usar la aplicación:</strong> <br />
            <ul>
                <li><b>Opción 1:</b> Ingresa una noticia manualmente escribiendo el título y la descripción en el campo de texto.</li>
                <li><b>Opción 2:</b> Sube un archivo JSON con múltiples noticias para un análisis en lote.</li>
            </ul>

            <strong>Consejos:</strong> <br />
            <ul>
                <li>El modelo evaluará cada noticia y mostrará una predicción con un valor de <b>0 (falsa)</b> o <b>1 (verdadera)</b>, acompañado de un porcentaje de certeza.</li>
                <li>Si tienes dudas sobre cómo estructurar el archivo JSON, puedes utilizar la opción de <b>"JSON Precargado"</b> como referencia.</li>
                <li>Una vez procesadas, las predicciones aparecerán en la parte inferior con un formato claro y resaltado.</li>
            </ul>
            </p>
            <hr className="my-4" /> 

            <h3>Ingresar noticias a analizar:</h3>

            {/* Mode selection */}
            <div className="mb-4">
                <label className="me-3">
                    <input
                        type="radio"
                        name="mode"
                        value="json"
                        checked={mode === "json"}
                        onChange={() => setMode("json")}
                    />
                    JSON Precargado
                </label>
                <label className="me-3">
                    <input
                        type="radio"
                        name="mode"
                        value="form"
                        checked={mode === "form"}
                        onChange={() => setMode("form")}
                    />
                    Escribir manualmente
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
                {mode === "json" && (
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
                )}

                {mode === "form" && (
                    <div>
                        {formData.map((item, index) => (
                            <div key={index} className="mb-4 border p-3 rounded">
                                <h5> Noticia: Item # {index + 1}</h5>
                                <div className="mb-3">
                                    <label className="form-label">ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.ID}
                                        placeholder="Ejemplo: 123"
                                        onChange={(e) => handleFormChange(index, "ID", e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Titulo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.Titulo}
                                        placeholder="Ejemplo: La mesa del congreso censura un encuentro internacional de parlamentarios"
                                        onChange={(e) => handleFormChange(index, "Titulo", e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripcion</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={item.Descripcion}
                                        placeholder="Ejemplo: Portavoces de Ciudadanos y EQUO denuncian juntos esta censura que consideran injustificable."
                                        onChange={(e) =>
                                            handleFormChange(index, "Descripcion", e.target.value)
                                        }
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fecha</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.Fecha}
                                        placeholder="Ejemplo: 30/03/2025"
                                        onChange={(e) => handleFormChange(index, "Fecha", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary mb-3"
                            onClick={handleAddForm}
                        >
                            Añadir otra noticia
                        </button>
                    </div>
                )}

                {mode === "upload" && (
                    <div className="mb-3">
                        <label htmlFor="fileUpload" className="form-label">
                            Upload JSON File
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

                <button type="submit" className="btn btn-primary shadow-sm px-4 py-2">
                    Subir noticia(s)
                </button>
            </form>

            {loading && <p className="mt-3">Loading...</p>}
            {error && <p className="mt-3 text-danger">Error: {error}</p>}

            <hr className="my-4" /> 

            {predictions.length === 0 ? (
                <p className="mt-3 text-gray-500">No hay predicciones aún. Ingresa una noticia para analizar.</p>) : (
                    
                <div className="mt-5">
                    <h3> Resultados predicciones:</h3>
                    <p1> <b>Resultado predicción: </b>1 significa que el modelo considera la noticia como verdadera, mientras que 0 indica que es falsa.</p1> <br />
                    <p1> <b>Probabilidad: </b> La probabilidad indica el grado de certeza del modelo en su predicción. Entre más cercano a 1 hay mayor certeza. </p1> <br />
                    <div className="list-group">
                        {predictions.map((item, index) => (
                            <div key={index} className="list-group-item p-3 mb-3 rounded" style={{ 
                                backgroundColor: item.prediction === 1 ? "#e6ffe6" : "#ffe6e6", 
                                borderLeft: `5px solid ${item.prediction === 1 ? "green" : "red"}` 
                            }}>
                                <p><strong>Index de la noticia: </strong>{index }</p>
                                <p>
                                    <strong>Resultado predicción:</strong> {item.prediction}
                                </p>
                                <p>{item.prediction === 1 ? " ✅ La noticia parece verdadera" : " ❌ La noticia parece falsa"}</p>
                                <p>
                                    <strong>Probabilidad:</strong> {parseFloat(item.probability).toFixed(3)}
                                </p>
                                <div className="progress">
                        <div 
                            className="progress-bar" 
                            role="progressbar"
                            style={{
                                width: `${item.probability * 100}%`,
                                backgroundColor: item.prediction === 1 ? "green" : "red"
                            }}
                        >
                            {`${(item.probability * 100).toFixed(1)}%`}
                        </div>
                    </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Predict;
