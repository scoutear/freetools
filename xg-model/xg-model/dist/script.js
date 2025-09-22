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

  const handleFieldClick = e => {
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
      underPressure });

    setXg(prob);

    const nuevoEvento = {
      jugador,
      x: coords.x.toFixed(2),
      y: coords.y.toFixed(2),
      parteCuerpo,
      tipoRemate,
      underPressure: underPressure ? "Sí" : "No",
      xg: prob.toFixed(3) };


    setEventos(prev => [...prev, nuevoEvento]);
  };

  const handleDelete = index => {
    setEventos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownload = () => {
    if (eventos.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(eventos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Eventos");
    XLSX.writeFile(workbook, "eventos_xg.xlsx");
  };

  return /*#__PURE__*/(
    React.createElement("div", { style: { display: "flex", flexDirection: "row", padding: 20, fontFamily: "sans-serif", alignItems: "flex-start" } }, /*#__PURE__*/

    React.createElement("div", { style: { flex: 1, display: "flex", justifyContent: "center" } }, /*#__PURE__*/
    React.createElement("svg", {
      viewBox: "0 0 52.5 68",
      width: "520",
      height: "680",
      style: { border: "2px solid green", background: "#77bb77", cursor: "crosshair" },
      onClick: handleFieldClick }, /*#__PURE__*/

    React.createElement("line", { x1: "52.5", y1: "0", x2: "52.5", y2: "68", stroke: "white", strokeWidth: "0.5" }), /*#__PURE__*/
    React.createElement("rect", { x: "0", y: "13.84", width: "16.5", height: "40.32", fill: "none", stroke: "white", strokeWidth: "0.5" }), /*#__PURE__*/
    React.createElement("rect", { x: "0", y: "24.34", width: "5.5", height: "19.32", fill: "none", stroke: "white", strokeWidth: "0.5" }), /*#__PURE__*/
    React.createElement("circle", { cx: "11", cy: "34", r: "0.8", fill: "white" }), /*#__PURE__*/
    React.createElement("rect", { x: "-2.44", y: "30.34", width: "2.44", height: "7.32", fill: "none", stroke: "white", strokeWidth: "0.5" }),

    coords && /*#__PURE__*/
    React.createElement("circle", {
      cx: coords.x,
      cy: coords.y,
      r: "1.2",
      fill: "red",
      stroke: "black" }))), /*#__PURE__*/






    React.createElement("div", { style: { flex: 1, marginLeft: 40 } }, /*#__PURE__*/
    React.createElement("h2", null, "Calculador xG"), /*#__PURE__*/


    React.createElement("div", { style: { marginBottom: 10 } }, /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      placeholder: "Apellido del jugador",
      value: jugador,
      onChange: e => setJugador(e.target.value) })),



    coords && /*#__PURE__*/
    React.createElement("p", null, "Coordenadas: x = ",
    coords.x.toFixed(2), ", y = ", coords.y.toFixed(2)), /*#__PURE__*/




    React.createElement("div", { style: { marginBottom: 10 } }, /*#__PURE__*/
    React.createElement("label", null, "Parte del cuerpo:",
    " ", /*#__PURE__*/
    React.createElement("select", { value: parteCuerpo, onChange: e => setParteCuerpo(e.target.value) }, /*#__PURE__*/
    React.createElement("option", null, "Pie derecho"), /*#__PURE__*/
    React.createElement("option", null, "Pie izquierdo"), /*#__PURE__*/
    React.createElement("option", null, "Cabeza"), /*#__PURE__*/
    React.createElement("option", null, "Otro")))), /*#__PURE__*/





    React.createElement("div", { style: { marginBottom: 10 } }, /*#__PURE__*/
    React.createElement("label", null, "Tipo de remate:",
    " ", /*#__PURE__*/
    React.createElement("select", { value: tipoRemate, onChange: e => setTipoRemate(e.target.value) }, /*#__PURE__*/
    React.createElement("option", null, "Juego abierto"), /*#__PURE__*/
    React.createElement("option", null, "Bal\xF3n parado"), /*#__PURE__*/
    React.createElement("option", null, "Contraataque"), /*#__PURE__*/
    React.createElement("option", null, "Otro")))), /*#__PURE__*/





    React.createElement("div", { style: { marginBottom: 10 } }, /*#__PURE__*/
    React.createElement("label", null, /*#__PURE__*/
    React.createElement("input", {
      type: "checkbox",
      checked: underPressure,
      onChange: e => setUnderPressure(e.target.checked) }),
    " ", "Bajo presi\xF3n")), /*#__PURE__*/




    React.createElement("button", {
      onClick: handleCalculate,
      style: { marginTop: 10, padding: "8px 16px", fontSize: "16px" } }, "Calcular xG"),




    xg !== null && /*#__PURE__*/
    React.createElement("div", { style: { marginTop: 20, fontSize: 20, fontWeight: "bold" } }, "xG estimado: ",
    xg.toFixed(3))), /*#__PURE__*/





    React.createElement("div", { style: { flex: 1, marginLeft: 40 } }, /*#__PURE__*/
    React.createElement("h3", null, "Eventos registrados"), /*#__PURE__*/
    React.createElement("button", { onClick: handleDownload }, "Descargar Excel"), /*#__PURE__*/
    React.createElement("table", { border: "1", cellPadding: "5", style: { marginTop: 10, borderCollapse: "collapse" } }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Jugador"), /*#__PURE__*/
    React.createElement("th", null, "Coord_X"), /*#__PURE__*/
    React.createElement("th", null, "Coord_Y"), /*#__PURE__*/
    React.createElement("th", null, "Parte del cuerpo"), /*#__PURE__*/
    React.createElement("th", null, "Tipo de Remate"), /*#__PURE__*/
    React.createElement("th", null, "U-Pres"), /*#__PURE__*/
    React.createElement("th", null, "xG"), /*#__PURE__*/
    React.createElement("th", null, "Acci\xF3n"))), /*#__PURE__*/


    React.createElement("tbody", null,
    eventos.map((ev, i) => /*#__PURE__*/
    React.createElement("tr", { key: i }, /*#__PURE__*/
    React.createElement("td", null, ev.jugador), /*#__PURE__*/
    React.createElement("td", null, ev.x), /*#__PURE__*/
    React.createElement("td", null, ev.y), /*#__PURE__*/
    React.createElement("td", null, ev.parteCuerpo), /*#__PURE__*/
    React.createElement("td", null, ev.tipoRemate), /*#__PURE__*/
    React.createElement("td", null, ev.underPressure), /*#__PURE__*/
    React.createElement("td", null, ev.xg), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement("button", { onClick: () => handleDelete(i) }, "\u274C")))))))));








}

ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.getElementById("root"));