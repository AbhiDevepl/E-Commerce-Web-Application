import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    legacyOrderId: { type: Number, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true, index: true },
    websiteSessionId: { type: Number, index: true },
    legacyUserId: { type: Number, index: true },
    primaryProductId: { type: Number, index: true },
    itemsPurchased: { type: Number, min: 0 },
    priceUsd: { type: Number, min: 0 },
    cogsUsd: { type: Number, min: 0 },
  },
  { timestamps: true, collection: "orders" }
);

schema.index({ websiteSessionId: 1, createdAt: -1 });

export const MigrationOrder =
  mongoose.models.MigrationOrder || mongoose.model("MigrationOrder", schema);
