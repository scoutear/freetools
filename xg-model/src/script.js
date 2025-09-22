const { useState } = React;

function calcularXG({ x, y, parteCuerpo, underPressure }) {
  const goalX = 0;
  const goalY = 34;

  const dist = Math.sqrt((x - goalX) ** 2 + (y - goalY) ** 2);

  const leftPostY = 34 - 7.32 / 2;
  const rightPostY = 34 + 7.32 / 2;

  const v1 = [goalX - x, leftPostY - y];
  const v2 = [goalX - x, rightPostY - y];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const norm = Math.sqrt(v1[0] ** 2 + v1[1] ** 2) * Math.sqrt(v2[0] ** 2 + v2[1] ** 2);
  const angle = Math.acos(Math.min(Math.max(dot / norm, -1), 1));

  const b0 = 0.1540;
  const bDist = -0.1413;
  const bAngle = 0.9882;
  const bHead = -1.1576;
  const bPressure = -0.6528;

  const isHead = parteCuerpo === "Cabeza" ? 1 : 0;

  const linear =
    b0 +
    bDist * dist +
    bAngle * angle +
    bHead * isHead +
    bPressure * (underPressure ? 1 : 0);

  const prob = 1 / (1 + Math.exp(-linear));
  return prob;
}

function App() {
  const [coords, setCoords] = useState(null);
  const [underPressure, setUnderPressure] = useState(false);
  const [xg, setXg] = useState(null);
  const [parteCuerpo, setParteCuerpo] = useState("Pie derecho");
  const [tipoRemate, setTipoRemate] = useState("Juego abierto");
  const [jugador, setJugador] = useState("");
  const [eventos, setEventos] = useState([]);

  const handleFieldClick = (e) => {
    const svg = e.target.closest("svg");
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());

    const x = cursor.x;
    const y = cursor.y;

    if (x >= 0 && x <= 52.5 && y >= 0 && y <= 68) {
      setCoords({ x, y });
    }
  };

  const handleCalculate = () => {
    if (!coords) return;
    const prob = calcularXG({
      ...coords,
      parteCuerpo,
      underPressure,
    });
    setXg(prob);

    const nuevoEvento = {
      jugador,
      x: coords.x.toFixed(2),
      y: coords.y.toFixed(2),
      parteCuerpo,
      tipoRemate,
      underPressure: underPressure ? "Sí" : "No",
      xg: prob.toFixed(3),
    };

    setEventos((prev) => [...prev, nuevoEvento]);
  };

  const handleDelete = (index) => {
    setEventos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownload = () => {
    if (eventos.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(eventos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Eventos");
    XLSX.writeFile(workbook, "eventos_xg.xlsx");
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", padding: 20, fontFamily: "sans-serif", alignItems: "flex-start" }}>
      {/* Cancha */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <svg
          viewBox="0 0 52.5 68"
          width="520"
          height="680"
          style={{ border: "2px solid green", background: "#77bb77", cursor: "crosshair" }}
          onClick={handleFieldClick}
        >
          <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" strokeWidth="0.5"/>
          <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="white" strokeWidth="0.5"/>
          <rect x="0" y="24.34" width="5.5" height="19.32" fill="none" stroke="white" strokeWidth="0.5"/>
          <circle cx="11" cy="34" r="0.8" fill="white"/>
          <rect x="-2.44" y="30.34" width="2.44" height="7.32" fill="none" stroke="white" strokeWidth="0.5"/>

          {coords && (
            <circle
              cx={coords.x}
              cy={coords.y}
              r="1.2"
              fill="red"
              stroke="black"
            />
          )}
        </svg>
      </div>

      {/* Controles */}
      <div style={{ flex: 1, marginLeft: 40 }}>
        <h2>Calculador xG</h2>

        {/* Input jugador */}
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Apellido del jugador"
            value={jugador}
            onChange={(e) => setJugador(e.target.value)}
          />
        </div>

        {coords && (
          <p>
            Coordenadas: x = {coords.x.toFixed(2)}, y = {coords.y.toFixed(2)}
          </p>
        )}

        {/* Parte del cuerpo */}
        <div style={{ marginBottom: 10 }}>
          <label>
            Parte del cuerpo:{" "}
            <select value={parteCuerpo} onChange={(e) => setParteCuerpo(e.target.value)}>
              <option>Pie derecho</option>
              <option>Pie izquierdo</option>
              <option>Cabeza</option>
              <option>Otro</option>
            </select>
          </label>
        </div>

        {/* Tipo de remate */}
        <div style={{ marginBottom: 10 }}>
          <label>
            Tipo de remate:{" "}
            <select value={tipoRemate} onChange={(e) => setTipoRemate(e.target.value)}>
              <option>Juego abierto</option>
              <option>Balón parado</option>
              <option>Contraataque</option>
              <option>Otro</option>
            </select>
          </label>
        </div>

        {/* Checkbox presión */}
        <div style={{ marginBottom: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={underPressure}
              onChange={(e) => setUnderPressure(e.target.checked)}
            />{" "}
            Bajo presión
          </label>
        </div>

        <button
          onClick={handleCalculate}
          style={{ marginTop: 10, padding: "8px 16px", fontSize: "16px" }}
        >
          Calcular xG
        </button>

        {xg !== null && (
          <div style={{ marginTop: 20, fontSize: 20, fontWeight: "bold" }}>
            xG estimado: {xg.toFixed(3)}
          </div>
        )}
      </div>

      {/* Tabla eventos */}
      <div style={{ flex: 1, marginLeft: 40 }}>
        <h3>Eventos registrados</h3>
        <button onClick={handleDownload}>Descargar Excel</button>
        <table border="1" cellPadding="5" style={{ marginTop: 10, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Coord_X</th>
              <th>Coord_Y</th>
              <th>Parte del cuerpo</th>
              <th>Tipo de Remate</th>
              <th>U-Pres</th>
              <th>xG</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((ev, i) => (
              <tr key={i}>
                <td>{ev.jugador}</td>
                <td>{ev.x}</td>
                <td>{ev.y}</td>
                <td>{ev.parteCuerpo}</td>
                <td>{ev.tipoRemate}</td>
                <td>{ev.underPressure}</td>
                <td>{ev.xg}</td>
                <td>
                  <button onClick={() => handleDelete(i)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
