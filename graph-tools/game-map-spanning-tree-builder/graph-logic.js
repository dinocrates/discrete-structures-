(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GameMapGraph = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERTICES = [
    { id: 'spawn', label: 'Spawn', x: 110, y: 360 },
    { id: 'armory', label: 'Armory', x: 300, y: 190 },
    { id: 'courtyard', label: 'Courtyard', x: 300, y: 520 },
    { id: 'forge', label: 'Forge', x: 520, y: 140 },
    { id: 'library', label: 'Library', x: 560, y: 360 },
    { id: 'watchtower', label: 'Watchtower', x: 520, y: 590 },
    { id: 'crystal_cave', label: 'Crystal Cave', x: 790, y: 190 },
    { id: 'boss_gate', label: 'Boss Gate', x: 840, y: 440 }
  ];

  const EDGE_DATA = [
    ['e01', 'spawn', 'armory'], ['e02', 'spawn', 'courtyard'],
    ['e03', 'armory', 'courtyard'], ['e04', 'armory', 'forge'],
    ['e05', 'courtyard', 'library'], ['e06', 'courtyard', 'watchtower'],
    ['e07', 'forge', 'library'], ['e08', 'forge', 'crystal_cave'],
    ['e09', 'library', 'crystal_cave'], ['e10', 'library', 'boss_gate'],
    ['e11', 'watchtower', 'boss_gate'], ['e12', 'crystal_cave', 'boss_gate']
  ];
  const EDGES = EDGE_DATA.map(([id, from, to]) => ({ id, from, to }));

  function initialActiveIds() { return new Set(EDGES.map(edge => edge.id)); }

  function adjacency(activeIds, excludedId) {
    const list = new Map(VERTICES.map(vertex => [vertex.id, []]));
    for (const edge of EDGES) {
      if (!activeIds.has(edge.id) || edge.id === excludedId) continue;
      list.get(edge.from).push(edge.to);
      list.get(edge.to).push(edge.from);
    }
    return list;
  }

  // Traverse only active routes from Spawn and retain unreachable room IDs.
  function connectivity(activeIds, excludedId) {
    const list = adjacency(activeIds, excludedId);
    const visited = new Set(['spawn']);
    const stack = ['spawn'];
    while (stack.length) {
      const current = stack.pop();
      for (const next of list.get(current)) {
        if (!visited.has(next)) { visited.add(next); stack.push(next); }
      }
    }
    const unreachable = VERTICES.map(vertex => vertex.id).filter(id => !visited.has(id));
    return { isConnected: unreachable.length === 0, visited, unreachable };
  }

  // Parent tracking is required because each undirected route appears twice.
  function hasCycle(activeIds) {
    const list = adjacency(activeIds);
    const visited = new Set();
    function visit(current, parent) {
      visited.add(current);
      for (const next of list.get(current)) {
        if (!visited.has(next)) { if (visit(next, current)) return true; }
        else if (next !== parent) return true;
      }
      return false;
    }
    return VERTICES.some(vertex => !visited.has(vertex.id) && visit(vertex.id, null));
  }

  function components(activeIds) {
    const list = adjacency(activeIds);
    const componentByVertex = new Map();
    let component = 0;
    for (const vertex of VERTICES) {
      if (componentByVertex.has(vertex.id)) continue;
      const stack = [vertex.id];
      componentByVertex.set(vertex.id, component);
      while (stack.length) {
        for (const next of list.get(stack.pop())) {
          if (!componentByVertex.has(next)) {
            componentByVertex.set(next, component);
            stack.push(next);
          }
        }
      }
      component += 1;
    }
    return componentByVertex;
  }

  function analyze(activeIds) {
    const connection = connectivity(activeIds);
    const cycle = hasCycle(activeIds);
    const activeEdgeCount = activeIds.size;
    return {
      activeEdgeCount,
      isConnected: connection.isConnected,
      unreachable: connection.unreachable,
      hasCycle: cycle,
      isSpanningTree: connection.isConnected && !cycle && activeEdgeCount === VERTICES.length - 1
    };
  }

  // Deterministic edge order keeps classroom demonstrations repeatable.
  function getHint(activeIds) {
    if (connectivity(activeIds).isConnected) {
      return EDGES.find(edge => activeIds.has(edge.id) && connectivity(activeIds, edge.id).isConnected) || null;
    }
    const component = components(activeIds);
    return EDGES.find(edge => !activeIds.has(edge.id) && component.get(edge.from) !== component.get(edge.to)) || null;
  }

  function createHistory(initialIds = initialActiveIds()) {
    let activeIds = new Set(initialIds);
    const history = [];
    return {
      get activeIds() { return new Set(activeIds); },
      get canUndo() { return history.length > 0; },
      toggle(id) {
        if (!EDGES.some(edge => edge.id === id)) return false;
        history.push(new Set(activeIds));
        activeIds.has(id) ? activeIds.delete(id) : activeIds.add(id);
        return true;
      },
      undo() {
        if (!history.length) return false;
        activeIds = history.pop();
        return true;
      },
      reset() { activeIds = initialActiveIds(); history.length = 0; }
    };
  }

  return { VERTICES, EDGES, initialActiveIds, adjacency, connectivity, hasCycle, components, analyze, getHint, createHistory };
});
