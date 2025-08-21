import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      index: true, // Add index for number-based queries
    },
    description: {
      type: String,
      required: false,
      index: true, // Add index for search
    },
    status: {
      type: String,
      required: true,
      index: true, // Add index for status filtering
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
TableSchema.index({ number: "text", description: "text" });
export default mongoose.model("Table", TableSchema);
