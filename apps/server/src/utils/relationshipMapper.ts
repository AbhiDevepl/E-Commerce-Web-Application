export type Relationship = {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  cardinality: "many-to-one" | "one-to-many";
};

export const expectedRelationships: Relationship[] = [
  { fromTable: "order_items", fromField: "order_id", toTable: "orders", toField: "order_id", cardinality: "many-to-one" },
  { fromTable: "order_items", fromField: "product_id", toTable: "products", toField: "product_id", cardinality: "many-to-one" },
  { fromTable: "order_item_refunds", fromField: "order_item_id", toTable: "order_items", toField: "order_item_id", cardinality: "many-to-one" },
  { fromTable: "order_item_refunds", fromField: "order_id", toTable: "orders", toField: "order_id", cardinality: "many-to-one" },
  { fromTable: "orders", fromField: "website_session_id", toTable: "website_sessions", toField: "website_session_id", cardinality: "many-to-one" },
  { fromTable: "orders", fromField: "primary_product_id", toTable: "products", toField: "product_id", cardinality: "many-to-one" },
  { fromTable: "website_pageviews", fromField: "website_session_id", toTable: "website_sessions", toField: "website_session_id", cardinality: "many-to-one" },
];
