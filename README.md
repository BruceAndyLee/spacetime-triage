Get a SpacetimeDB Vue app running in under 5 minutes.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [SpacetimeDB CLI](https://spacetimedb.com/install) installed

Install the [SpacetimeDB CLI](https://spacetimedb.com/install) before continuing.

---

## Create your project

Run the `spacetime dev` command to create a new project with a SpacetimeDB module and Vue client.

This will start the local SpacetimeDB server, publish your module, generate TypeScript bindings, and start the Vue development server.

```bash
spacetime dev --template vue-ts
```



## Open your app

Navigate to [http://localhost:5173](http://localhost:5173) to see your app running.

The template includes a basic Vue app connected to SpacetimeDB.



## Explore the project structure

Your project contains both server and client code.

Edit `spacetimedb/src/index.ts` to add tables and reducers. Edit `src/App.vue` to build your UI.

```
my-spacetime-app/
├── spacetimedb/          # Your SpacetimeDB module
│   └── src/
│       └── index.ts      # Server-side logic
├── src/                  # Vue frontend
│   ├── App.vue
│   └── module_bindings/  # Auto-generated types
└── package.json
```



## Call reducers & inspect state

add a tree
```bash
spacetime call plant_tree Entroponetophaea
```

Checkout the updated state of the db
```bash
spacetime sql "SELECT * from tree"
```

Iterate the growth of one of the nodes
```bash
spacetime call grow_tree_node 1 1
```

Checkout the updated state of the db
```bash
spacetime sql "SELECT * from node"
```
