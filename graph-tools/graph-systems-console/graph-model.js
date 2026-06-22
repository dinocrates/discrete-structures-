(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GraphSystemsModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERTICES = [
    { id:'spawn', label:'Spawn', shortLabel:'S', x:130, y:360, color:'#067647' },
    { id:'armory', label:'Armory', shortLabel:'A', x:350, y:190, color:'#475467' },
    { id:'courtyard', label:'Courtyard', shortLabel:'C', x:500, y:410, color:'#175cd3' },
    { id:'tower', label:'Tower', shortLabel:'T', x:760, y:190, color:'#6938ef' },
    { id:'boss', label:'Boss', shortLabel:'B', x:880, y:490, color:'#b42318' }
  ];
  const EDGES = [
    { id:'e01', from:'spawn', to:'armory' },
    { id:'e02', from:'spawn', to:'courtyard' },
    { id:'e03', from:'armory', to:'courtyard' },
    { id:'e04', from:'courtyard', to:'tower' },
    { id:'e05', from:'courtyard', to:'boss' },
    { id:'e06', from:'tower', to:'boss' }
  ];
  const indexById = new Map(VERTICES.map((vertex, index) => [vertex.id, index]));

  function initialActiveIds() { return new Set(EDGES.map(edge => edge.id)); }

  // All representations derive from this fixed-order neighbor map.
  function adjacency(activeIds) {
    const result = new Map(VERTICES.map(vertex => [vertex.id, []]));
    for (const edge of EDGES) {
      if (!activeIds.has(edge.id)) continue;
      result.get(edge.from).push(edge.to);
      result.get(edge.to).push(edge.from);
    }
    for (const neighbors of result.values()) neighbors.sort((a, b) => indexById.get(a) - indexById.get(b));
    return result;
  }

  function matrixFrom(adjacencyList) {
    const matrix = VERTICES.map(() => VERTICES.map(() => 0));
    for (const vertex of VERTICES) {
      for (const neighbor of adjacencyList.get(vertex.id)) matrix[indexById.get(vertex.id)][indexById.get(neighbor)] = 1;
    }
    return matrix;
  }

  function componentsFrom(adjacencyList) {
    const visited = new Set();
    const components = [];
    for (const vertex of VERTICES) {
      if (visited.has(vertex.id)) continue;
      const component = [];
      const stack = [vertex.id];
      visited.add(vertex.id);
      while (stack.length) {
        const current = stack.pop();
        component.push(current);
        for (const neighbor of adjacencyList.get(current)) {
          if (!visited.has(neighbor)) { visited.add(neighbor); stack.push(neighbor); }
        }
      }
      component.sort((a, b) => indexById.get(a) - indexById.get(b));
      components.push(component);
    }
    return components;
  }

  function derive(activeIds) {
    const adjacencyList = adjacency(activeIds);
    const matrix = matrixFrom(adjacencyList);
    const degrees = VERTICES.map(vertex => adjacencyList.get(vertex.id).length);
    const degreeSequence = [...degrees].sort((a, b) => b - a);
    const degreeSum = degrees.reduce((sum, degree) => sum + degree, 0);
    const activeEdges = EDGES.filter(edge => activeIds.has(edge.id));
    const components = componentsFrom(adjacencyList);
    const rightSide = 2 * activeEdges.length;
    return {
      activeEdges, adjacencyList, matrix, degrees, degreeSequence, degreeSum, components,
      isConnected: components.length === 1,
      handshake: { leftSide:degreeSum, rightSide, verified:degreeSum === rightSide },
      isMinimalConnected: components.length === 1 && activeEdges.length === VERTICES.length - 1
    };
  }

  function createState() {
    let activeIds = initialActiveIds();
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
      undo() { if (!history.length) return false; activeIds = history.pop(); return true; },
      reset() { activeIds = initialActiveIds(); history.length = 0; }
    };
  }

  return { VERTICES, EDGES, initialActiveIds, adjacency, matrixFrom, componentsFrom, derive, createState };
});
