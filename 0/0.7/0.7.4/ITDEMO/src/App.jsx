import React, { useState, useEffect } from "react";
import { setLocalIdeas } from "./data/ideas.js";

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [indexTable, setIndexTable] = useState({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState("none");
  const [newIdea, setNewIdea] = useState({ title: "", tags: "" });
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    setLocalIdeas();
    const storedIdeas = JSON.parse(localStorage.getItem("ideas")) || [];
    const storedIndex = JSON.parse(localStorage.getItem("ideaTagIndex")) || {};
    setIdeas(storedIdeas);
    setIndexTable(storedIndex);
  }, []);

  const buildIndexTable = () => {
    const newIndex = {};
    for (const idea of ideas) {
      for (const tag of idea.tags) {
        const normalizedTag = tag.toLowerCase();
        if (!newIndex[normalizedTag]) newIndex[normalizedTag] = [];
        newIndex[normalizedTag].push({ ideaId: idea.ideaId, title: idea.title });
      }
    }
    localStorage.setItem("ideaTagIndex", JSON.stringify(newIndex));
    setIndexTable(newIndex);
    alert("Índice reconstruido");
  };

  const searchSlow = () => {
    const start = performance.now();
    const filtered = ideas.filter((idea) =>
      idea.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    const end = performance.now();
    setResults(filtered);
    setMode("slow");
    setSearchTime((end - start).toFixed(3));
  };

  const searchFast = () => {
    const start = performance.now();
    const idx = indexTable[query.toLowerCase()] || [];
    const end = performance.now();
    setResults(idx);
    setMode("fast");
    setSearchTime((end - start).toFixed(3));
  };

  const addIdea = () => {
    if (!newIdea.title || !newIdea.tags) return alert("Completa los campos");
    const tags = newIdea.tags.split(",").map((t) => t.trim().toLowerCase());
    const newEntry = {
      ideaId: "idea_" + (ideas.length + 1),
      title: newIdea.title,
      tags,
    };
    const updatedIdeas = [...ideas, newEntry];
    setIdeas(updatedIdeas);
    localStorage.setItem("ideas", JSON.stringify(updatedIdeas));

    setTimeout(() => {
      const updatedIndex = { ...indexTable };
      for (const tag of tags) {
        if (!updatedIndex[tag]) updatedIndex[tag] = [];
        updatedIndex[tag].push({ ideaId: newEntry.ideaId, title: newEntry.title });
      }
      setIndexTable(updatedIndex);
      localStorage.setItem("ideaTagIndex", JSON.stringify(updatedIndex));
    }, 1000);

    setNewIdea({ title: "", tags: "" });
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Demo: Patrón Index Table</h1>
      <p>Comparando búsqueda lenta vs búsqueda rápida.</p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          placeholder="Buscar por tag"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "0.5rem", flex: 1 }}
        />
        <button onClick={searchSlow}>Buscar lenta</button>
        <button onClick={searchFast}>Buscar rápida</button>
        <button onClick={buildIndexTable}>Reconstruir índice</button>
      </div>

      <h3>Resultados ({mode === "slow" ? "sin índice" : mode === "fast" ? "con índice" : "..."})</h3>
      <p>Tiempo de búsqueda: {searchTime} ms</p>
      <ul>
        {results.length > 0 ? (
          results.map((r) => (
            <li key={r.ideaId}>
              <strong>{r.title}</strong> — ID: {r.ideaId}
            </li>
          ))
        ) : (
          <p>No hay resultados</p>
        )}
      </ul>

      <hr style={{ margin: "2rem 0" }} />

      <h3>Agregar nueva idea</h3>
      <input
        placeholder="Título"
        value={newIdea.title}
        onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
      />
      <input
        placeholder="Tags (separados por comas)"
        value={newIdea.tags}
        onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
      />
      <button onClick={addIdea}>Publicar idea</button>

      <hr style={{ margin: "2rem 0" }} />
      <h4>Ideas totales: {ideas.length}</h4>
      <h4>Tags indexados: {Object.keys(indexTable).length}</h4>
    </div>
  );
}