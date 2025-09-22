// Campograma.js
// Usa React global cargado desde el HTML (UMD)
const { useEffect, useRef, useState } = React;
const STORAGE_KEY = "campograma_events_v_arrow_v1";

function Campograma() {
  const pitchRef = useRef(null);

  // estados principales
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

  // último evento dibujado en cancha
  const [lastEvent, setLastEvent] = useState(null);

  // hover y selección en tabla
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // arrastrar (flecha)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  // carga inicial desde localStorage
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

  // persistir en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  // coords relativas
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

  // crear evento punto
  function createPointEvent(coords) {
    const idx = selectedPlayerIdx ? parseInt(selectedPlayerIdx.slice(1), 10) : null;
    const player = selectedPlayerIdx
      ? (selectedPlayerIdx.startsWith("L") ? playersLocal[idx] : playersVisit[idx])
      : "";
    const team = selectedPlayerIdx
      ? (selectedPlayerIdx.startsWith("L") ? teamLocal : teamVisit)
      : "";

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

  // crear evento flecha
  function createArrowEvent(start, end) {
    const idx = selectedPlayerIdx ? parseInt(selectedPlayerIdx.slice(1), 10) : null;
    const player = selectedPlayerIdx
      ? (selectedPlayerIdx.startsWith("L") ? playersLocal[idx] : playersVisit[idx])
      : "";
    const team = selectedPlayerIdx
      ? (selectedPlayerIdx.startsWith("L") ? teamLocal : teamVisit)
      : "";

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

  // borrar evento
  function deleteEvent(id) {
    setEvents((s) => s.filter((ev) => ev.id !== id));
    if (selectedEventId === id) setSelectedEventId(null);
    if (hoveredEventId === id) setHoveredEventId(null);
    if (lastEvent && lastEvent.id === id) setLastEvent(null);
  }

  // descargar CSV
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
      ev.minutos ?? "",
      ev.segundos ?? "",
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

  // descargar stats (XLSX)
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
    [teamLocal, teamVisit].forEach((team) => {
      if (team && stats[team]) {
        Object.entries(stats[team]).forEach(([player, actionsObj]) => {
          const row = { Equipo: team, Jugador: player };
          Object.entries(actionsObj).forEach(([accion, cantidad]) => {
            row[accion] = cantidad;
          });
          rows.push(row);
        });
      }
    });

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

  // handlers pointer
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
    } catch {}
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
    } catch {}

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

  // preview y último evento
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
          <circle cx={(ev.x1 / 100) * 105} cy={(1 - ev.y1 / 100) * 70} r={1.4} fill={color} stroke="#000" strokeWidth={0.05} />
          <line x1={(ev.x1 / 100) * 105} y1={(1 - ev.y1 / 100) * 70} x2={(ev.x2 / 100) * 105} y2={(1 - ev.y2 / 100) * 70}
            stroke={color} strokeWidth={0.6} markerEnd="url(#arrow)" />
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-2 left-2">
        <a href="index.html" className="bg-blue-600 text-white px-3 py-1 rounded text-sm shadow">Inicio</a>
      </div>

      <div className="w-full max-w-6xl flex gap-4">
        {/* Izquierda: jugadores local */}
        <div className="w-52 bg-white p-3 rounded shadow flex flex-col">
          <input value={teamLocal} onChange={(e) => setTeamLocal(e.target.value)}
            className="mb-2 text-xs p-1 border rounded text-center" placeholder="Equipo Local" />
          <h4 className="text-sm font-bold mb-2 text-center">Jugadores</h4>
          <div className="space-y-1 max-h-[60vh] overflow-auto flex-1">
            {playersLocal.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={p} onChange={(e) => setPlayersLocal((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
                  className="flex-1 text-xs p-1 border rounded" placeholder={`Jugador ${i + 1}`} />
                <button className={`px-2 py-1 rounded text-xs ${selectedPlayerIdx === `L${i}` && p ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  disabled={!p} onClick={() => setSelectedPlayerIdx(`L${i}`)}>OK</button>
              </div>
            ))}
          </div>

          <div className="mt-2 flex gap-1">
            <input value={minutes} onChange={(e) => setMinutes(e.target.value)}
              className="flex-1 text-xs p-1 border rounded" placeholder="Min" />
            <input value={seconds} onChange={(e) => setSeconds(e.target.value)}
              className="flex-1 text-xs p-1 border rounded" placeholder="Seg" />
          </div>
        </div>

        {/* Centro: cancha + acciones + eventos */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-2xl bg-green-600 rounded shadow p-2">
            <div ref={pitchRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
              className="relative w-full aspect-[105/70] bg-green-600 rounded overflow-hidden">
              <div className="absolute top-1 left-0 right-0 text-center text-white text-xs opacity-40 z-10 pointer-events-none select-none">
                Herramienta desarrollada por SCOUTEAR @scout.ear
              </div>
              <svg viewBox="0 0 105 70" preserveAspectRatio="none" className="w-full h-full block">
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L6,3 L0,6 z" fill="#ffd166" />
                  </marker>
                </defs>
                <rect x="0" y="0" width="105" height="70" fill="#3b7a57" rx="2" />
                <line x1="52.5" y1="0" x2="52.5" y2="70" stroke="#ffffff66" strokeWidth="0.3" />
                <circle cx="52.5" cy="35" r="9.15" fill="none" stroke="#fff" strokeWidth="0.3" />
                <rect x="0" y="18" width="16" height="34" fill="none" stroke="#fff" strokeWidth="0.3" />
                <rect x="89" y="18" width="16" height="34" fill="none" stroke="#fff" strokeWidth="0.3" />
                <rect x="0" y="26" width="6" height="18" fill="none" stroke="#fff" strokeWidth="0.3" />
                <rect x="99" y="26" width="6" height="18" fill="none" stroke="#fff" strokeWidth="0.3" />
                <path d="M16,26 A9,9 0 0,1 16,44" fill="none" stroke="#fff" strokeWidth="0.3" />
                <path d="M89,26 A9,9 0 0,0 89,44" fill="none" stroke="#fff" strokeWidth="0.3" />
                <circle cx="11" cy="35" r="0.6" fill="#fff" />
                <circle cx="94" cy="35" r="0.6" fill="#fff" />
                {renderEvent(eventToDraw)}
                {preview && preview.preview && (
                  <>
                    <circle cx={(preview.x1 / 100) * 105} cy={(1 - preview.y1 / 100) * 70} r={1.2} fill="#ffd166" stroke="#000" strokeWidth={0.03} />
                    <line x1={(preview.x1 / 100) * 105} y1={(1 - preview.y1 / 100) * 70} x2={(preview.x2 / 100) * 105} y2={(1 - preview.y2 / 100) * 70}
                      stroke="#ffd166" strokeWidth={0.4} strokeDasharray="1 1" markerEnd="url(#arrow)" />
                  </>
                )}
              </svg>
            </div>
          </div>

          <div className="mt-3 w-full max-w-2xl flex gap-2">
            {/* Acciones */}
            <div className="w-64 bg-white p-3 rounded shadow">
              <h4 className="text-sm font-bold mb-2 text-center">Acciones</h4>
              <div className="space-y-1 max-h-40 overflow-auto">
                {actions.map((a, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={a} onChange={(e) => setActions((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
                      className="flex-1 text-xs p-1 border rounded" placeholder={`Acción ${i + 1}`} />
                    <button className={`px-2 py-1 rounded text-xs ${selectedActionIdx === i && a ? "bg-green-600 text-white" : "bg-gray-200"}`}
                      disabled={!a} onClick={() => setSelectedActionIdx(i)}>OK</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Eventos */}
            <div className="flex-1 bg-white p-3 rounded shadow flex flex-col">
              <h4 className="text-sm font-bold mb-2">Eventos</h4>
              <div className="flex gap-2 mb-2">
                <button onClick={downloadCSV} className="bg-blue-600 text-white px-2 py-1 rounded text-xs shadow">Descargar CSV</button>
                <button onClick={downloadStats} className="bg-green-600 text-white px-2 py-1 rounded text-xs shadow">Descargar Stats</button>
              </div>
              <div className="overflow-auto max-h-48 text-xs">
                <table className="w-full border text-[11px]">
                  <thead>
                    <tr className="bg-gray-200">
                      <th>Eq</th><th>Jugador</th><th>Acción</th><th>Min</th><th>Seg</th><th>X1</th><th>Y1</th><th>X2</th><th>Y2</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}
                        className={`border-b cursor-pointer ${ev.id === selectedEventId ? "bg-blue-100" : hoveredEventId === ev.id ? "bg-yellow-100" : ""}`}
                        onMouseEnter={() => setHoveredEventId(ev.id)} onMouseLeave={() => setHoveredEventId(null)}
                        onClick={() => setSelectedEventId(ev.id)}>
                        <td>{ev.equipo}</td>
                        <td>{ev.player}</td>
                        <td>{ev.action}</td>
                        <td>{ev.minutos}</td>
                        <td>{ev.segundos}</td>
                        <td>{ev.x1 ?? ev.nx}</td>
                        <td>{ev.y1 ?? ev.ny}</td>
                        <td>{ev.x2}</td>
                        <td>{ev.y2}</td>
                        <td><button onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                          className="text-red-500">X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Derecha: jugadores visitante */}
        <div className="w-52 bg-white p-3 rounded shadow flex flex-col">
          <input value={teamVisit} onChange={(e) => setTeamVisit(e.target.value)}
            className="mb-2 text-xs p-1 border rounded text-center" placeholder="Equipo Visitante" />
          <h4 className="text-sm font-bold mb-2 text-center">Jugadores</h4>
          <div className="space-y-1 max-h-[60vh] overflow-auto flex-1">
            {playersVisit.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={p} onChange={(e) => setPlayersVisit((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
                  className="flex-1 text-xs p-1 border rounded" placeholder={`Jugador ${i + 1}`} />
                <button className={`px-2 py-1 rounded text-xs ${selectedPlayerIdx === `V${i}` && p ? "bg-red-600 text-white" : "bg-gray-200"}`}
                  disabled={!p} onClick={() => setSelectedPlayerIdx(`V${i}`)}>OK</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Montar app
ReactDOM.createRoot(document.getElementById("root")).render(<Campograma />);
