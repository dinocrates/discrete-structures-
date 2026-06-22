'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {LEVELS,cloneGeometry,segmentIntersection,analyzeLayout,createGeometryHistory,validateProof,topologySignature}=require('./planarity-model.js');
const fs=require('node:fs'),path=require('node:path');
const byId=id=>LEVELS.find(level=>level.id===id);
const geometry=(level,positions,bends={})=>({vertexPositions:positions,edgeBends:Object.fromEntries(level.edges.map(e=>[e.id,bends[e.id]||[]]))});

test('all five topology facts and connectivity are correct',()=>{
 const expected={"crossed-k4":[4,6],k23:[5,6],cube:[8,12],k5:[5,10],k33:[6,9]};
 for(const level of LEVELS){assert.deepEqual([level.vertices.length,level.edges.length],expected[level.id]);const seen=new Set([level.vertices[0].id]);let changed=true;while(changed){changed=false;for(const e of level.edges)if(seen.has(e.from)&&!seen.has(e.to)){seen.add(e.to);changed=true;}else if(seen.has(e.to)&&!seen.has(e.from)){seen.add(e.from);changed=true;}}assert.equal(seen.size,level.vertices.length);}
});
test('geometry changes never mutate topology',()=>{const level=byId('crossed-k4'),before=topologySignature(level),g=cloneGeometry(level.initialGeometry);g.vertexPositions.A.x+=100;g.edgeBends.AB.push({x:300,y:300});assert.equal(topologySignature(level),before);});
test('segment intersection classifies proper, parallel, overlap, and endpoint touch',()=>{
 assert.equal(segmentIntersection({x:0,y:0},{x:10,y:10},{x:0,y:10},{x:10,y:0}).type,'proper');
 assert.equal(segmentIntersection({x:0,y:0},{x:10,y:0},{x:0,y:2},{x:10,y:2}),null);
 assert.equal(segmentIntersection({x:0,y:0},{x:10,y:0},{x:4,y:0},{x:14,y:0}).type,'overlap');
 assert.equal(segmentIntersection({x:0,y:0},{x:10,y:0},{x:10,y:0},{x:10,y:10}).type,'touch');
});
test('shared graph endpoints are ignored but nonincident endpoint contacts conflict',()=>{const level={vertices:[...['A','B','C','D'].map(id=>({id}))],edges:[{id:'AB',from:'A',to:'B'},{id:'AC',from:'A',to:'C'},{id:'CD',from:'C',to:'D'}]};let g=geometry(level,{A:{x:100,y:100},B:{x:300,y:100},C:{x:100,y:300},D:{x:300,y:100}});let r=analyzeLayout(level,g);assert.equal(r.crossingCount,0);assert.equal(r.endpointConflicts.length,1);});
test('route through a nonincident vertex is rejected',()=>{const level={vertices:[...['A','B','C'].map(id=>({id}))],edges:[{id:'AB',from:'A',to:'B'}]};const r=analyzeLayout(level,geometry(level,{A:{x:100,y:100},B:{x:500,y:100},C:{x:300,y:100}}));assert.equal(r.vertexEdgeConflicts.length,1);assert.equal(r.layoutIsValid,false);});
test('near shared endpoints behave consistently and duplicate bend crossings deduplicate',()=>{const level={vertices:[...['A','B','C','D'].map(id=>({id}))],edges:[{id:'AB',from:'A',to:'B'},{id:'CD',from:'C',to:'D'}]};const g=geometry(level,{A:{x:100,y:300},B:{x:500,y:300},C:{x:300,y:100},D:{x:300,y:500}},{AB:[{x:300,y:300}]});assert.equal(analyzeLayout(level,g).crossingCount,1);});
test('specified initial layouts have exact crossing counts',()=>{assert.equal(analyzeLayout(byId('crossed-k4'),byId('crossed-k4').initialGeometry).crossingCount,1);assert.equal(analyzeLayout(byId('k23'),byId('k23').initialGeometry).crossingCount,3);assert.equal(analyzeLayout(byId('k5'),byId('k5').initialGeometry).crossingCount,5);assert.equal(analyzeLayout(byId('k33'),byId('k33').initialGeometry).crossingCount,9);assert.ok(analyzeLayout(byId('cube'),byId('cube').initialGeometry).crossingCount>=1);});
test('known planar embeddings have zero crossings and valid Euler values',()=>{
 const k4=byId('crossed-k4'),g4=geometry(k4,{A:{x:200,y:500},B:{x:500,y:100},C:{x:800,y:500},D:{x:500,y:350}});
 const k23=byId('k23'),g23=geometry(k23,{A:{x:180,y:325},B:{x:820,y:325},1:{x:500,y:120},2:{x:500,y:325},3:{x:500,y:530}});
 const cube=byId('cube'),gc=geometry(cube,{A:{x:120,y:100},B:{x:880,y:100},C:{x:880,y:550},D:{x:120,y:550},E:{x:350,y:230},F:{x:650,y:230},G:{x:650,y:420},H:{x:350,y:420}});
 for(const [level,g,faces] of [[k4,g4,4],[k23,g23,3],[cube,gc,6]]){const r=analyzeLayout(level,g);assert.equal(r.crossingCount,0,level.id);assert.equal(r.layoutIsValid,true,level.id);assert.equal(2-level.vertices.length+level.edges.length,faces);assert.equal(level.vertices.length-level.edges.length+faces,2);}
});
test('history commits one snapshot and restores vertex and bend coordinates',()=>{const level=byId('crossed-k4'),h=createGeometryHistory(level.initialGeometry),moved=h.geometry;moved.vertexPositions.A.x+=25;h.commit(moved);const bent=h.geometry;bent.edgeBends.AB=[{x:400,y:80}];h.commit(bent);assert.deepEqual(h.geometry.edgeBends.AB,[{x:400,y:80}]);h.undo();assert.deepEqual(h.geometry.edgeBends.AB,[]);h.undo();assert.deepEqual(h.geometry,level.initialGeometry);h.redo();assert.equal(h.geometry.vertexPositions.A.x,moved.vertexPositions.A.x);h.reset();assert.deepEqual(h.geometry,level.initialGeometry);});
test('proof validators require complete correct contradiction sequences',()=>{assert.equal(validateProof('k5',{faces:7,minBoundary:3,reason:'simple',required:21,available:20,inequality:'no',conclusion:'nonplanar'}).valid,true);assert.equal(validateProof('k5',{faces:7,minBoundary:3,reason:'simple',required:20,available:20,inequality:'no',conclusion:'nonplanar'}).step,'required');assert.equal(validateProof('k33',{faces:5,minBoundary:4,reason:'bipartite',required:20,available:18,inequality:'no',conclusion:'nonplanar'}).valid,true);assert.equal(validateProof('k33',{faces:5,minBoundary:3,reason:'simple',required:15,available:18,inequality:'yes',conclusion:'planar'}).step,'minBoundary');});
test('inline interface script parses successfully',()=>{const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(Boolean);assert.doesNotThrow(()=>new Function(scripts.at(-1)));});
