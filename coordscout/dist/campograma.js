
// === Capograma React App ===

const { useState } = React;

function Capograma() {
  const [acciones, setAcciones] = useState([]);
  const [equipoLocal, setEquipoLocal] = useState([
    { id: 1, nombre: "Jugador 1" },
    { id: 2, nombre: "Jugador 2" },
  ]);
  const [equipoVisitante, setEquipoVisitante] = useState([
    { id: 11, nombre: "Jugador 11" },
    { id: 12, nombre: "Jugador 12" },
  ]);

  const agregarAccion = (jugador, tipo) => {
    const nueva = { jugador, tipo, minuto: acciones.length + 1 };
    setAcciones([...acciones, nueva]);
  };

  return React.createElement(
    "div",
    { className: "p-4" },
    React.createElement("h1", { className: "text-xl font-bold mb-4" }, "Campograma"),
    React.createElement(
      "div",
      { className: "flex justify-around mb-4" },
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "font-semibold" }, "Equipo Local"),
        equipoLocal.map((j) =>
          React.createElement(
            "button",
            {
              key: j.id,
              className: "block bg-blue-200 m-1 p-2 rounded",
              onClick: () => agregarAccion(j.nombre, "Acción"),
            },
            j.nombre
          )
        )
      ),
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "font-semibold" }, "Equipo Visitante"),
        equipoVisitante.map((j) =>
          React.createElement(
            "button",
            {
              key: j.id,
              className: "block bg-red-200 m-1 p-2 rounded",
              onClick: () => agregarAccion(j.nombre, "Acción"),
            },
            j.nombre
          )
        )
      )
    ),
    React.createElement(
      "div",
      { className: "mt-4" },
      React.createElement("h2", { className: "font-semibold" }, "Acciones"),
      React.createElement(
        "ul",
        null,
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
  React.createElement(Capograma, null)
);
