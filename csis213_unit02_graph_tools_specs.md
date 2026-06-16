# CSIS-213 Unit 02 Interactive Graph Tools

**Design specifications for Levin, Chapter 2: Graph Theory**  
**Primary launch target:** Section 2.1, *Problems and Definitions*  
**Course:** CSIS-213 Discrete Structures  
**Instructor handoff purpose:** This document is intended for a coding agent or developer building the interactive graph tools for Unit 02.

---

## 1. Book Section Mapping

Levin 4th edition places **Graph Theory** in Chapter 2. The relevant chapter sections are:

| Levin Section | Topic | Tool/Demo Alignment |
|---|---|---|
| **2.1 Problems and Definitions** | Graphs, vertices, edges, adjacency, graph representations, degree sequence, connectedness, cycles, isomorphism, simple graphs, multigraphs, Handshake Lemma, bipartite graphs, complete bipartite graphs | **Graph Playground**, **Graph Representation Translator**, **Degree Sequence Checker**, **Königsberg Abstraction Tool**, **Same Graph or Different Graph?**, **Named Graph Builder**, early version of **Graph Property Detective** |
| **2.2 Trees** | Trees, forests, connected acyclic graphs, spanning trees, rooted trees | **Graph Property Detective**, **Named Graph Builder**, later **Tree/Spanning Tree Mode** |
| **2.3 Planar Graphs** | Planar graphs, Euler’s formula for planar graphs, non-planar graphs | Later extension of **Graph Property Detective**, possible **Planarity Tester**, **Named Graph Builder** using `K_5` and `K_{3,3}` |
| **2.4 Euler Trails and Circuits** | Euler paths, Euler circuits, bridge-style problems, odd/even degree conditions | **Königsberg Abstraction Tool**, **Degree Sequence Checker**, later **Euler Trail Visualizer** |
| **2.5 Coloring** | Vertex coloring, chromatic number, coloring problems | Later extension of **Graph Property Detective**, possible **Graph Coloring Tool** |
| **2.6 Relations and Graphs** | Relations represented with graphs | Later **Relation-to-Graph Tool**, extension of **Graph Representation Translator** |
| **2.7 Matching in Bipartite Graphs** | Bipartite matching, matchings, applied bipartite graph problems | Later **Bipartite Matching Tool**, extension of **Named Graph Builder** and **Graph Property Detective** |

### Recommended Mapping for Current Unit 02 Programs

For your current Unit 02 launch, the cleanest mapping is:

| Program/Demo | Primary Book Section | Secondary Book Section(s) | Why It Belongs There |
|---|---:|---:|---|
| **Graph Playground** | 2.1 | 2.2, 2.4, 2.5, 2.7 | This is the foundation. Students build graphs, see `V`, `E`, degrees, adjacency lists, adjacency matrices, and the Handshake Lemma. |
| **Graph Representation Translator** | 2.1 | 2.6 | Levin introduces adjacency lists and adjacency matrices in 2.1. This also prepares for relations-as-graphs in 2.6. |
| **Degree Sequence Checker** | 2.1 | 2.4 | Degree sequence and the Handshake Lemma are introduced in 2.1. Odd/even degree becomes important again in Euler trails and circuits. |
| **Königsberg Abstraction Tool** | 2.1 | 2.4 | 2.1 uses the bridge problem to introduce graph modeling. 2.4 returns to paths through graphs and Euler circuits. |
| **Same Graph or Different Graph?** | 2.1 | 2.3, 2.5 | 2.1 introduces graph isomorphism and the idea that a graph is structure, not just a drawing. This matters later for planar drawings and coloring. |
| **Graph Property Detective** | 2.1 | 2.2, 2.3, 2.4, 2.5, 2.7 | Start with connectedness, cycles, completeness, and bipartite checks for 2.1. Add tree, planar, Euler, coloring, and matching checks later. |
| **Named Graph Builder** | 2.1 | 2.3, 2.7 | 2.1 introduces named graph families such as complete graphs and complete bipartite graphs. `K_5` and `K_{3,3}` matter again in planarity. |

