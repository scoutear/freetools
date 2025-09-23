/* Compilado de tu CodePen (JS plano, sin JSX).
   Pega todo esto en script.js (usa React + ReactDOM UMD en el HTML). */

const { useEffect, useRef, useState } = React;
const STORAGE_KEY = "capograma_events_v_arrow_v1";

function Capograma() {
  const pitchRef = useRef(null);

  // estados principales (mantenemos la estructura que venías usando)
  const [events, setEvents] = useState([]);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(null); // "L0", "V0"
  const [selectedActionIdx, setSelectedActionIdx] = useState(null);
  const [playersLocal, setPlayersLocal] = useState(Array(11).fill(""));
  const [playersVisit, setPlayersVisit] = useState(Array(11).fill(""));
  const [actions, setActions] = useState(Array(15).fill(""));
  const [teamLocal, setTeamLocal] = useState("Equipo Local");
  const [teamVisit, setTeamVisit] = useState("Equipo Visitante");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  // último evento dibujado en cancha (puede ser punto o flecha)
  const [lastEvent, setLastEvent] = useState(null);

  // NUEVOS: hover y selección en tabla
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // estados para arrastrar (dibujar flecha)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null); // { nx, ny }
  const [dragEnd, setDragEnd] = useState(null); // preview end coords

  // carga inicial desde localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setEvents(parsed || []);
        // opcional: poner lastEvent como el último del array si existe
        if (parsed && parsed.length) {
          setLastEvent(parsed[parsed.length - 1]);
        }
      } catch {}
    }
  }, []);

  // persistir
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  // convierte evento pointer / mouse a coords relativas 0..100
  function getRelativeCoords(evt) {
    const el = pitchRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const nx = +(100 * (x / rect.width)).toFixed(2); // 0..100 izq->der
    const ny = +(100 * (1 - y / rect.height)).toFixed(2); // 0..100 abajo->arriba
    return { nx, ny };
  }

  // Helper: crea evento de punto (sin final) — mantiene propiedades anteriores
  function createPointEvent(coords) {
    const isLocal = selectedPlayerIdx && selectedPlayerIdx.startsWith("L");
    const idx = selectedPlayerIdx ? parseInt(selectedPlayerIdx.slice(1), 10) : null;
    const player = selectedPlayerIdx
      ? (selectedPlayerIdx.startsWith("L") ? playersLocal[idx] : playersVisit[idx])
      : "";
    const team = selectedPlayerIdx ? (selectedPlayerIdx.startsWith("L") ? teamLocal : teamVisit) : "";

    const ev = {
      id: Date.now(),
      equipo: team,
      player,
      action: actions[selectedActionIdx],
      // tradicional: nx, ny para compatibilidad
      nx: coords.nx,
      ny: coords.ny,
      // x1/y1 -> inicio (si se quiere homogeneizar); x2/y2 vacíos
      x1: coords.nx,
      y1: coords.ny,
      x2: "",
      y2: "",
      minutos: minutes || "",
      segundos: seconds || "",
      created_at: new Date().toISOString(),
    };
    setEvents((s) => {
      const next = [...s, ev];
      return next;
    });
    setLastEvent(ev);
    setSelectedEventId(ev.id); // marca seleccionado cuando lo creás
  }

  // Helper: crea evento flecha (inicio y fin)
  function createArrowEvent(start, end) {
    const isLocal = selectedPlayerIdx && selectedPlayerIdx.startsWith("L");
    const idx = selectedPlayerIdx ? parseInt(selectedPlayerIdx.slice(1), 10) : null;
    const player = selectedPlayerIdx
      ? (selectedPlayerIdx.startsWith("L") ? playersLocal[idx] : playersVisit[idx])
      : "";
    const team = selectedPlayerIdx ? (selectedPlayerIdx.startsWith("L") ? teamLocal : teamVisit) : "";

    const ev = {
      id: Date.now(),
      equipo: team,
      player,
      action: actions[selectedActionIdx],
      // guardamos ambas parejas
      x1: start.nx,
      y1: start.ny,
      x2: end.nx,
      y2: end.ny,
      // para compatibilidad, ponemos nx/ny como x1/y1
      nx: start.nx,
      ny: start.ny,
      minutos: minutes || "",
      segundos: seconds || "",
      created_at: new Date().toISOString(),
    };
    setEvents((s) => {
      const next = [...s, ev];
      return next;
    });
    setLastEvent(ev);
    setSelectedEventId(ev.id); // marca seleccionado cuando lo creás
  }

  // BORRAR evento
  function deleteEvent(id) {
    setEvents((s) => s.filter((ev) => ev.id !== id));
    if (selectedEventId === id) setSelectedEventId(null);
    if (hoveredEventId === id) setHoveredEventId(null);
    if (lastEvent && lastEvent.id === id) setLastEvent(null);
  }

  // CSV descarga (incluye x1,y1,x2,y2)
  function downloadCSV() {
    if (!events.length) return;
    const header = ["Equipo", "Jugador", "Accion", "X1", "Y1", "X2", "Y2", "Minuto", "Segundo", "Fecha"];
    const rows = events.map((ev) => [
      ev.equipo || "",
      ev.player || "",
      ev.action || "",
      ev.x1 ?? ev.nx ?? "",
      ev.y1 ?? ev.ny ?? "",
      ev.x2 ?? "",
      ev.y2 ?? "",
      ev.minutos ?? ev.minutes ?? "",
      ev.segundos ?? ev.seconds ?? "",
      ev.created_at ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eventos_capograma.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // STATS (igual que antes)
  function downloadStats() {
    if (!events.length) return;

    const stats = {};
    events.forEach((ev) => {
      const team = ev.equipo || "";
      if (!stats[team]) stats[team] = {};
      if (!stats[team][ev.player]) stats[team][ev.player] = {};
      const act = ev.action || "";
      stats[team][ev.player][act] = (stats[team][ev.player][act] || 0) + 1;
    });

    const rows = [];
    if (teamLocal && stats[teamLocal]) {
      Object.entries(stats[teamLocal]).forEach(([player, actionsObj]) => {
        const row = { Equipo: teamLocal, Jugador: player };
        Object.entries(actionsObj).forEach(([accion, cantidad]) => {
          row[accion] = cantidad;
        });
        rows.push(row);
      });
    }
    if (teamVisit && stats[teamVisit]) {
      Object.entries(stats[teamVisit]).forEach(([player, actionsObj]) => {
        const row = { Equipo: teamVisit, Jugador: player };
        Object.entries(actionsObj).forEach(([accion, cantidad]) => {
          row[accion] = cantidad;
        });
        rows.push(row);
      });
    }
    // otros equipos
    Object.keys(stats).forEach((team) => {
      if (team === teamLocal || team === teamVisit) return;
      Object.entries(stats[team]).forEach(([player, actionsObj]) => {
        const row = { Equipo: team, Jugador: player };
        Object.entries(actionsObj).forEach(([accion, cantidad]) => {
          row[accion] = cantidad;
        });
        rows.push(row);
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Stats");
    XLSX.writeFile(wb, "stats_capograma.xlsx");
  }

  // ----- Handlers para pointer (arrastrar) -----
  function handlePointerDown(e) {
    // solo permitimos si hay jugador y accion seleccionados
    if (selectedPlayerIdx === null || selectedActionIdx === null) {
      // mantener comportamiento previo: exigir selección
      alert("Seleccioná jugador y acción antes de marcar");
      return;
    }
    const coords = getRelativeCoords(e);
    if (!coords) return;

    // Iniciar drag (preview)
    setIsDragging(true);
    setDragStart(coords);
    setDragEnd(coords);
    // capturar puntero para garantizar recibir move/up
    try {
      e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
    } catch (err) {}
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    const coords = getRelativeCoords(e);
    if (!coords) return;
    setDragEnd(coords);
  }

  function handlePointerUp(e) {
    if (!isDragging) {
      // si no estaba arrastrando, anterior comportamiento de click simple
      return;
    }
    const coords = getRelativeCoords(e);
    const endCoords = coords || dragEnd;
    // liberamos captura
    try {
      e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}

    // si no hubo movimiento significativo -> tratamos como punto
    const dx = Math.abs((dragStart?.nx ?? 0) - (endCoords?.nx ?? 0));
    const dy = Math.abs((dragStart?.ny ?? 0) - (endCoords?.ny ?? 0));
    const dist = Math.sqrt(dx * dx + dy * dy);

    // umbral en unidades normalizadas (ej 0.8 = bastante movimiento)
    const THRESH = 0.8;

    if (dist <= THRESH) {
      // evento punto
      createPointEvent(dragStart);
    } else {
      // evento flecha
      createArrowEvent(dragStart, endCoords);
    }

    // resetear preview
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }

  // ----- Render -----
  // Calcula última entidad a dibujar en cancha (último evento o preview)
  const preview = isDragging && dragStart && dragEnd
    ? { x1: dragStart.nx, y1: dragStart.ny, x2: dragEnd.nx, y2: dragEnd.ny, preview: true }
    : null;

  // evento a dibujar: hover tiene prioridad, luego seleccionado, luego último generado
  const eventToDraw = hoveredEventId
    ? events.find((e) => e.id === hoveredEventId)
    : (selectedEventId ? events.find((e) => e.id === selectedEventId) : lastEvent);

  // función que dibuja un evento (punto o flecha) usando la misma escala que tu cancha
  function renderEvent(ev, color = "#ffd166") {
    if (!ev) return null;
    // flecha (tiene x2)
    if (ev.x2 !== undefined && ev.x2 !== "") {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement("circle", {
          cx: (ev.x1 / 100) * 105,
          cy: (1 - ev.y1 / 100) * 70,
          r: 1.4,
          fill: color,
          stroke: "#000",
          strokeWidth: 0.05,
        }),
        React.createElement("line", {
          x1: (ev.x1 / 100) * 105,
          y1: (1 - ev.y1 / 100) * 70,
          x2: (ev.x2 / 100) * 105,
          y2: (1 - ev.y2 / 100) * 70,
          stroke: color,
          strokeWidth: 0.6,
          markerEnd: "url(#arrow)",
        })
      );
    }

    // punto simple (usa nx/ny)
    if (ev.nx !== undefined) {
      return React.createElement(
        "g",
        {
          transform: "translate(" + (ev.nx / 100) * 105 + ", " + (1 - ev.ny / 100) * 70 + ")",
        },
        React.createElement("circle", {
          cx: 0,
          cy: 0,
          r: 1.4,
          fill: color,
          stroke: "#000",
          strokeWidth: 0.05,
        })
      );
    }

    return null;
  }

  return React.createElement(
    "div",
    { className: "min-h-screen flex items-center justify-center bg-gray-100 p-4" },
    React.createElement(
      "div",
      { className: "w-full max-w-6xl flex gap-4" },

      // LEFT: players local
      React.createElement(
        "div",
        { className: "w-52 bg-white p-3 rounded shadow flex flex-col" },
        React.createElement("input", {
          value: teamLocal,
          onChange: function (e) { setTeamLocal(e.target.value); },
          className: "mb-2 text-xs p-1 border rounded text-center",
          placeholder: "Equipo Local",
        }),
        React.createElement("h4", { className: "text-sm font-bold mb-2 text-center" }, "Jugadores"),
        React.createElement(
          "div",
          { className: "space-y-1 max-h-[60vh] overflow-auto flex-1" },
          playersLocal.map(function (p, i) {
            return React.createElement(
              "div",
              { key: i, className: "flex gap-2 items-center" },
              React.createElement("input", {
                value: p,
                onChange: function (e) {
                  setPlayersLocal(function (arr) {
                    return arr.map(function (x, idx) { return idx === i ? e.target.value : x; });
                  });
                },
                className: "flex-1 text-xs p-1 border rounded",
                placeholder: "Jugador " + (i + 1),
              }),
              React.createElement(
                "button",
                {
                  className:
                    "px-2 py-1 rounded text-xs " +
                    (selectedPlayerIdx === "L" + i && p ? "bg-blue-600 text-white" : "bg-gray-200"),
                  disabled: !p,
                  onClick: function () { setSelectedPlayerIdx("L" + i); },
                },
                "OK"
              )
            );
          })
        ),
        React.createElement(
          "div",
          { className: "mt-2 flex gap-1" },
          React.createElement("input", {
            value: minutes,
            onChange: function (e) { setMinutes(e.target.value); },
            className: "flex-1 text-xs p-1 border rounded",
            placeholder: "Min",
          }),
          React.createElement("input", {
            value: seconds,
            onChange: function (e) { setSeconds(e.target.value); },
            className: "flex-1 text-xs p-1 border rounded",
            placeholder: "Seg",
          })
        )
      ),

      // CENTER: pitch + acciones + eventos
      React.createElement(
        "div",
        { className: "flex-1 flex flex-col items-center" },

        // pitch container
        React.createElement(
          "div",
          { className: "w-full max-w-2xl bg-green-600 rounded shadow p-2" },
          React.createElement(
            "div",
            {
              ref: pitchRef,
              onPointerDown: handlePointerDown,
              onPointerMove: handlePointerMove,
              onPointerUp: handlePointerUp,
              className: "relative w-full aspect-[105/70] bg-green-600 rounded overflow-hidden",
            },

            React.createElement(
              "div",
              {
                className:
                  "absolute top-1 left-0 right-0 text-center text-white text-xs opacity-40 z-10 pointer-events-none select-none",
              },
              "Herramienta desarrollada por SCOUTEAR @scout.ear"
            ),

            React.createElement(
              "svg",
              { viewBox: "0 0 105 70", preserveAspectRatio: "none", className: "w-full h-full block" },

              // defs / marker
              React.createElement(
                "defs",
                null,
                React.createElement(
                  "marker",
                  {
                    id: "arrow",
                    markerWidth: 6,
                    markerHeight: 6,
                    refX: 5,
                    refY: 3,
                    orient: "auto",
                    markerUnits: "strokeWidth",
                  },
                  React.createElement("path", { d: "M0,0 L6,3 L0,6 z", fill: "#ffd166" })
                )
              ),

              // pitch shapes
              React.createElement("rect", { x: 0, y: 0, width: 105, height: 70, fill: "#3b7a57", rx: 2 }),
              React.createElement("line", { x1: 52.5, y1: 0, x2: 52.5, y2: 70, stroke: "#ffffff66", strokeWidth: 0.3 }),
              React.createElement("circle", { cx: 52.5, cy: 35, r: 9.15, fill: "none", stroke: "#fff", strokeWidth: 0.3 }),

              // grandes
              React.createElement("rect", { x: 0, y: 18, width: 16, height: 34, fill: "none", stroke: "#fff", strokeWidth: 0.3 }),
              React.createElement("rect", { x: 89, y: 18, width: 16, height: 34, fill: "none", stroke: "#fff", strokeWidth: 0.3 }),

              // chicas
              React.createElement("rect", { x: 0, y: 26, width: 6, height: 18, fill: "none", stroke: "#fff", strokeWidth: 0.3 }),
              React.createElement("rect", { x: 99, y: 26, width: 6, height: 18, fill: "none", stroke: "#fff", strokeWidth: 0.3 }),

              // semicirculos
              React.createElement("path", { d: "M16,26 A9,9 0 0,1 16,44", fill: "none", stroke: "#fff", strokeWidth: 0.3 }),
              React.createElement("path", { d: "M89,26 A9,9 0 0,0 89,44", fill: "none", stroke: "#fff", strokeWidth: 0.3 }),

              // penales
              React.createElement("circle", { cx: 11, cy: 35, r: 0.6, fill: "#fff" }),
              React.createElement("circle", { cx: 94, cy: 35, r: 0.6, fill: "#fff" }),

              // renderEvent (puede devolver elementos react)
              renderEvent(eventToDraw),

              // preview arrastre
              preview && preview.preview
                ? React.createElement(
                    React.Fragment,
                    null,
                    React.createElement("circle", {
                      cx: (preview.x1 / 100) * 105,
                      cy: (1 - preview.y1 / 100) * 70,
                      r: 1.2,
                      fill: "#ffd166",
                      stroke: "#000",
                      strokeWidth: 0.03,
                    }),
                    React.createElement("line", {
                      x1: (preview.x1 / 100) * 105,
                      y1: (1 - preview.y1 / 100) * 70,
                      x2: (preview.x2 / 100) * 105,
                      y2: (1 - preview.y2 / 100) * 70,
                      stroke: "#ffd166",
                      strokeWidth: 0.4,
                      strokeDasharray: "1 1",
                      markerEnd: "url(#arrow)",
                    })
                  )
                : null
            )
          )
        ),

        // Acciones + Eventos
        React.createElement(
          "div",
          { className: "mt-3 w-full max-w-2xl flex gap-2" },

          // Acciones
          React.createElement(
            "div",
            { className: "w-64 bg-white p-3 rounded shadow" },
            React.createElement("h4", { className: "text-sm font-bold mb-2 text-center" }, "Acciones"),
            React.createElement(
              "div",
              { className: "space-y-1 max-h-40 overflow-auto" },
              actions.map(function (a, i) {
                return React.createElement(
                  "div",
                  { key: i, className: "flex gap-2 items-center" },
                  React.createElement("input", {
                    value: a,
                    onChange: function (e) {
                      setActions(function (arr) {
                        return arr.map(function (x, idx) { return idx === i ? e.target.value : x; });
                      });
                    },
                    className: "flex-1 text-xs p-1 border rounded",
                    placeholder: "Acción " + (i + 1),
                  }),
                  React.createElement(
                    "button",
                    {
                      className:
                        "px-2 py-1 rounded text-xs " +
                        (selectedActionIdx === i && a ? "bg-green-600 text-white" : "bg-gray-200"),
                      disabled: !a,
                      onClick: function () { setSelectedActionIdx(i); },
                    },
                    "OK"
                  )
                );
              })
            )
          ),

          // Eventos (tabla)
          React.createElement(
            "div",
            { className: "flex-1 bg-white p-3 rounded shadow flex flex-col" },
            React.createElement("h4", { className: "text-sm font-bold mb-2 text-center" }, "Eventos"),
            React.createElement(
              "div",
              { className: "flex-1 overflow-auto text-xs" },
              React.createElement(
                "table",
                { className: "w-full text-left border-collapse" },
                React.createElement(
                  "thead",
                  null,
                  React.createElement(
                    "tr",
                    { className: "bg-gray-200" },
                    React.createElement("th", { className: "p-1 border" }, "Equipo"),
                    React.createElement("th", { className: "p-1 border" }, "Jugador"),
                    React.createElement("th", { className: "p-1 border" }, "Acción"),
                    React.createElement("th", { className: "p-1 border" }, "X1"),
                    React.createElement("th", { className: "p-1 border" }, "Y1"),
                    React.createElement("th", { className: "p-1 border" }, "X2"),
                    React.createElement("th", { className: "p-1 border" }, "Y2"),
                    React.createElement("th", { className: "p-1 border" }, "Min"),
                    React.createElement("th", { className: "p-1 border" }, "Seg"),
                    React.createElement("th", { className: "p-1 border" }, "Borrar")
                  )
                ),
                React.createElement(
                  "tbody",
                  null,
                  events.map(function (ev) {
                    return React.createElement(
                      "tr",
                      {
                        key: ev.id,
                        className: selectedEventId === ev.id ? "bg-gray-300" : "odd:bg-gray-50",
                        onMouseEnter: function () { setHoveredEventId(ev.id); },
                        onMouseLeave: function () { setHoveredEventId(null); },
                        onClick: function () {
                          // toggle selección: si clickeás la misma fila, deselecciona
                          setSelectedEventId(selectedEventId === ev.id ? null : ev.id);
                          // mostrarlo en cancha como permanente
                          setLastEvent(ev);
                        },
                      },
                      React.createElement("td", { className: "p-1 border" }, ev.equipo),
                      React.createElement("td", { className: "p-1 border" }, ev.player),
                      React.createElement("td", { className: "p-1 border" }, ev.action),
                      React.createElement("td", { className: "p-1 border" }, ev.x1 ?? ev.nx ?? ""),
                      React.createElement("td", { className: "p-1 border" }, ev.y1 ?? ev.ny ?? ""),
                      React.createElement("td", { className: "p-1 border" }, ev.x2 ?? ""),
                      React.createElement("td", { className: "p-1 border" }, ev.y2 ?? ""),
                      React.createElement("td", { className: "p-1 border" }, ev.minutos ?? ev.minutes ?? ""),
                      React.createElement("td", { className: "p-1 border" }, ev.segundos ?? ev.seconds ?? ""),
                      React.createElement(
                        "td",
                        { className: "p-1 border text-center" },
                        React.createElement(
                          "button",
                          {
                            className: "text-red-600 font-bold",
                            onClick: function (e) { e.stopPropagation(); deleteEvent(ev.id); },
                          },
                          "✕"
                        )
                      )
                    );
                  })
                )
              )
            ),

            React.createElement(
              "div",
              { className: "mt-2 grid grid-cols-2 gap-2" },
              React.createElement(
                "button",
                {
                  className: "w-full bg-blue-600 text-white py-2 rounded text-sm",
                  onClick: downloadCSV,
                  disabled: !events.length,
                },
                "Descargar CSV"
              ),
              React.createElement(
                "button",
                {
                  className: "w-full bg-purple-600 text-white py-2 rounded text-sm",
                  onClick: downloadStats,
                  disabled: !events.length,
                },
                "STATS"
              )
            )
          )
        )
      ),

      // RIGHT: players visitante
      React.createElement(
        "div",
        { className: "w-52 bg-white p-3 rounded shadow flex flex-col" },
        React.createElement("input", {
          value: teamVisit,
          onChange: function (e) { setTeamVisit(e.target.value); },
          className: "mb-2 text-xs p-1 border rounded text-center",
          placeholder: "Equipo Visitante",
        }),
        React.createElement("h4", { className: "text-sm font-bold mb-2 text-center" }, "Jugadores"),
        React.createElement(
          "div",
          { className: "space-y-1 max-h-[68vh] overflow-auto flex-1" },
          playersVisit.map(function (p, i) {
            return React.createElement(
              "div",
              { key: i, className: "flex gap-2 items-center" },
              React.createElement("input", {
                value: p,
                onChange: function (e) {
                  setPlayersVisit(function (arr) {
                    return arr.map(function (x, idx) { return idx === i ? e.target.value : x; });
                  });
                },
                className: "flex-1 text-xs p-1 border rounded",
                placeholder: "Jugador " + (i + 1),
              }),
              React.createElement(
                "button",
                {
                  className:
                    "px-2 py-1 rounded text-xs " +
                    (selectedPlayerIdx === "V" + i && p ? "bg-blue-600 text-white" : "bg-gray-200"),
                  disabled: !p,
                  onClick: function () { setSelectedPlayerIdx("V" + i); },
                },
                "OK"
              )
            );
          })
        )
      )
    )
  );
}

// Montar la app (mantener createRoot tal como lo tenías)
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Capograma, null));
