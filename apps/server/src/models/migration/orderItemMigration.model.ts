import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    legacyOrderItemId: { type: Number, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true, index: true },
    orderLegacyId: { type: Number, required: true, index: true },
    productLegacyId: { type: Number, required: true, index: true },
    isPrimaryItem: { type: Boolean, default: false },
    priceUsd: { type: Number, min: 0 },
    cogsUsd: { type: Number, min: 0 },
  },
  { timestamps: true, collection: "orderItems" }
);

schema.index({ orderLegacyId: 1, createdAt: 1 });
schema.index({ productLegacyId: 1 });

export const MigrationOrderItem =
  mongoose.models.MigrationOrderItem ||
  mongoose.model("MigrationOrderItem", schema);