---

## 2. Implementation Priority List

The tools should be developed in this order so that later tools can reuse earlier code.

## Priority 0: Shared Infrastructure

Build this first before making individual tools.

### Required shared files

```text
/shared/graph-core.js
/shared/graph-renderer.js
/shared/graph-algorithms.js
/shared/graph-parsers.js
/shared/graph-style.css
```

### Required shared capabilities

- Store graph data.
- Add/remove vertices.
- Add/remove edges.
- Normalize undirected edges.
- Reject duplicate edges in simple graph mode.
- Reject loops in simple graph mode.
- Render graphs using SVG.
- Drag vertices.
- Select vertices and edges.
- Calculate degrees.
- Generate vertex set `V`.
- Generate edge set `E`.
- Generate adjacency list.
- Generate adjacency matrix.
- Calculate degree sequence.
- Verify the Handshake Lemma.

### Why this is priority 0

Almost every tool needs these capabilities. Do not build each tool as a separate one-off application unless absolutely necessary.

---

## Priority 1: Graph Playground

**Primary section:** Levin 2.1  
**Status:** Core tool. Build first.

### Why this is first

This is the main interactive tool for the unit. It introduces graphs as mathematical objects and gives students a visual way to inspect vertices, edges, degrees, adjacency lists, adjacency matrices, and the Handshake Lemma.

### Required features

- Add vertex.
- Add edge.
- Delete selected vertex or edge.
- Drag vertices.
- Clear graph.
- Load example graphs.
- Display vertex set.
- Display edge set.
- Display adjacency list.
- Display adjacency matrix.
- Display degree table.
- Display degree sequence.
- Display Handshake Lemma calculation.

### Minimum examples

- Empty graph.
- Triangle.
- Path `P_4`.
- Cycle `C_5`.
- Complete graph `K_4`.
- Disconnected graph.

### Stretch example

- Königsberg multigraph.

Because the Königsberg example requires multiple edges between the same vertices, it should either:

1. Use a special multigraph mode, or  
2. Be reserved for the separate Königsberg tool.

---

## Priority 2: Graph Representation Translator

**Primary section:** Levin 2.1  
**Secondary section:** Levin 2.6

### Purpose

Students enter a graph in one representation and the tool translates it into the others.

### Required input modes

1. Edge list.
2. Adjacency list.
3. Adjacency matrix.

### Required output modes

- Graph drawing.
- Vertex set.
- Edge set.
- Adjacency list.
- Adjacency matrix.
- Degree table.

### Recommended first parser

Start with a simple edge list parser.

Example accepted input:

```text
A B
A C
B C
C D
```

This should produce:

```text
V = {A, B, C, D}
E = {{A,B}, {A,C}, {B,C}, {C,D}}
```

### Required validation

- Matrix must be square.
- Matrix must contain only `0` and `1`.
- Undirected matrix must be symmetric.
- Simple graph matrix must have zeros on the diagonal.
- Duplicate edges should be ignored or warned about.
- Unknown vertices should produce a helpful error.

---

## Priority 3: Degree Sequence Checker

**Primary section:** Levin 2.1  
**Secondary section:** Levin 2.4

### Purpose

Students enter a degree sequence and test it against basic graph rules, especially the Handshake Lemma.

### Required features

Input example:

```text
3, 2, 2, 1
```

Output:

```text
Number of vertices: 4
Degree sum: 8
Possible number of edges: 4
Odd-degree vertices: 2
Handshake check: Passed
```

### Required checks

- All entries must be nonnegative integers.
- No degree can be larger than `n - 1` in a simple graph.
- Degree sum must be even.
- Number of odd-degree vertices must be even.

### Optional advanced check

Add a Havel-Hakimi graphical sequence check later.

This should be labeled as advanced because a sequence can pass the Handshake Lemma and still fail to be graphical.

---

## Priority 4: Named Graph Builder

**Primary section:** Levin 2.1  
**Secondary sections:** Levin 2.3 and 2.7

### Purpose

Students generate common graph families and observe their predictable structure.

### Required graph families

