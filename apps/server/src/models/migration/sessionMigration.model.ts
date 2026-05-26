import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    legacySessionId: { type: Number, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true, index: true },
    legacyUserId: { type: Number, index: true },
    isRepeatSession: { type: Boolean, default: false },
    utmSource: { type: String, default: null, index: true },
    utmCampaign: { type: String, default: null, index: true },
    utmContent: { type: String, default: null },
    deviceType: { type: String, enum: ["mobile", "desktop", "other"], default: "other", index: true },
    httpReferer: { type: String, default: null },
  },
  { timestamps: true, collection: "sessions" }
);

schema.index({ utmSource: 1, utmCampaign: 1, createdAt: -1 });

export const MigrationSession =
  mongoose.models.MigrationSession || mongoose.model("MigrationSession", schema);
