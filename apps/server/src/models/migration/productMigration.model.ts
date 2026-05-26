import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    legacyProductId: { type: Number, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true },
    productName: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true, collection: "products" }
);

schema.index({ createdAt: 1 });

export const MigrationProduct =
  mongoose.models.MigrationProduct || mongoose.model("MigrationProduct", schema);