- Complete graph `K_n`.
- Path graph `P_n`.
- Cycle graph `C_n`.
- Complete bipartite graph `K_{m,n}`.

### Required outputs

For each graph:

- Graph drawing.
- Number of vertices.
- Number of edges.
- Degree sequence.
- Formula, when appropriate.
- Optional adjacency list.
- Optional adjacency matrix.

### Example output for `K_5`

```text
Vertices: 5
Edges: 10
Degree sequence: 4, 4, 4, 4, 4
Formula: n(n - 1) / 2 = 5(4) / 2 = 10
```

### Example output for `K_{2,3}`

```text
Vertices: 5
Edges: 6
Degree sequence: 3, 3, 2, 2, 2
Formula: m × n = 2 × 3 = 6
```

---

## Priority 5: Graph Property Detective

**Primary section:** Levin 2.1  
**Secondary sections:** Levin 2.2, 2.3, 2.4, 2.5, and 2.7

### Purpose

Students test graph definitions visually and computationally.

### Version 1 checks for 2.1

- Connected.
- Disconnected.
- Has a cycle.
- Complete.
- Bipartite.
- Path graph.
- Cycle graph.

### Version 2 checks for 2.2

- Tree.
- Forest.
- Spanning tree.
- Rooted tree display.

### Later checks

- Planar.
- Euler trail.
- Euler circuit.
- Vertex coloring.
- Bipartite matching.

### Required feedback style

Do not only say “Correct” or “Incorrect.” Explain why.

Example:

```text
This graph is not a tree because it contains a cycle.
```

Example:

```text
This graph is bipartite.
Group 1: A, C, E
Group 2: B, D
```

---

## Priority 6: Same Graph or Different Graph?

**Primary section:** Levin 2.1  
**Secondary sections:** Levin 2.3 and 2.5

### Purpose

Students compare two graph drawings and decide whether they are:

1. Exactly the same graph.
2. Isomorphic but labeled differently.
3. Different graphs.

### Required features

- Show two graph panels side by side.
- Allow vertex dragging in both panels.
- Ask students to classify the pair.
- Provide immediate feedback.
- Explain the answer using edge sets, degrees, connectedness, or explicit vertex mapping.

### Optional advanced feature

Manual relabeling checker:

```text
A -> X
B -> Y
C -> Z
```

The tool checks whether the mapping preserves adjacency.

### Important teaching idea

This tool should repeatedly reinforce:

```text
A graph is not the drawing. A graph is the relationship pattern.
```

---

## Priority 7: Königsberg Abstraction Tool

**Primary section:** Levin 2.1  
**Secondary section:** Levin 2.4

### Purpose

Students see how a real-world problem becomes a graph by abstracting away irrelevant details.

### Required features

- Simplified map view.
- Corresponding graph view.
- Click a land mass to highlight the matching vertex.
- Click a bridge to highlight the matching edge.
- Explanation panel showing what gets kept and what gets ignored.
- Degree table.
- Clear note that this example is a multigraph.

### Required explanation

```text
Land masses become vertices.
Bridges become edges.
The exact size or shape of the land does not matter.
The exact length or material of each bridge does not matter.
Only the connection pattern matters.
```

### Why this is lower priority

This is pedagogically excellent, but it is more custom and less reusable than the shared graph infrastructure. Build it after the general graph tools are working.

---

# 3. Shared Design Goals

## Audience

The primary audience is beginning discrete structures students, many of whom are also early computer science students. The tools should assume limited graph theory background but should connect naturally to computer science ideas such as data structures, arrays, lists, matrices, and algorithms.

## Tone

The tone should be friendly, visual, and explanatory. Avoid making the tools feel like advanced math software. The goal is to make graph theory feel inspectable and testable.

## Visual Style

Use a clean, readable layout:

- Light background.
- High-contrast text.
- Rounded panels.
- Minimal colors.
- Clear visual distinction between vertices, edges, selected items, warnings, and correct results.
- Responsive layout for Canvas pages.
- Avoid cluttered controls.

Suggested base layout:

