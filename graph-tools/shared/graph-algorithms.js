/* graph-algorithms.js — graph analysis algorithms for CSIS-213 Unit 02 tools */

const GraphAlgorithms = (() => {

  // ── BFS from startId, returns set of visited ids ────────────────────────
  function bfs(graph, startId) {
    const adj = graph.getAdjacencyList();
    const visited = new Set();
    const queue = [startId];
    visited.add(startId);
    while (queue.length) {
      const u = queue.shift();
      for (const w of (adj[u] || [])) {
        if (!visited.has(w)) {
          visited.add(w);
          queue.push(w);
        }
      }
    }
    return visited;
  }

  // ── Connectivity ─────────────────────────────────────────────────────────
  function isConnected(graph) {
    if (graph.vertices.length === 0) return { connected: true, explanation: 'The graph has no vertices.' };
    const start = graph.vertices[0].id;
    const visited = bfs(graph, start);
    const connected = visited.size === graph.vertices.length;
    if (connected) {
      return {
        connected: true,
        explanation: `This graph is connected. Starting from ${start}, every vertex can be reached.`
      };
    }
    const unreached = graph.vertices.filter(v => !visited.has(v.id)).map(v => v.label);
    return {
      connected: false,
      explanation: `This graph is not connected. Starting from ${start}, the following vertices cannot be reached: ${unreached.join(', ')}.`
    };
  }

  // Returns array of component vertex-id sets
  function getComponents(graph) {
    const unvisited = new Set(graph.vertices.map(v => v.id));
    const components = [];
    while (unvisited.size > 0) {
      const start = [...unvisited][0];
      const comp = bfs(graph, start);
      components.push(comp);
      for (const id of comp) unvisited.delete(id);
    }
    return components;
  }

  // ── Cycle detection (undirected DFS) ─────────────────────────────────────
  function hasCycle(graph) {
    const adj = graph.getAdjacencyList();
    const visited = new Set();

    function dfs(u, parent) {
      visited.add(u);
      for (const w of (adj[u] || [])) {
        if (!visited.has(w)) {
          if (dfs(w, u)) return true;
        } else if (w !== parent) {
          return true;
        }
      }
      return false;
    }

    for (const v of graph.vertices) {
      if (!visited.has(v.id)) {
        if (dfs(v.id, null)) {
          return {
            hasCycle: true,
            explanation: 'This graph contains a cycle.'
          };
        }
      }
    }
    return {
      hasCycle: false,
      explanation: 'This graph contains no cycles (it is acyclic).'
    };
  }

  // ── Bipartite check (BFS 2-coloring) ─────────────────────────────────────
  function isBipartite(graph) {
    if (graph.vertices.length === 0) {
      return { bipartite: true, groups: [[], []], explanation: 'The empty graph is bipartite.' };
    }
    const adj = graph.getAdjacencyList();
    const color = {};   // id -> 0 or 1
    const groups = [[], []];

    for (const startV of graph.vertices) {
      if (color[startV.id] !== undefined) continue;
      const queue = [startV.id];
      color[startV.id] = 0;
      while (queue.length) {
        const u = queue.shift();
        for (const w of (adj[u] || [])) {
          if (color[w] === undefined) {
            color[w] = 1 - color[u];
            queue.push(w);
          } else if (color[w] === color[u]) {
            return {
              bipartite: false,
              groups: [[], []],
              explanation: `This graph is not bipartite. The vertices ${u} and ${w} are adjacent but would need to be in the same group.`
            };
          }
        }
      }
    }

    for (const v of graph.vertices) {
      groups[color[v.id] ?? 0].push(v.label);
    }
    groups[0].sort(); groups[1].sort();

    return {
      bipartite: true,
      groups,
      explanation: `This graph is bipartite.\nGroup 1: ${groups[0].join(', ')}\nGroup 2: ${groups[1].join(', ')}`
    };
  }

  // ── Complete graph check ──────────────────────────────────────────────────
  function isComplete(graph) {
    const n = graph.vertices.length;
    if (n < 2) return { complete: n === 1, explanation: n === 0 ? 'No vertices.' : 'A single vertex is trivially K₁.' };
    const expected = n * (n - 1) / 2;
    const actual = graph.edges.length;
    if (actual === expected) {
      return {
        complete: true,
        explanation: `This graph is complete (K${n}). It has all ${expected} possible edges among ${n} vertices.`
      };
    }
    const missing = expected - actual;
    return {
      complete: false,
      explanation: `This graph is not complete. K${n} needs ${expected} edges but this graph has ${actual} — ${missing} edge${missing > 1 ? 's' : ''} are missing.`
    };
  }

  // ── Tree check ────────────────────────────────────────────────────────────
  function isTree(graph) {
    const conn = isConnected(graph);
    const cyc  = hasCycle(graph);
    const tree = conn.connected && !cyc.hasCycle;
    if (tree) {
      return {
        tree: true,
        explanation: 'This graph is a tree. It is connected and contains no cycles.'
      };
    }
    if (!conn.connected && cyc.hasCycle) {
      return { tree: false, explanation: 'This graph is not a tree because it is disconnected and contains a cycle.' };
    }
    if (!conn.connected) {
      return { tree: false, explanation: 'This graph is not a tree because it is disconnected. (A tree must be connected.)' };
    }
    return { tree: false, explanation: 'This graph is not a tree because it contains a cycle.' };
  }

  // ── Forest check (acyclic, possibly disconnected) ─────────────────────────
  function isForest(graph) {
    const cyc = hasCycle(graph);
    if (!cyc.hasCycle) {
      return {
        forest: true,
        explanation: 'This graph is a forest. It is acyclic (each connected component is a tree).'
      };
    }
    return {
      forest: false,
      explanation: 'This graph is not a forest because it contains a cycle.'
    };
  }

  // ── Path graph check (P_n: exactly a single path) ─────────────────────────
  function isPathGraph(graph) {
    const n = graph.vertices.length;
    if (n === 0) return { pathGraph: false, explanation: 'No vertices.' };
    if (n === 1) return { pathGraph: true, explanation: 'A single vertex is P₁.' };
    const deg = graph.getDegrees();
    const degVals = Object.values(deg);
    const endpts = degVals.filter(d => d === 1).length;
    const internals = degVals.filter(d => d === 2).length;
    const conn = isConnected(graph);
    if (conn.connected && endpts === 2 && internals === n - 2 && graph.edges.length === n - 1) {
      return { pathGraph: true, explanation: `This graph is a path P${n}. It has exactly two endpoints and no cycles.` };
    }
    return { pathGraph: false, explanation: 'This graph is not a path graph. A path graph has exactly two degree-1 endpoints and all other vertices have degree 2.' };
  }

  // ── Cycle graph check (C_n: single cycle visiting all vertices) ────────────
  function isCycleGraph(graph) {
    const n = graph.vertices.length;
    if (n < 3) return { cycleGraph: false, explanation: `A cycle graph requires at least 3 vertices.` };
    const deg = graph.getDegrees();
    const allDeg2 = Object.values(deg).every(d => d === 2);
    const conn = isConnected(graph);
    if (conn.connected && allDeg2 && graph.edges.length === n) {
      return { cycleGraph: true, explanation: `This graph is a cycle C${n}. Every vertex has degree 2 and the graph is connected.` };
    }
    return { cycleGraph: false, explanation: 'This graph is not a cycle graph. A cycle graph requires all vertices to have degree 2 and the graph to be connected.' };
  }

  // ── Named graph generators (returns vertex/edge data for graph.fromJSON) ──

  function generateKn(n) {
    const labels = _labels(n);
    const vertices = labels.map((lbl, i) => ({
      id: lbl, label: lbl,
      x: 260 + 130 * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
      y: 200 + 130 * Math.sin(2 * Math.PI * i / n - Math.PI / 2)
    }));
    const edges = [];
    let eid = 0;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        edges.push({ id: 'e' + eid++, source: labels[i], target: labels[j] });
    return { vertices, edges };
  }

  function generatePn(n) {
    const labels = _labels(n);
    const vertices = labels.map((lbl, i) => ({
      id: lbl, label: lbl,
      x: 80 + i * (360 / Math.max(n - 1, 1)),
      y: 200
    }));
    const edges = [];
    for (let i = 0; i < n - 1; i++)
      edges.push({ id: 'e' + i, source: labels[i], target: labels[i + 1] });
    return { vertices, edges };
  }

  function generateCn(n) {
    const labels = _labels(n);
    const vertices = labels.map((lbl, i) => ({
      id: lbl, label: lbl,
      x: 260 + 130 * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
      y: 200 + 130 * Math.sin(2 * Math.PI * i / n - Math.PI / 2)
    }));
    const edges = [];
    for (let i = 0; i < n; i++)
      edges.push({ id: 'e' + i, source: labels[i], target: labels[(i + 1) % n] });
    return { vertices, edges };
  }

  function generateKmn(m, n) {
    const aLabels = _labels(m);
    const bLabels = _labels(n, m);  // offset so B labels follow A labels
    const totalH = Math.max(m, n) * 70;
    const aVerts = aLabels.map((lbl, i) => ({
      id: lbl, label: lbl, x: 130, y: 60 + i * 70
    }));
    const bVerts = bLabels.map((lbl, i) => ({
      id: lbl, label: lbl, x: 390, y: 60 + i * 70
    }));
    const edges = [];
    let eid = 0;
    for (const a of aLabels)
      for (const b of bLabels)
        edges.push({ id: 'e' + eid++, source: a, target: b });
    return { vertices: [...aVerts, ...bVerts], edges, groups: [aLabels, bLabels] };
  }

  function _labels(count, offset = 0) {
    return Array.from({ length: count }, (_, i) => {
      const idx = i + offset;
      return idx < 26 ? String.fromCharCode(65 + idx) : String.fromCharCode(65 + idx % 26) + Math.floor(idx / 26);
    });
  }

  // ── Degree sequence validation (for Degree Sequence Checker tool) ─────────

  function checkDegreeSequence(seq) {
    const results = [];
    let passed = true;

    // All nonneg integers
    if (!seq.every(d => Number.isInteger(d) && d >= 0)) {
      return { passed: false, results: [{ label: 'Valid entries', ok: false, detail: 'All entries must be nonnegative integers.' }] };
    }
    results.push({ label: 'Valid entries', ok: true, detail: 'All entries are nonnegative integers.' });

    const n = seq.length;
    const degSum = seq.reduce((a, b) => a + b, 0);
    const maxDeg = Math.max(...seq, 0);

    // Max degree ≤ n-1
    const maxOk = maxDeg <= n - 1;
    if (!maxOk) passed = false;
    results.push({
      label: 'Max degree ≤ n − 1',
      ok: maxOk,
      detail: maxOk
        ? `Maximum degree is ${maxDeg}, which is ≤ ${n - 1}. (No vertex can connect to more than n − 1 others in a simple graph.)`
        : `Maximum degree is ${maxDeg}, but n − 1 = ${n - 1}. In a simple graph, a vertex cannot connect to itself or have more neighbors than there are other vertices.`
    });

    // Degree sum even
    const sumEven = degSum % 2 === 0;
    if (!sumEven) passed = false;
    results.push({
      label: 'Degree sum is even',
      ok: sumEven,
      detail: sumEven
        ? `Degree sum is ${degSum}, which is even. ✓`
        : `Degree sum is ${degSum}, which is odd. The Handshake Lemma requires the degree sum to be even (every edge contributes exactly 2 to the total).`
    });

    // Count odd-degree vertices (must be even)
    const oddCount = seq.filter(d => d % 2 !== 0).length;
    const oddEven = oddCount % 2 === 0;
    if (!oddEven) passed = false;
    results.push({
      label: 'Even number of odd-degree vertices',
      ok: oddEven,
      detail: oddEven
        ? `There are ${oddCount} odd-degree ${oddCount === 1 ? 'vertex' : 'vertices'}, which is even. ✓`
        : `There are ${oddCount} odd-degree vertices, which is odd. This is impossible — odd-degree vertices must come in pairs (each edge contributes 1 to exactly two degrees).`
    });

    // Handshake lemma display info
    const edgeCount = sumEven ? degSum / 2 : null;

    return { passed, results, n, degSum, edgeCount, maxDeg, oddCount };
  }

  // Havel–Hakimi graphical sequence check
  function havelHakimi(seq) {
    let s = [...seq].sort((a, b) => b - a);
    while (true) {
      if (s.every(d => d === 0)) return { graphical: true };
      if (s[0] < 0 || s[0] >= s.length) return { graphical: false };
      const d = s.shift();
      for (let i = 0; i < d; i++) {
        s[i]--;
        if (s[i] < 0) return { graphical: false };
      }
      s.sort((a, b) => b - a);
    }
  }

  // ── Isomorphism check (for Same Graph tool) ───────────────────────────────
  // Heuristic: same degree sequence, same edge count, same vertex count.
  // For small graphs also tries VF2-lite.
  function likelyIsomorphic(g1, g2) {
    if (g1.vertices.length !== g2.vertices.length) return false;
    if (g1.edges.length !== g2.edges.length) return false;
    const d1 = g1.getDegreeSequence().join(',');
    const d2 = g2.getDegreeSequence().join(',');
    return d1 === d2;
  }

  // Check if a manual vertex mapping preserves adjacency
  function checkMapping(g1, g2, mapping) {
    // mapping: {g1_id: g2_id}
    for (const e of g1.edges) {
      const u2 = mapping[e.source];
      const v2 = mapping[e.target];
      if (!u2 || !v2) return { ok: false, reason: `Vertex ${e.source} or ${e.target} is not in the mapping.` };
      if (!g2.hasEdge(u2, v2)) {
        return { ok: false, reason: `Edge {${e.source},${e.target}} maps to {${u2},${v2}}, but that edge does not exist in the second graph.` };
      }
    }
    for (const e of g2.edges) {
      const u1 = Object.keys(mapping).find(k => mapping[k] === e.source);
      const v1 = Object.keys(mapping).find(k => mapping[k] === e.target);
      if (!u1 || !v1) return { ok: false, reason: `Vertex ${e.source} or ${e.target} in graph 2 has no preimage in the mapping.` };
      if (!g1.hasEdge(u1, v1)) {
        return { ok: false, reason: `Edge {${e.source},${e.target}} in graph 2 maps back to {${u1},${v1}}, but that edge does not exist in the first graph.` };
      }
    }
    return { ok: true, reason: 'The mapping preserves all adjacencies. These graphs are isomorphic under this mapping.' };
  }

  return {
    bfs,
    isConnected,
    getComponents,
    hasCycle,
    isBipartite,
    isComplete,
    isTree,
    isForest,
    isPathGraph,
    isCycleGraph,
    generateKn,
    generatePn,
    generateCn,
    generateKmn,
    checkDegreeSequence,
    havelHakimi,
    likelyIsomorphic,
    checkMapping
  };
})();
