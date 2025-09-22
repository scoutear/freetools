// === Campograma React App ===

const { useState } = React;

function Campograma() {
  const [acciones, setAcciones] = useState([]);
  const [equipoLocal, setEquipoLocal] = useState([
    { id: 1, nombre: "Jugador 1" },
    { id: 2, nombre: "Jugador 2" },
    { id: 3, nombre: "Jugador 3" },
    { id: 4, nombre: "Jugador 4" },
    { id: 5, nombre: "Jugador 5" },
  ]);
  const [equipoVisitante, setEquipoVisitante] = useState([
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

  return React.createElement(
    "div",
    { className: "p-4 text-center" },

    // título
    React.createElement("h1", { className: "text-2xl font-bold mb-6" }, "Campograma"),

    // equipos
    React.createElement(
      "div",
      { className: "flex justify-around mb-6" },

      // equipo local
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "font-semibold text-blue-600 mb-2" }, "Equipo Local"),
        equipoLocal.map((j) =>
          React.createElement(
            "button",
            {
              key: j.id,
              className: "block w-40 bg-blue-200 hover:bg-blue-300 m-1 p-2 rounded shadow",
              onClick: () => agregarAccion(j.nombre, "Acción"),
            },
            j.nombre
          )
        )
      ),

      // equipo visitante
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "font-semibold text-red-600 mb-2" }, "Equipo Visitante"),
        equipoVisitante.map((j) =>
          React.createElement(
            "button",
            {
              key: j.id,
              className: "block w-40 bg-red-200 hover:bg-red-300 m-1 p-2 rounded shadow",
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
      { className: "mt-6 text-left max-w-md mx-auto" },
      React.createElement("h2", { className: "font-semibold mb-2" }, "Acciones"),
      React.createElement(
        "ul",
        { className: "list-disc list-inside bg-white p-3 rounded shadow" },
        acciones.map((a, idx) =>
          React.createElement(
            "li",
            { key: idx },
            a.minuto + "' " + a.jugador + " - " + a.tipo
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
