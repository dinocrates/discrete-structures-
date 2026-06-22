'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { EDGES, initialActiveIds, connectivity, hasCycle, analyze, getHint, components, createHistory } = require('./graph-logic.js');

const set = (...ids) => new Set(ids);
const reference = set('e01', 'e02', 'e04', 'e05', 'e06', 'e08', 'e12');

test('initial graph is connected, cyclic, and not a spanning tree', () => {
  const result = analyze(initialActiveIds());
  assert.equal(result.isConnected, true);
  assert.equal(result.hasCycle, true);
  assert.equal(result.isSpanningTree, false);
  assert.equal(result.activeEdgeCount, 12);
});

test('reference solution is connected and acyclic', () => {
  assert.equal(connectivity(reference).isConnected, true);
  assert.equal(hasCycle(reference), false);
  assert.equal(analyze(reference).isSpanningTree, true);
});

test('disconnected acyclic graph is a forest, not a tree', () => {
  const forest = set('e01', 'e04', 'e08', 'e12', 'e02', 'e06');
  const result = analyze(forest);
  assert.equal(result.isConnected, false);
  assert.equal(result.hasCycle, false);
  assert.equal(result.isSpanningTree, false);
});

test('disconnected graph can still contain a cycle', () => {
  const cyclicComponent = set('e01', 'e02', 'e03', 'e04', 'e07', 'e05');
  const result = analyze(cyclicComponent);
  assert.equal(result.isConnected, false);
  assert.equal(result.hasCycle, true);
});

test('removing a bridge from a spanning tree disconnects it', () => {
  const withoutBridge = new Set(reference); withoutBridge.delete('e08');
  assert.equal(connectivity(withoutBridge).isConnected, false);
});

test('adding one inactive edge to a spanning tree creates a cycle', () => {
  const withExtra = new Set(reference); withExtra.add('e03');
  assert.equal(hasCycle(withExtra), true);
});

test('connected-state hint is safely removable', () => {
  const active = initialActiveIds();
  const hint = getHint(active);
  assert.ok(hint);
  const after = new Set(active); after.delete(hint.id);
  assert.equal(connectivity(after).isConnected, true);
});

test('disconnected-state hint joins separate components', () => {
  const active = new Set(reference); active.delete('e08');
  const byVertex = components(active);
  const hint = getHint(active);
  assert.ok(hint);
  assert.notEqual(byVertex.get(hint.from), byVertex.get(hint.to));
});

test('undo restores the prior active-edge set', () => {
  const history = createHistory();
  const before = [...history.activeIds].sort();
  history.toggle('e01'); history.toggle('e02');
  history.undo(); history.undo();
  assert.deepEqual([...history.activeIds].sort(), before);
});

test('reset restores all twelve original edges and clears history', () => {
  const history = createHistory(); history.toggle('e01'); history.toggle('e12'); history.reset();
  assert.deepEqual([...history.activeIds].sort(), EDGES.map(edge => edge.id).sort());
  assert.equal(history.canUndo, false);
});