```text
-----------------------------------------------------
| Tool title                                         |
| Short instructions                                |
-----------------------------------------------------
| Graph canvas / main interaction area              |
-----------------------------------------------------
| Controls              | Live graph information    |
|                        | V, E, degrees, feedback  |
-----------------------------------------------------
```

## Accessibility Requirements

Minimum requirements:

- Keyboard-accessible controls.
- High color contrast.
- Text labels for all buttons and inputs.
- Do not rely on color alone to communicate correctness.
- Include textual feedback for all visual highlights.
- Use readable font sizes.
- Make vertex labels visible.
- Provide reset buttons.
- Avoid drag-only interactions when possible; provide buttons or form inputs as alternatives.

## Recommended Technology

Each tool can be built as a standalone HTML/CSS/JavaScript page.

Recommended implementation stack:

- HTML.
- CSS.
- Vanilla JavaScript.
- SVG for graph drawing.
- No external dependencies unless needed.

SVG is recommended because it makes vertices, edges, labels, and highlights easier to manipulate.

---

# 4. Shared Graph Data Model

All graph tools should use a common internal graph model where possible.

```js
const graph = {
  vertices: [
    { id: "A", label: "A", x: 150, y: 100 },
    { id: "B", label: "B", x: 300, y: 100 }
  ],
  edges: [
    { id: "e1", source: "A", target: "B" }
  ],
  directed: false,
  allowLoops: false,
  allowMultipleEdges: false
};
```

For Levin 2.1, the default should be:

```js
directed: false,
allowLoops: false,
allowMultipleEdges: false
```

That means the tools begin with simple undirected graphs.

---

# 5. Shared Graph Rules

Unless a specific tool says otherwise:

- A vertex has a unique label.
- An edge connects two distinct vertices.
- No loops are allowed by default.
- No duplicate edges are allowed by default.
- Edge `{A, B}` is the same as edge `{B, A}`.
- Vertices may be dragged to improve the drawing.
- Moving a vertex changes the drawing but not the graph structure.

---

# 6. Shared Calculations

## Vertex Set

```text
V = {A, B, C, D}
```

## Edge Set

```text
E = {{A,B}, {A,C}, {B,C}, {C,D}}
```

## Degree of a Vertex

The degree of a vertex is the number of edges touching that vertex.

```text
deg(A) = 2
```

## Degree Sum

```text
degree sum = deg(A) + deg(B) + deg(C) + ...
```

## Handshake Lemma

For an undirected graph:

```text
sum of degrees = 2 × number of edges
```

The tool should show this as:

```text
Degree sum: 8
Number of edges: 4
2 × edges: 8
Handshake Lemma: 8 = 8 ✓
```

## Adjacency List

```text
A: B, C
B: A, C
C: A, B, D
D: C
```

## Adjacency Matrix

```text
    A B C D
A   0 1 1 0
B   1 0 1 0
C   1 1 0 1
D   0 0 1 0
```

---

# 7. Tool Specifications

## Tool 1: Graph Playground

### Purpose

The Graph Playground is the main interactive tool for Unit 02. Students use it to build a graph and immediately see the graph’s formal structure and properties.

### Learning Goals

Students should be able to:

- Identify vertices and edges.
- Build a simple undirected graph.
- Understand that a graph drawing is not the graph itself.
- Translate a drawing into vertex and edge sets.
- Compute vertex degrees.
- Verify the Handshake Lemma.
- See adjacency lists and adjacency matrices as graph representations.

### User Interface

Suggested layout:

```text
-------------------------------------------------------
| Graph Playground                                    |
| Build a graph and watch its structure update.       |
-------------------------------------------------------
|                                                     |
|                  SVG Graph Canvas                   |
|                                                     |
-------------------------------------------------------
| Controls                  | Graph Information       |
| Add Vertex                | V = {...}               |
| Add Edge                  | E = {...}               |
| Delete Selected           | Adjacency List          |
| Clear Graph               | Adjacency Matrix        |
| Load Example              | Degree Table            |
|                           | Handshake Lemma         |
-------------------------------------------------------
```

### Required Controls

#### Add Vertex

