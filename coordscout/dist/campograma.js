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
    const nueva = { jugador, tipo, minuto: acciones.length + 1 };
    setAcciones([...acciones, nueva]);
  };

  const exportarExcel = () => {
    if (acciones.length === 0) {
      alert("No hay acciones para exportar.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(acciones);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Acciones");
    XLSX.writeFile(workbook, "acciones.xlsx");
  };

  return React.createElement(
    "div",
    { className: "p-4" },

    // título
    React.createElement("h1", { className: "text-2xl font-bold mb-6 text-center" }, "Campograma"),

    // cancha
    React.createElement(
      "div",
      { className: "relative mx-auto mb-6", style: { width: "600px", height: "400px", backgroundColor: "green" } },
      React.createElement("div", { className: "absolute inset-0 border-4 border-white" }),
      React.createElement("div", { className: "absolute top-1/2 left-1/2 w-32 h-32 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" }),

      // jugadores locales
      equipoLocal.map((j, idx) =>
        React.createElement(
          "button",
          {
            key: j.id,
            className: "absolute w-10 h-10 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-blue-600",
            style: { top: `${20 + idx * 60}px`, left: "40px" },
            onClick: () => agregarAccion(j.nombre, "Acción"),
          },
          j.id
        )
      ),

      // jugadores visitantes
      equipoVisitante.map((j, idx) =>
        React.createElement(
          "button",
          {
            key: j.id,
            className: "absolute w-10 h-10 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600",
            style: { top: `${20 + idx * 60}px`, right: "40px" },
            onClick: () => agregarAccion(j.nombre, "Acción"),
          },
          j.id
        )
      )
    ),

    // acciones
    React.createElement(
      "div",
      { className: "mt-6 max-w-xl mx-auto" },
      React.createElement("h2", { className: "text-xl font-semibold mb-2" }, "Acciones"),
      React.createElement(
        "ul",
        { className: "list-disc list-inside bg-white p-4 rounded shadow" },
        acciones.map((a, idx) =>
          React.createElement("li", { key: idx }, `${a.minuto}' ${a.jugador} - ${a.tipo}`)
        )
      ),
      React.createElement(
        "button",
        {
          className: "mt-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded shadow font-semibold",
          onClick: exportarExcel,
        },
        "STATS (Exportar a Excel)"
      )
    )
  );
}

// montar app
ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(Campograma, null)
);
