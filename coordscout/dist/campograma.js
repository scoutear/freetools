// === Campograma React App ===
const { useState } = React;

function Campograma() {
  const [acciones, setAcciones] = useState([]);
  const [equipoLocal] = useState([
    { id: 1, nombre: "Jugador 1" },
    { id: 2, nombre: "Jugador 2" },
  ]);
  const [equipoVisitante] = useState([
    { id: 11, nombre: "Jugador 11" },
    { id: 12, nombre: "Jugador 12" },
  ]);

  const agregarAccion = (jugador, tipo) => {
    const nueva = { jugador, tipo, minuto: acciones.length + 1 };
    setAcciones([...acciones, nueva]);
  };

  return React.createElement(
    "div",
    { className: "p-6 space-y-6" },

    // Título
    React.createElement("h1", { className: "text-2xl font-bold text-center" }, "Campograma"),

    // Layout principal
    React.createElement(
      "div",
      { className: "grid grid-cols-3 gap-4 items-start" },

      // Equipo Local
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "font-semibold mb-2 text-blue-700" }, "Equipo Local"),
        equipoLocal.map((j) =>
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

      // Cancha
      React.createElement(
        "div",
        { className: "bg-green-500 aspect-[2/3] mx-auto rounded relative" },
        React.createElement("div", {
          className: "absolute inset-0 border-4 border-white",
        }),
        React.createElement("div", {
          className: "absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2",
        })
      ),

      // Equipo Visitante
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "font-semibold mb-2 text-red-700" }, "Equipo Visitante"),
        equipoVisitante.map((j) =>
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

    // Acciones registradas
    React.createElement(
      "div",
      { className: "mt-6" },
      React.createElement("h2", { className: "font-semibold text-lg mb-2" }, "Acciones"),
      React.createElement(
        "ul",
        { className: "list-disc pl-6" },
        acciones.map((a, idx) =>
          React.createElement(
            "li",
            { key: idx },
            `${a.minuto}' ${a.jugador} - ${a.tipo}`
          )
        )
      )
    )
  );
}

// === Montar la app ===
ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(Campograma, null)
);

// === Montar la app ===
ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(Capograma, null)
);
