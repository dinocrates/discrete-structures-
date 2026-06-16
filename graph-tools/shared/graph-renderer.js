/* graph-renderer.js — SVG-based graph renderer for CSIS-213 Unit 02 tools */

class GraphRenderer {
  constructor(svgEl, graph, options = {}) {
    this.svg = svgEl;
    this.graph = graph;
    this.opts = {
      r: 22,                      // vertex circle radius
      onVertexClick: null,        // (vertexId) => void
      onEdgeClick: null,          // (edgeId) => void
      onGraphChange: null,        // () => void  — called after drag ends
      editable: true,             // allow drag
      ...options
    };
    this.selected = null;         // {type: 'vertex'|'edge', id}
    this._drag = null;            // active drag state
    this._setupSVGEvents();
  }

  // ── Public API ──────────────────────────────────────────────────────────

  render() {
    // Keep arrowhead defs if present
    const existingDefs = this.svg.querySelector('defs');
    this.svg.innerHTML = '';
    if (existingDefs) this.svg.appendChild(existingDefs);

    this._renderEdges();
    this._renderVertices();
  }

  select(type, id) {
    this.selected = id ? { type, id } : null;
    this.render();
  }

  clearSelection() {
    this.selected = null;
    this.render();
  }

  getSelected() {
    return this.selected;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  _renderEdges() {
    const { graph, svg, opts, selected } = this;
    for (const e of graph.edges) {
      const src = graph.vertices.find(v => v.id === e.source);
      const tgt = graph.vertices.find(v => v.id === e.target);
      if (!src || !tgt) continue;

      const isSelected = selected && selected.type === 'edge' && selected.id === e.id;

      // Offset parallel edges (multigraph) by checking edge count between same pair
      let dx = tgt.x - src.x, dy = tgt.y - src.y;
      const parallelIdx = this._parallelEdgeIndex(e);
      let x1 = src.x, y1 = src.y, x2 = tgt.x, y2 = tgt.y;
      let pathD;

      if (parallelIdx !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const offset = parallelIdx * 28;
        const mx = (x1 + x2) / 2 + nx * offset;
        const my = (y1 + y2) / 2 + ny * offset;
        pathD = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
      } else {
        pathD = `M${x1},${y1} L${x2},${y2}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', isSelected ? '#2563eb' : '#64748b');
      path.setAttribute('stroke-width', isSelected ? '3' : '2');
      path.setAttribute('stroke-linecap', 'round');
      path.dataset.edgeId = e.id;
      path.style.cursor = 'pointer';

      // Wider invisible hit area
      const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hitPath.setAttribute('d', pathD);
      hitPath.setAttribute('fill', 'none');
      hitPath.setAttribute('stroke', 'transparent');
      hitPath.setAttribute('stroke-width', '14');
      hitPath.dataset.edgeId = e.id;
      hitPath.style.cursor = 'pointer';

      svg.appendChild(path);
      svg.appendChild(hitPath);
    }
  }

  _parallelEdgeIndex(edge) {
    const { graph } = this;
    const u = edge.source, v = edge.target;
    const parallel = graph.edges.filter(e =>
      (e.source === u && e.target === v) ||
      (!graph.directed && e.source === v && e.target === u)
    );
    const idx = parallel.findIndex(e => e.id === edge.id);
    return idx - Math.floor(parallel.length / 2);
  }

  _renderVertices() {
    const { graph, svg, opts, selected } = this;
    for (const v of graph.vertices) {
      const isSelected = selected && selected.type === 'vertex' && selected.id === v.id;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.dataset.vertexId = v.id;
      g.style.cursor = opts.editable ? 'grab' : 'pointer';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', v.x);
      circle.setAttribute('cy', v.y);
      circle.setAttribute('r', opts.r);
      circle.setAttribute('fill', isSelected ? '#eff6ff' : '#ffffff');
      circle.setAttribute('stroke', isSelected ? '#2563eb' : '#334155');
      circle.setAttribute('stroke-width', isSelected ? '3' : '2');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', v.x);
      text.setAttribute('y', v.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', v.label.length > 2 ? '11' : '13');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', "ui-monospace,'Cascadia Code','Courier New',monospace");
      text.setAttribute('fill', isSelected ? '#2563eb' : '#0f172a');
      text.setAttribute('pointer-events', 'none');
      text.textContent = v.label;

      g.appendChild(circle);
      g.appendChild(text);
      svg.appendChild(g);
    }
  }

  // ── SVG-level event wiring ───────────────────────────────────────────────

  _setupSVGEvents() {
    const svg = this.svg;

    svg.addEventListener('mousedown', e => this._onMouseDown(e));
    svg.addEventListener('mousemove', e => this._onMouseMove(e));
    svg.addEventListener('mouseup',   e => this._onMouseUp(e));
    svg.addEventListener('mouseleave',e => this._onMouseUp(e));

    // Touch support
    svg.addEventListener('touchstart', e => {
      const t = e.touches[0];
      this._onMouseDown({ clientX: t.clientX, clientY: t.clientY, target: e.target, preventDefault: () => e.preventDefault() });
    }, { passive: false });
    svg.addEventListener('touchmove', e => {
      const t = e.touches[0];
      this._onMouseMove({ clientX: t.clientX, clientY: t.clientY });
      e.preventDefault();
    }, { passive: false });
    svg.addEventListener('touchend', e => this._onMouseUp({}));
  }

  _svgPoint(clientX, clientY) {
    const rect = this.svg.getBoundingClientRect();
    const scaleX = this.svg.viewBox.baseVal.width  / rect.width  || 1;
    const scaleY = this.svg.viewBox.baseVal.height / rect.height || 1;
    return {
      x: (clientX - rect.left)  * scaleX,
      y: (clientY - rect.top)   * scaleY
    };
  }

  _onMouseDown(e) {
    const target = e.target || e.srcElement;
    const vertexGroup = target.closest ? target.closest('[data-vertex-id]') : null;
    const edgeEl = target.closest ? target.closest('[data-edge-id]') : null;
    const pt = this._svgPoint(e.clientX, e.clientY);

    if (vertexGroup && this.opts.editable) {
      const vid = vertexGroup.dataset.vertexId;
      this._drag = { vertexId: vid, startX: pt.x, startY: pt.y, moved: false };
      this.select('vertex', vid);
      if (this.opts.onVertexClick) this.opts.onVertexClick(vid);
      e.preventDefault && e.preventDefault();
    } else if (edgeEl) {
      const eid = edgeEl.dataset.edgeId;
      this.select('edge', eid);
      if (this.opts.onEdgeClick) this.opts.onEdgeClick(eid);
    } else {
      this.clearSelection();
    }
  }

  _onMouseMove(e) {
    if (!this._drag) return;
    const pt = this._svgPoint(e.clientX, e.clientY);
    const dx = pt.x - this._drag.startX;
    const dy = pt.y - this._drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._drag.moved = true;
    if (this._drag.moved) {
      this.graph.moveVertex(this._drag.vertexId, pt.x, pt.y);
      this.render();
    }
  }

  _onMouseUp(e) {
    if (this._drag && this._drag.moved && this.opts.onGraphChange) {
      this.opts.onGraphChange();
    }
    this._drag = null;
  }
}
