/* graph-parsers.js — input parsers for CSIS-213 Unit 02 graph tools */

const GraphParsers = (() => {

  // ── Edge List ─────────────────────────────────────────────────────────────
  // Format: one edge per line: "A B" or "A-B" or "A,B"
  function parseEdgeList(text) {
    const errors = [];
    const vertices = new Set();
    const edges = [];
    const seen = new Set();

    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return { ok: false, errors: ['Input is empty.'], vertices: [], edges: [] };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Split on whitespace, comma, or hyphen (not inside labels)
      const parts = line.split(/[\s,\-]+/).filter(Boolean);
      if (parts.length !== 2) {
        errors.push(`Line ${i + 1}: expected two vertex labels, got "${line}".`);
        continue;
      }
      const [u, v] = parts;
      vertices.add(u);
      vertices.add(v);
      const key = [u, v].sort().join(',');
      if (seen.has(key)) {
        errors.push(`Duplicate edge {${u},${v}} on line ${i + 1} was ignored.`);
        continue;
      }
      seen.add(key);
      edges.push({ source: u, target: v });
    }

    return { ok: errors.length === 0, errors, vertices: [...vertices].sort(), edges };
  }

  // ── Adjacency List ────────────────────────────────────────────────────────
  // Format: "A: B, C" or "A -> B, C"
  function parseAdjacencyList(text) {
    const errors = [];
    const edgeSet = new Set();
    const edges = [];
    const vertexSet = new Set();

    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return { ok: false, errors: ['Input is empty.'], vertices: [], edges: [] };

    const declared = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Split on first ':' or '->'
      const sepMatch = line.match(/^([^:\-]+?)(?:\s*:|\s*->)\s*(.*)/);
      if (!sepMatch) {
        errors.push(`Line ${i + 1}: could not parse "${line}". Expected format: "A: B, C"`);
        continue;
      }
      const u = sepMatch[1].trim();
      const neighborStr = sepMatch[2].trim();
      vertexSet.add(u);
      declared[u] = true;

      const neighbors = neighborStr ? neighborStr.split(/[\s,]+/).filter(Boolean) : [];
      for (const v of neighbors) {
        vertexSet.add(v);
        const key = [u, v].sort().join(',');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: u, target: v });
        }
      }
    }

    // Warn about vertices that appear as neighbors but were never declared as keys
    for (const v of vertexSet) {
      if (!declared[v]) {
        errors.push(`Vertex "${v}" appears as a neighbor but was never declared as a row. This is allowed but may indicate a typo.`);
      }
    }

    return { ok: errors.length === 0, errors, vertices: [...vertexSet].sort(), edges };
  }

  // ── Adjacency Matrix ─────────────────────────────────────────────────────
  // Format:
  //   Labels: A B C D    ← optional header line
  //   0 1 1 0
  //   1 0 1 0
  //   ...
  function parseAdjacencyMatrix(text) {
    const errors = [];
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return { ok: false, errors: ['Input is empty.'], vertices: [], edges: [] };

    let labels = null;
    let matrixLines = lines;

    // Check for explicit Labels: line
    if (/^labels?\s*:/i.test(lines[0])) {
      const labelPart = lines[0].replace(/^labels?\s*:\s*/i, '');
      labels = labelPart.split(/[\s,]+/).filter(Boolean);
      matrixLines = lines.slice(1);
    }

    // Parse numeric rows
    const rows = matrixLines.map(l => l.split(/[\s,]+/).filter(Boolean).map(Number));
    const n = rows.length;

    if (n === 0) return { ok: false, errors: ['No matrix data found.'], vertices: [], edges: [] };

    // Square check
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].length !== n) {
        errors.push(`Row ${i + 1} has ${rows[i].length} entries but the matrix has ${n} rows. An n × n matrix is required.`);
      }
    }
    if (errors.length) return { ok: false, errors, vertices: [], edges: [] };

    // Generate labels if not provided
    if (!labels) {
      labels = Array.from({ length: n }, (_, i) =>
        i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(65 + i % 26) + Math.floor(i / 26)
      );
    } else if (labels.length !== n) {
      errors.push(`${labels.length} labels provided but matrix is ${n} × ${n}.`);
      return { ok: false, errors, vertices: [], edges: [] };
    }

    // Only 0s and 1s
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (rows[i][j] !== 0 && rows[i][j] !== 1) {
          errors.push(`Entry at row ${i + 1}, column ${j + 1} is "${rows[i][j]}". Only 0 and 1 are allowed.`);
        }
      }
    }

    // Diagonal zeros (no self-loops)
    for (let i = 0; i < n; i++) {
      if (rows[i][i] !== 0) {
        errors.push(`Diagonal entry at row ${i + 1} (vertex ${labels[i]}) is 1. Self-loops are not allowed in simple graphs.`);
      }
    }

    // Symmetric check (undirected)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (rows[i][j] !== rows[j][i]) {
          errors.push(`Matrix is not symmetric: entry [${labels[i]}][${labels[j]}] = ${rows[i][j]} but [${labels[j]}][${labels[i]}] = ${rows[j][i]}. For an undirected graph the matrix must be symmetric.`);
        }
      }
    }

    if (errors.length) return { ok: false, errors, vertices: labels, edges: [] };

    // Build edges from upper triangle
    const edges = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (rows[i][j] === 1) edges.push({ source: labels[i], target: labels[j] });
      }
    }

    return { ok: true, errors: [], vertices: labels, edges };
  }

  // ── Apply parsed result to a Graph instance ──────────────────────────────
  // Places vertices in a circular layout if coordinates are not provided.
  function applyToGraph(graph, parsed, layoutRadius = 130) {
    graph.clear();
    const n = parsed.vertices.length;
    const cx = 260, cy = 200;

    parsed.vertices.forEach((lbl, i) => {
      const angle = (2 * Math.PI * i / Math.max(n, 1)) - Math.PI / 2;
      const r = n <= 1 ? 0 : layoutRadius;
      graph.addVertex(
        cx + r * Math.cos(angle),
        cy + r * Math.sin(angle),
        lbl
      );
    });

    for (const e of parsed.edges) {
      graph.addEdge(e.source, e.target);
    }
  }

  return { parseEdgeList, parseAdjacencyList, parseAdjacencyMatrix, applyToGraph };
})();
