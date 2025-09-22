// ================================
// Campograma - Scoutear (versión completa)
// ================================
const { useState } = React;

function Campograma() {
  const [acciones, setAcciones] = useState([]);
  const [equipoLocal] = useState([
    { id: 1, nombre: "Jugador 1" },
    { id: 2, nombre: "Jugador 2" },
    { id: 3, nombre: "Jugador 3" },
    { id: 4, nombre: "Jugador 4" },
    { id: 5, nombre: "Jugador 5" },
  ]);
  const [equipoVisitante] = useState([
    { id: 11, nombre: "Jugador 11" },
    { id: 12, nombre: "Jugador 12" },
    { id: 13, nombre: "Jugador 13" },
    { id: 14, nombre: "Jugador 14" },
    { id: 15, nombre: "Jugador 15" },
  ]);

  const agregarAccion = (jugador, tipo) => {
    const nueva = {
      jugador,
      tipo,
      minuto: acciones.length + 1,
    };
    setAcciones([...acciones, nueva]);
  };

  const exportarExcel = () => {
    let csv = "Minuto,Jugador,Acción\n";
    acciones.forEach(a => {
      csv += `${a.minuto},${a.jugador},${a.tipo}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "acciones.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return React.createElement(
    "div",
    { className: "p-4" },

    // título
    React.createElement("h1", { className: "text-2xl font-bold mb-4 text-center" }, "Campograma"),

    // cancha
    React.createElement(
      "div",
      { className: "flex justify-around mb-4" },
      React.createElement(
        "div",
        { className: "w-1/3" },
        React.createElement("h2", { className: "font-semibold mb-2 text-center" }, "Equipo Local"),
        equipoLocal.map(j =>
          React.createElement(
            "button",
            {
              key: j.id,
              className: "block w-full bg-blue-200 hover:bg-blue-300 m-1 p-2 rounded",
              onClick: () => agregarAccion(j.nombre, "Acción"),
            },
            j.nombre
          )
        )
      ),
      React.createElement(
        "div",
        { className: "w-1/3 border-2 border-green-700 bg-green-100 h-64 flex items-center justify-center" },
        "CANCHA"
      ),
      React.createElement(
        "div",
        { className: "w-1/3" },
        React.createElement("h2", { className: "font-semibold mb-2 text-center" }, "Equipo Visitante"),
        equipoVisitante.map(j =>
          React.createElement(
            "button",
            {
              key: j.id,
              className: "block w-full bg-red-200 hover:bg-red-300 m-1 p-2 rounded",
              onClick: () => agregarAccion(j.nombre, "Acción"),
            },
            j.nombre
          )
        )
      )
    ),

    // lista de acciones
    React.createElement(
      "div",
      { className: "mt-4" },
      React.createElement("h2", { className: "font-semibold mb-2" }, "Acciones"),
      React.createElement(
        "ul",
        { className: "list-disc list-inside" },
        acciones.map((a, idx) =>
          React.createElement("li", { key: idx }, `${a.minuto}' ${a.jugador} - ${a.tipo}`)
        )
      )
    ),

    // botones
    React.createElement(
      "div",
      { className: "mt-4 flex space-x-2" },
      React.createElement(
        "button",
        { onClick: exportarExcel, className: "bg-green-500 text-white px-4 py-2 rounded" },
        "Exportar a Excel"
      )
    )
  );
}

// === Montar la app ===
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(React.createElement(Campograma, null));
}
