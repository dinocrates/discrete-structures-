/* graph-core.js — shared graph data model for CSIS-213 Unit 02 tools */

class Graph {
  constructor(options = {}) {
    this.vertices = [];        // [{id, label, x, y}]
    this.edges = [];           // [{id, source, target}]
    this.directed = options.directed ?? false;
    this.allowLoops = options.allowLoops ?? false;
    this.allowMultiEdges = options.allowMultiEdges ?? false;
    this._nextIdx = 0;
    this._nextEdgeIdx = 0;
  }

  // ── Label generation: A…Z, A1…Z1, A2… ──────────────────────────────────
  _nextLabel() {
    const i = this._nextIdx;
    const letter = String.fromCharCode(65 + (i % 26));
    const suffix = i < 26 ? '' : String(Math.floor(i / 26));
    return letter + suffix;
  }

  // Find the next label that isn't already in use
  _freshLabel() {
    let tries = 0;
    while (tries < 1000) {
      const lbl = this._nextLabel();
      this._nextIdx++;
      if (!this.vertices.some(v => v.label === lbl)) return lbl;
      tries++;
    }
    return 'V' + Date.now();
  }

  // ── Vertex operations ───────────────────────────────────────────────────
  addVertex(x = 200, y = 200, label = null) {
    const lbl = label ?? this._freshLabel();
    if (label) this._nextIdx++;
    const v = { id: lbl, label: lbl, x, y };
    this.vertices.push(v);
    return { vertex: v };
  }

  removeVertex(id) {
    this.vertices = this.vertices.filter(v => v.id !== id);
    this.edges = this.edges.filter(e => e.source !== id && e.target !== id);
  }

  moveVertex(id, x, y) {
    const v = this.vertices.find(v => v.id === id);
    if (v) { v.x = x; v.y = y; }
  }

  // ── Edge operations ─────────────────────────────────────────────────────
  addEdge(sourceId, targetId) {
    if (!this.vertices.some(v => v.id === sourceId)) return { error: 'unknown_source' };
    if (!this.vertices.some(v => v.id === targetId)) return { error: 'unknown_target' };
    if (sourceId === targetId && !this.allowLoops)  return { error: 'loop' };
    if (!this.allowMultiEdges && this.hasEdge(sourceId, targetId)) return { error: 'duplicate' };
    const id = 'e' + this._nextEdgeIdx++;
    const e = { id, source: sourceId, target: targetId };
    this.edges.push(e);
    return { edge: e };
  }

  removeEdge(id) {
    this.edges = this.edges.filter(e => e.id !== id);
  }

