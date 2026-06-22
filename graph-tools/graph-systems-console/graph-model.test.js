'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { VERTICES, EDGES, initialActiveIds, adjacency, derive, createState } = require('./graph-model.js');

const initialMatrix = [
  [0,1,1,0,0], [1,0,1,0,0], [1,1,0,1,1], [0,0,1,0,1], [0,0,1,1,0]
];

test('initial edge IDs and every initial representation match the specification', () => {
  const active = initialActiveIds(), model = derive(active);
  assert.deepEqual([...active], ['e01','e02','e03','e04','e05','e06']);
  assert.deepEqual(Object.fromEntries([...model.adjacencyList]), {
    spawn:['armory','courtyard'], armory:['spawn','courtyard'], courtyard:['spawn','armory','tower','boss'], tower:['courtyard','boss'], boss:['courtyard','tower']
  });
  assert.deepEqual(model.matrix, initialMatrix);
  assert.ok(model.matrix.every((row,i) => row.every((value,j) => value === model.matrix[j][i])));
  assert.deepEqual(model.degrees, [2,2,4,2,2]);
  assert.deepEqual(model.degreeSequence, [4,2,2,2,2]);
  assert.equal(model.components.length, 1);
});

test('disabling e02 changes exactly the two symmetric S-C cells', () => {
  const active=initialActiveIds(); active.delete('e02'); const matrix=derive(active).matrix;
  const changes=[];
  matrix.forEach((row,i)=>row.forEach((value,j)=>{if(value!==initialMatrix[i][j])changes.push([i,j,value]);}));
  assert.deepEqual(changes, [[0,2,0],[2,0,0]]);
});

test('disabling both Spawn routes isolates it and produces two components', () => {
  const active=initialActiveIds(); active.delete('e01'); active.delete('e02'); const model=derive(active);
  assert.equal(model.degrees[0],0); assert.equal(model.components.length,2); assert.deepEqual(model.components[0],['spawn']);
});

test('no active edges produces five isolated zero-degree vertices and a zero matrix', () => {
  const model=derive(new Set());
  assert.equal(model.components.length,5); assert.deepEqual(model.degrees,[0,0,0,0,0]);
  assert.ok(model.matrix.flat().every(value=>value===0));
});

test('all 64 possible edge subsets satisfy Handshake Lemma and sorted degrees', () => {
  for(let mask=0;mask<2**EDGES.length;mask++){
    const active=new Set(EDGES.filter((edge,index)=>mask&(1<<index)).map(edge=>edge.id)); const model=derive(active);
    assert.equal(model.degreeSum,2*active.size,`mask ${mask}`);
    assert.equal(model.handshake.verified,true,`mask ${mask}`);
    assert.deepEqual(model.degreeSequence,[...model.degreeSequence].sort((a,b)=>b-a),`mask ${mask}`);
  }
});

test('neighbor order is fixed regardless of Set insertion order', () => {
  const forwards=new Set(EDGES.map(edge=>edge.id)), backwards=new Set(EDGES.map(edge=>edge.id).reverse());
  assert.deepEqual(Object.fromEntries(adjacency(forwards)),Object.fromEntries(adjacency(backwards)));
});

test('undo restores the prior edge set and reset restores all routes', () => {
  const state=createState(), before=[...state.activeIds]; state.toggle('e01'); state.toggle('e06'); state.undo(); state.undo();
  assert.deepEqual([...state.activeIds],before); state.toggle('e03'); state.reset();
  assert.deepEqual([...state.activeIds],EDGES.map(edge=>edge.id)); assert.equal(state.canUndo,false);
});

test('minimal-connected accepts any connected four-edge state', () => {
  const first=derive(new Set(['e01','e02','e04','e05']));
  const second=derive(new Set(['e01','e03','e04','e06']));
  const disconnected=derive(new Set(['e01','e02','e03','e06']));
  assert.equal(first.isMinimalConnected,true); assert.equal(second.isMinimalConnected,true); assert.equal(disconnected.isMinimalConnected,false);
});
