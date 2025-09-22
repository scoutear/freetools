// Usa React global (cargado desde campograma.html por CDN)
const { useEffect, useRef, useState } = React;
const STORAGE_KEY = "campograma_events_v_arrow_v1";

function Campograma() {
  const pitchRef = useRef(null);

  // Estados principales
  const [events, setEvents] = useState([]);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(null);
  const [selectedActionIdx, setSelectedActionIdx] = useState(null);
  const [playersLocal, setPlayersLocal] = useState(Array(11).fill(""));
  const [playersVisit, setPlayersVisit] = useState(Array(11).fill(""));
  const [actions, setActions] = useState(Array(15).fill(""));
  const [teamLocal, setTeamLocal] = useState("Equipo Local");
  const [teamVisit, setTeamVisit] = useState("Equipo Visitante");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const [lastEvent, setLastEvent] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  // Cargar desde localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setEvents(parsed || []);
        if (parsed && parsed.length) {
          setLastEvent(parsed[parsed.length - 1]);
        }
      } catch {}
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  function getRelativeCoords(evt) {
    const el = pitchRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const nx = +(100 * (x / rect.width)).toFixed(2);
    const ny = +(100 * (1 - y / rect.height)).toFixed(2);
    return { nx, ny };
  }

  function createPointEvent(coords) {
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
      nx: coords.nx,
      ny: coords.ny,
      x1: coords.nx,
      y1: coords.ny,
      x2: "",
      y2: "",
      minutos: minutes || "",
      segundos: seconds || "",
      created_at: new Date().toISOString(),
    };
    setEvents((s) => [...s, ev]);
    setLastEvent(ev);
    setSelectedEventId(ev.id);
  }

  function createArrowEvent(start, end) {
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
      x1: start.nx,
      y1: start.ny,
      x2: end.nx,
      y2: end.ny,
      nx: start.nx,
      ny: start.ny,
      minutos: minutes || "",
      segundos: seconds || "",
      created_at: new Date().toISOString(),
    };
    setEvents((s) => [...s, ev]);
    setLastEvent(ev);
    setSelectedEventId(ev.id);
  }

  function deleteEvent(id) {
    setEvents((s) => s.filter((ev) => ev.id !== id));
    if (selectedEventId === id) setSelectedEventId(null);
    if (hoveredEventId === id) setHoveredEventId(null);
    if (lastEvent && lastEvent.id === id) setLastEvent(null);
  }

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
    a.download = "eventos_campograma.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

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
    XLSX.writeFile(wb, "stats_campograma.xlsx");
  }

  function handlePointerDown(e) {
    if (selectedPlayerIdx === null || selectedActionIdx === null) {
      alert("Seleccioná jugador y acción antes de marcar");
      return;
    }
    const coords = getRelativeCoords(e);
    if (!coords) return;
    setIsDragging(true);
    setDragStart(coords);
    setDragEnd(coords);
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
    if (!isDragging) return;
    const coords = getRelativeCoords(e);
    const endCoords = coords || dragEnd;
    try {
      e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const dx = Math.abs((dragStart?.nx ?? 0) - (endCoords?.nx ?? 0));
    const dy = Math.abs((dragStart?.ny ?? 0) - (endCoords?.ny ?? 0));
    const dist = Math.sqrt(dx * dx + dy * dy);
    const THRESH = 0.8;

    if (dist <= THRESH) {
      createPointEvent(dragStart);
    } else {
      createArrowEvent(dragStart, endCoords);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }

  const preview = isDragging && dragStart && dragEnd
    ? { x1: dragStart.nx, y1: dragStart.ny, x2: dragEnd.nx, y2: dragEnd.ny, preview: true }
    : null;

  const eventToDraw = hoveredEventId
    ? events.find((e) => e.id === hoveredEventId)
    : (selectedEventId ? events.find((e) => e.id === selectedEventId) : lastEvent);

  function renderEvent(ev, color = "#ffd166") {
    if (!ev) return null;
    if (ev.x2 !== undefined && ev.x2 !== "") {
      return (
        <>
          <circle
            cx={(ev.x1 / 100) * 105}
            cy={(1 - ev.y1 / 100) * 70}
            r={1.4}
            fill={color}
            stroke="#000"
            strokeWidth={0.05}
          />
          <line
            x1={(ev.x1 / 100) * 105}
            y1={(1 - ev.y1 / 100) * 70}
            x2={(ev.x2 / 100) * 105}
            y2={(1 - ev.y2 / 100) * 70}
            stroke={color}
            strokeWidth={0.6}
            markerEnd="url(#arrow)"
          />
        </>
      );
    }
    if (ev.nx !== undefined) {
      return (
        <g transform={`translate(${(ev.nx / 100) * 105}, ${(1 - ev.ny / 100) * 70})`}>
          <circle cx={0} cy={0} r={1.4} fill={color} stroke="#000" strokeWidth={0.05} />
        </g>
      );
    }
    return null;
  }

  // ---- Render principal ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl flex gap-4">
        {/* TODO: acá va tu UI completa (inputs, selects, botones, cancha SVG, etc.) */}
        <p className="text-center w-full">Campograma cargado correctamente ✅</p>
      </div>
    </div>
  );
}

// === App principal con botón de inicio ===
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

// Montar la App
ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(App, null)
);
