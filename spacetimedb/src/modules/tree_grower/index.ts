import { schema, table, t } from 'spacetimedb/server';

const TreeNodeType = t.enum("TreeNodeType", {
  root: t.u8(),
  knot: t.u8(),
  leaf: t.u8(),
})

const trees_db = schema({
  tree: table(
    { name: "tree", public: true },
    {
      id: t.u32().primaryKey().autoInc(),
      name: t.string(),
      // depth: t.i32(),
      // width: t.i32(),
      // nodes_count: t.i32(),
    },
  ),
  node: table(
    { name: "node", public: true },
    {
      tree_id: t.u32(),
      node_id: t.u64().primaryKey().autoInc().index("btree"),
      type: TreeNodeType,
      parent_node_id: t.u64().optional(),
    },
  ),
});

export default trees_db;


type TreeNode = typeof trees_db.schemaType.tables.node.rowType;
interface Growable {
  type: NodeType,
};
 
type _DEF_REC = Record<string, string | number>;
type NodeType = "knot" | "root" | "leaf";
type WeightedRule = Partial<Record<NodeType, number>>;
type HereditaryRules = Record<
  NodeType,
  NodeType[] | WeightedRule
  >;

const CHILDREN_PER_NODE = 5;
const _tree_node_rules: HereditaryRules = {
  root: ["knot"],
  knot: {
    knot: 0.8,
    leaf: 0.2,
  },
  leaf: [],
};

const __invert_obj = (o: _DEF_REC) => Object.fromEntries(
    Object.entries(o)
      .map(([k, v]) => [v, k])
  ) as _DEF_REC;

const __fE = Object.fromEntries;
const _unpack_tree_growing_rule = (raw_rule: HereditaryRules[NodeType]): RuleBuckets => {
  if (raw_rule instanceof Array) {
    if (raw_rule.length === 0) {
      return {};
    }
    const probability = 1 / (raw_rule.length - 1);
    return __fE(
      raw_rule.map((tree_node_type, idx) => [probability * (idx + 1), tree_node_type])
    );
  }

  if (raw_rule instanceof Object) {
    return __invert_obj(raw_rule) as RuleBuckets;
  }
  throw new Error(`_unpack_tree_growing_rule() unsupported rule: ${raw_rule}`);
}

let __random: (() => number) | null = null;
const __k = Object.keys;
const __pf = Number.parseFloat;
type RuleBuckets = Record<string, NodeType>;
const _gen_nodes_stochastically = (rule: RuleBuckets): Growable[] => {
  return Array.from({ length: CHILDREN_PER_NODE })
    .map(() => {
      const dice = __random!();
      for (const k in rule) {
        if (Number.parseFloat(k) < dice) {
          return {
            type: rule[k]
          }
        }
      }
      const highest_bucket_key = __k(rule).sort((a, b) => __pf(b) - __pf(a))[0] + "";
      return {
        type: rule[highest_bucket_key]!,
      }
    });
};

const _generate_new_nodes = (node: Growable, rules: HereditaryRules): Growable[] => {
  const rule = _unpack_tree_growing_rule(rules[node.type]);
  const new_nodes = _gen_nodes_stochastically(rule);
  return new_nodes;
};


export const grow_tree_node = trees_db.reducer(
  { tree_id: t.u32(), node_id: t.u64() },
  (ctx, { tree_id, node_id }) => {
    __random = ctx.random;
    const node = ctx.db.node.node_id.find(node_id);
    if (!node) {
      throw new Error(`grow_tree_node reducer: no such node ${node_id}`);
    }
    type a = TreeNode extends Growable ? true : never;
    const new_nodes = _generate_new_nodes({ type: node.type.tag }, _tree_node_rules)
      .map((n) => ({
        tree_id: node.tree_id,
        node_id: 0n,
        parent_node_id: node.node_id,
        type: { tag: n.type, value: 0 },
        
      }));

    for (const node of new_nodes) {
      ctx.db.node.insert(node);
    }
  }
)

export const plant_tree = trees_db.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    const new_tree = ctx.db.tree.insert({
      id: 0,
      name,
    });
    ctx.db.node.insert({
      node_id: 0n,
      tree_id: new_tree.id,
      type: { tag: "root", value: 0 },
      parent_node_id: undefined,
    })
  },
)