- Adds a new vertex with the next available label.
- Default labels should be uppercase letters: `A`, `B`, `C`, etc.
- After `Z`, continue with `A1`, `B1`, etc.

#### Add Edge

Interface:

```text
From: [A ▼] To: [B ▼] [Add Edge]
```

Behavior:

- Adds an undirected edge between two selected vertices.
- Rejects duplicate edges.
- Rejects loops unless loops are explicitly enabled later.

#### Delete Selected

- If a vertex is selected, delete the vertex and all incident edges.
- If an edge is selected, delete only that edge.

#### Clear Graph

- Removes all vertices and edges.
- Resets labels back to `A`.

#### Load Example

Dropdown options:

```text
Empty graph
Triangle
Path P4
Cycle C5
Complete graph K4
Disconnected graph
```

### Live Output Panels

Required panels:

- Vertex set.
- Edge set.
- Adjacency list.
- Adjacency matrix.
- Degree table.
- Degree sequence.
- Handshake Lemma.

### Validation Messages

Duplicate edge:

```text
That edge already exists. In a simple undirected graph, {A,B} and {B,A} are the same edge.
```

Loop attempt:

```text
Loops are turned off for this tool. Choose two different vertices.
```

Not enough vertices:

```text
Add at least two vertices before creating an edge.
```

---

## Tool 2: Graph Representation Translator

### Purpose

The Representation Translator helps students see that a graph can be represented in different forms: drawing, vertex/edge set, adjacency list, and adjacency matrix.

### Input Mode 1: Edge List

Example input:

```text
A B
A C
B C
C D
```

### Input Mode 2: Adjacency List

Example input:

```text
A: B, C
B: A, C
C: A, B, D
D: C
```

### Input Mode 3: Adjacency Matrix

Example input:

```text
Labels: A B C D

0 1 1 0
1 0 1 0
1 1 0 1
0 0 1 0
```

### Required Output

- Graph drawing.
- Vertex set.
- Edge set.
- Adjacency list.
- Adjacency matrix.
- Degree table.

### Error Messages

Matrix not square:

```text
This adjacency matrix is not square. A graph with n vertices needs an n × n matrix.
```

Matrix not symmetric:

```text
This matrix is not symmetric. For an undirected graph, row A column B must match row B column A.
```

Invalid edge:

```text
The edge {A,B} uses a vertex that is not listed in V.
```

Duplicate edge:

```text
Duplicate edges were ignored because this tool is using simple graphs.
```

---

## Tool 3: Degree Sequence and Handshake Lemma Checker

### Purpose

This tool allows students to enter a degree sequence and test whether it passes basic graph sanity checks.

### Input

```text
3, 2, 2, 1
```

### Output

```text
Number of vertices: 4
Degree sum: 8
Possible number of edges: 8 / 2 = 4
Odd-degree vertices: 2
Odd-degree count is even: Yes
Handshake check: Passed
```

### Required Checks

1. All degrees are nonnegative integers.
2. No degree is larger than `n - 1`.
3. Degree sum is even.
4. Number of odd-degree vertices is even.

### Optional Advanced Check

Use the Havel-Hakimi algorithm to determine whether the sequence is graphical.

---

## Tool 4: Königsberg Bridge Abstraction Tool

### Purpose

This tool introduces graph modeling by turning a real-world bridge problem into a graph.

The focus for 2.1 is abstraction. The full Euler path/circuit analysis belongs more naturally in 2.4.

### Layout

```text
-------------------------------------------------------
| Königsberg Bridge Abstraction                       |
-------------------------------------------------------
| Map View                    | Graph View             |
| land masses and bridges     | vertices and edges     |
-------------------------------------------------------
| Click a land mass or bridge to see its graph part.  |
-------------------------------------------------------
```

### Required Features

- Four land masses.
- Seven bridges.
- Four graph vertices.
- Seven graph edges.
- Multigraph support.
- Click map item to highlight graph item.
- Click graph item to highlight map item.
- Degree table.
- Explanation panel.

### Required Explanation Panel

