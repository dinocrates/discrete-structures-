(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PascalModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const POSITION_LABELS=[['A','Matchmaking'],['B','Chat'],['C','Trading'],['D','Parties'],['E','Replays'],['F','Anti-Cheat'],['G','Analytics'],['H','Voice'],['I','Spectator'],['J','Events']];
function buildPascal(maxN=10){const triangle=[];for(let n=0;n<=maxN;n++){const row=new Array(n+1).fill(1);for(let k=1;k<n;k++)row[k]=triangle[n-1][k-1]+triangle[n-1][k];triangle.push(row)}return triangle}const TRIANGLE=buildPascal(10);
function choose(n,k){if(!Number.isInteger(n)||!Number.isInteger(k)||n<0||n>10||k<0||k>n)throw new RangeError('C(n,k) requires 0 ≤ k ≤ n ≤ 10');return TRIANGLE[n][k]}
function combinations(n,k){if(k<0||k>n)return[];const out=[];function visit(start,current){if(current.length===k){out.push([...current]);return}for(let i=start;i<=n-(k-current.length);i++){current.push(i);visit(i+1,current);current.pop()}}visit(0,[]);return out}
function bitString(n,indices){const set=new Set(indices);return Array.from({length:n},(_,i)=>set.has(i)?'1':'0').join('')}
function complement(n,indices){const set=new Set(indices);return Array.from({length:n},(_,i)=>i).filter(i=>!set.has(i))}
function latticeMoves(n,indices){const set=new Set(indices);return Array.from({length:n},(_,i)=>set.has(i)?'U':'R')}
function visiblePower(variable,exponent){if(exponent===0)return'';return exponent===1?variable:`${variable}^${exponent}`}
function formatTerm(n,k){const coefficient=choose(n,k),vars=visiblePower('x',n-k)+visiblePower('y',k);return`${coefficient===1&&vars?'':coefficient}${vars}`||'1'}
function expansion(n){return TRIANGLE[n].map((_,k)=>formatTerm(n,k))}
function derive(n,k,selectedIndices){const coefficient=choose(n,k),rowValues=[...TRIANGLE[n]],comp=complement(n,selectedIndices);return{coefficient,parentLeft:k>0&&k<n?choose(n-1,k-1):null,parentRight:k>0&&k<n?choose(n-1,k):null,mirrorK:n-k,complementIndices:comp,rowValues,rowSum:rowValues.reduce((a,b)=>a+b,0),bitString:bitString(n,selectedIndices),subsetLabels:selectedIndices.map(i=>POSITION_LABELS[i][0]),latticeMoves:latticeMoves(n,selectedIndices),binomialTerm:{coefficient,xExponent:n-k,yExponent:k,visible:formatTerm(n,k)}}}
const PRESETS=[{id:'feature',title:'Feature Build',n:5,k:2,indices:[1,3]},{id:'server',title:'Test Server',n:7,k:3,indices:[0,2,5]},{id:'balanced',title:'Balanced Choice',n:6,k:3,indices:[0,2,4]},{id:'mirror',title:'Mirror Pair',n:8,k:3,indices:[0,3,6]},{id:'empty',title:'Empty Choice',n:0,k:0,indices:[]}];
function outcomeIndex(n,k,indices){return combinations(n,k).findIndex(c=>c.length===indices.length&&c.every((v,i)=>v===indices[i]))}
return{POSITION_LABELS,TRIANGLE,PRESETS,buildPascal,choose,combinations,bitString,complement,latticeMoves,formatTerm,expansion,derive,outcomeIndex};});
