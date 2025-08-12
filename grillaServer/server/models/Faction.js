import mongoose from "mongoose";

const factionSchema = new mongoose.Schema(
  {
    configId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FactionConfig",
      required: true,
    },
    votes: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
    },
    seats: {
      type: Number,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Faction", factionSchema);