```text
Land masses become vertices.
Bridges become edges.
The exact size or shape of the land does not matter.
The exact length or material of each bridge does not matter.
Only the connection pattern matters.
```

### Required Note

```text
This example is a multigraph because more than one bridge can connect the same pair of land masses.
```

---

## Tool 5: Same Graph or Different Graph?

### Purpose

This tool helps students distinguish between graph drawings and graph structure.

### Answer Types

Students classify two graphs as:

1. Exactly the same graph.
2. Isomorphic but labeled differently.
3. Different graphs.

### Required Features

- Two graph panels.
- Drag vertices in both panels.
- Multiple question presets.
- Student answer selection.
- Explanation panel.

### Optional Feature

Manual relabeling checker.

Example:

```text
A -> X
B -> Y
C -> Z
```

The tool checks whether edges are preserved under the mapping.

---

## Tool 6: Graph Property Detective

### Purpose

This tool lets students test graph definitions visually.

### Version 1 Properties

For 2.1:

- Connected.
- Disconnected.
- Has a cycle.
- Complete.
- Bipartite.
- Path graph.
- Cycle graph.

### Version 2 Properties

For 2.2:

- Tree.
- Forest.
- Spanning tree.

### Later Properties

For later sections:

- Planar.
- Euler trail.
- Euler circuit.
- Vertex coloring.
- Matching.

### Required Feedback

Example:

```text
This graph is connected. Starting from A, every vertex can be reached.
```

Example:

```text
This graph is not a tree because it contains a cycle.
```

Example:

```text
This graph is bipartite.
Group 1: A, C, E
Group 2: B, D
```

---

## Tool 7: Named Graph Builder

### Purpose

The Named Graph Builder helps students recognize common graph families.

### Required Graph Types

- `K_n`
- `P_n`
- `C_n`
- `K_{m,n}`

### Required Outputs

- Graph drawing.
- Number of vertices.
- Number of edges.
- Degree sequence.
- Formula.

### Complete Graph `K_n`

```text
Vertices: n
Edges: n(n - 1) / 2
Each vertex degree: n - 1
```

### Path Graph `P_n`

```text
Vertices: n
Edges: n - 1
```

For `n >= 2`, degree sequence:

```text
2 repeated n - 2 times, then 1, 1
```

### Cycle Graph `C_n`

```text
Vertices: n
Edges: n
Each vertex degree: 2
```

### Complete Bipartite Graph `K_{m,n}`

```text
Vertices: m + n
Edges: m × n
Each vertex in group A has degree n
Each vertex in group B has degree m
```

---

# 8. Combined Tool Suite Structure

## Landing Page

Title:

```text
CSIS-213 Graph Theory Tools
```

Subtitle:

```text
Interactive tools for Unit 02: Problems and Definitions
```

Tool cards:

```text
1. Graph Playground
Build a graph and inspect its structure.

2. Representation Translator
Convert between drawings, edge sets, adjacency lists, and matrices.

3. Degree Sequence Checker
Use the Handshake Lemma to test degree sequences.

4. Königsberg Abstraction
Turn a real-world bridge problem into a graph.

5. Same Graph or Different Graph?
Compare graph structure, labels, and drawings.

6. Graph Property Detective
Test connectedness, cycles, trees, completeness, and bipartiteness.

7. Named Graph Builder
Generate K_n, P_n, C_n, and K_{m,n}.
```

Each card should have:

```text
Open Tool
Open in New Window
```

---

# 9. Recommended File Structure

```text
graph-tools/
│
├── index.html
├── shared/
│   ├── graph-core.js
│   ├── graph-renderer.js
│   ├── graph-algorithms.js
│   ├── graph-parsers.js
│   └── graph-style.css
│
├── playground/
│   └── index.html
│
├── representation-translator/
│   └── index.html
│
├── degree-sequence/
│   └── index.html
│
├── konigsberg/
│   └── index.html
│
├── same-graph/
│   └── index.html
│
├── property-detective/
│   └── index.html
│
└── named-graphs/
    └── index.html
```

---

# 10. Shared Algorithms

## Degree Calculation

For each vertex:

