import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    legacyPageviewId: { type: Number, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true, index: true },
    sessionLegacyId: { type: Number, required: true, index: true },
    pageviewUrl: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true, collection: "pageviews" }
);

schema.index({ sessionLegacyId: 1, createdAt: 1 });

export const MigrationPageview =
  mongoose.models.MigrationPageview ||
  mongoose.model("MigrationPageview", schema);
