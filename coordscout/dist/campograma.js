const { useEffect, useRef, useState } = React;

function Campograma() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <h1 className="text-2xl font-bold text-green-800">
        ✅ Campograma cargado correctamente
      </h1>
    </div>
  );
}

function App() {
  return React.createElement(
    "div",
    { className: "min-h-screen flex flex-col" },
    React.createElement(
      "div",
      { className: "p-2 bg-gray-200 shadow" },
      React.createElement(
        "button",
        {
          onClick: () => (window.location.href = "index.html"),
          className: "bg-gray-700 text-white px-4 py-2 rounded",
        },
        "INICIO"
      )
    ),
    React.createElement("div", { className: "flex-1" }, React.createElement(Campograma, null))
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(App, null)
);
