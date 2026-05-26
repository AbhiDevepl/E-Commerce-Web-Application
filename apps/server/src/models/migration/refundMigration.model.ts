import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    legacyRefundId: { type: Number, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true, index: true },
    orderItemLegacyId: { type: Number, required: true, index: true },
    orderLegacyId: { type: Number, required: true, index: true },
    refundAmountUsd: { type: Number, min: 0, required: true },
  },
  { timestamps: true, collection: "refunds" }
);

schema.index({ orderItemLegacyId: 1, createdAt: 1 });

export const MigrationRefund =
  mongoose.models.MigrationRefund || mongoose.model("MigrationRefund", schema);