```text
degree = number of incident edges
```

For a simple undirected graph:

```js
for each edge {u, v}:
  degree[u] += 1
  degree[v] += 1
```

## Degree Sequence

Sort degrees from largest to smallest.

```text
3, 2, 2, 1
```

## Handshake Lemma

```text
degreeSum = sum of all degrees
edgeCheck = 2 * numberOfEdges
degreeSum should equal edgeCheck
```

## Connectedness

Use BFS or DFS.

Process:

1. Pick a starting vertex.
2. Visit all reachable vertices.
3. If all vertices are visited, the graph is connected.
4. Otherwise, it is disconnected.

## Cycle Detection

Use DFS.

For undirected graphs:

- Track parent vertex.
- If a visited neighbor is not the parent, a cycle exists.

## Tree Check

A graph is a tree if:

```text
connected = true
hasCycle = false
```

Equivalent check for simple connected graphs:

```text
edges = vertices - 1
```

But the tool should explain using the definition:

```text
A tree is connected and has no cycles.
```

## Complete Graph Check

For `n` vertices, a complete graph has:

```text
n(n - 1) / 2 edges
```

The tool should also identify missing edges.

## Bipartite Check

Use BFS coloring.

Process:

1. Assign starting vertex to Group 1.
2. Assign all neighbors to Group 2.
3. Continue alternating groups.
4. If an edge connects two vertices in the same group, the graph is not bipartite.

---

# 11. Canvas Integration

Each tool should be embeddable using an iframe.

Example:

```html
<iframe
  src="https://dinocrates.github.io/cpp-interactive-tools/discrete/graph-tools/playground/"
  width="100%"
  height="860"
  frameborder="0"
  allowfullscreen>
</iframe>
```

Above each embedded tool, include an open-in-new-window link:

```html
<p>
  <a href="https://dinocrates.github.io/cpp-interactive-tools/discrete/graph-tools/playground/" target="_blank" rel="noopener">
    Open Graph Playground in a new window
  </a>
</p>
```

Recommended Canvas page pattern:

```html
<h2>Interactive Graph Tool</h2>

<p>
  Use this tool to build a graph and inspect its vertices, edges, degrees, adjacency list, and adjacency matrix.
</p>

<p>
  <a href="TOOL_URL" target="_blank" rel="noopener">
    Open this tool in a new window
  </a>
</p>

<iframe
  src="TOOL_URL"
  width="100%"
  height="860"
  frameborder="0"
  allowfullscreen>
</iframe>
```

---

# 12. Suggested Lecture Flow for Levin 2.1

Recommended order:

1. Start with **Königsberg Abstraction Tool**.  
   Core question: What details matter?

2. Move to **Graph Playground**.  
   Core idea: A graph is vertices and edges.

3. Use **Graph Representation Translator**.  
   Core idea: The same graph can be stored different ways.

4. Use **Degree Sequence Checker**.  
   Core idea: Some graphs are impossible before we even draw them.

5. Use **Named Graph Builder**.  
   Core idea: Some graph families have predictable patterns.

6. Use **Graph Property Detective**.  
   Core idea: Definitions are tests.

7. Use **Same Graph or Different Graph?**  
   Core idea: A graph is structure, not artwork.

---

# 13. Suggested Student Activity

After the lecture, students should complete a short activity:

```text
Build a graph with 5 vertices and 6 edges.
Record its vertex set.
Record its edge set.
Record its adjacency list.
Record its adjacency matrix.
List the degree of each vertex.
Verify the Handshake Lemma.
Determine whether the graph is connected.
Determine whether the graph is a tree.
```

This activity should use the Graph Playground directly.

---

# 14. Design Principle

The central idea of the entire suite should be:

```text
Graphs are structures we can build, represent, inspect, and test.
```

Every tool should reinforce that idea.

---

# 15. Source Notes for Developer

This specification assumes Levin 4th edition, where Chapter 2 is **Graph Theory** and section 2.1 is **Problems and Definitions**. In Levin 3rd edition, graph theory appears later, so use the 4th edition numbering for this Unit 02 build.