  hasEdge(u, v) {
    return this.edges.some(e =>
      (e.source === u && e.target === v) ||
      (!this.directed && e.source === v && e.target === u)
    );
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  clear() {
    this.vertices = [];
    this.edges = [];
    this._nextIdx = 0;
    this._nextEdgeIdx = 0;
  }

  // ── Computed properties ──────────────────────────────────────────────────
  getVertexSet() {
    return [...this.vertices.map(v => v.label)].sort();
  }

  getEdgeSet() {
    return this.edges.map(e => {
      if (!this.directed) {
        const pair = [e.source, e.target].sort();
        return '{' + pair[0] + ',' + pair[1] + '}';
      }
      return '(' + e.source + ',' + e.target + ')';
    });
  }

  getDegrees() {
    const deg = {};
    for (const v of this.vertices) deg[v.id] = 0;
    for (const e of this.edges) {
      deg[e.source] = (deg[e.source] || 0) + 1;
      if (!this.directed && e.source !== e.target) {
        deg[e.target] = (deg[e.target] || 0) + 1;
      }
    }
    return deg;   // {id: degree}
  }

  getDegreeSequence() {
    return Object.values(this.getDegrees()).sort((a, b) => b - a);
  }

  getAdjacencyList() {
    const adj = {};
    for (const v of this.vertices) adj[v.id] = [];
    for (const e of this.edges) {
      adj[e.source].push(e.target);
      if (!this.directed && e.source !== e.target) adj[e.target].push(e.source);
    }
    for (const k of Object.keys(adj)) adj[k].sort();
    return adj;   // {id: [neighbor_ids]}
  }

  getAdjacencyMatrix() {
    const ids = this.vertices.map(v => v.id);
    const mat = {};
    for (const u of ids) {
      mat[u] = {};
      for (const v of ids) mat[u][v] = 0;
    }
    for (const e of this.edges) {
      mat[e.source][e.target] = 1;
      if (!this.directed) mat[e.target][e.source] = 1;
    }
    return { ids, mat };
  }

  // Handshake Lemma: degreeSum should equal 2 * |E|
  getHandshakeInfo() {
    const deg = this.getDegrees();
    const degreeSum = Object.values(deg).reduce((a, b) => a + b, 0);
    const edgeCount = this.edges.length;
    const twice = 2 * edgeCount;
    return { degreeSum, edgeCount, twice, valid: degreeSum === twice };
  }

  // ── Load preset examples ─────────────────────────────────────────────────
  loadPreset(name) {
    this.clear();
    const cx = 280, cy = 200;
    switch (name) {
      case 'triangle': {
        this.addVertex(cx, cy - 100, 'A');
        this.addVertex(cx - 90, cy + 60, 'B');
        this.addVertex(cx + 90, cy + 60, 'C');
        this.addEdge('A', 'B'); this.addEdge('B', 'C'); this.addEdge('A', 'C');
        break;
      }
      case 'P4': {
        this.addVertex(cx - 135, cy, 'A');
        this.addVertex(cx - 45,  cy, 'B');
        this.addVertex(cx + 45,  cy, 'C');
        this.addVertex(cx + 135, cy, 'D');
        this.addEdge('A','B'); this.addEdge('B','C'); this.addEdge('C','D');
        break;
      }
      case 'C5': {
        for (let i = 0; i < 5; i++) {
          const angle = (2 * Math.PI * i / 5) - Math.PI / 2;
          const lbl = String.fromCharCode(65 + i);
          this.addVertex(cx + 110 * Math.cos(angle), cy + 110 * Math.sin(angle), lbl);
        }
        for (let i = 0; i < 5; i++) {
          const a = String.fromCharCode(65 + i);
          const b = String.fromCharCode(65 + (i + 1) % 5);
          this.addEdge(a, b);
        }
        break;
      }
      case 'K4': {
        const angles = [Math.PI * 3/2, Math.PI * 1/6, Math.PI * 5/6];
        const labels = ['A','B','C','D'];
        this.addVertex(cx, cy - 100, 'A');
        this.addVertex(cx - 100, cy + 60, 'B');
        this.addVertex(cx + 100, cy + 60, 'C');
        this.addVertex(cx, cy + 10, 'D');
        for (let i = 0; i < 4; i++)
          for (let j = i+1; j < 4; j++)
            this.addEdge(labels[i], labels[j]);
        break;
      }
      case 'disconnected': {
        this.addVertex(cx - 130, cy - 60, 'A');
        this.addVertex(cx - 40,  cy - 60, 'B');
        this.addVertex(cx + 50,  cy + 60, 'C');
        this.addVertex(cx + 140, cy + 60, 'D');
        this.addVertex(cx - 85,  cy + 80, 'E');
        this.addEdge('A','B');
        this.addEdge('C','D');
        break;
      }
      default:
        break; // empty
    }
  }

  // ── Serialize / clone ────────────────────────────────────────────────────
  toJSON() {
    return {
      vertices: JSON.parse(JSON.stringify(this.vertices)),
      edges: JSON.parse(JSON.stringify(this.edges)),
      directed: this.directed,
      allowLoops: this.allowLoops,
      allowMultiEdges: this.allowMultiEdges
    };
  }

  fromJSON(data) {
    this.vertices = data.vertices || [];
    this.edges = data.edges || [];
    this.directed = data.directed ?? false;
    this.allowLoops = data.allowLoops ?? false;
    this.allowMultiEdges = data.allowMultiEdges ?? false;
    this._nextIdx = this.vertices.length;
    this._nextEdgeIdx = this.edges.length;
  }
}
