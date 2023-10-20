import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    dni: {
      type: String,
      required: true,
    },
    vote: {
      type: Boolean,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
    },
    message: {
      type: String,
    },
    affiliate: {
      type: Boolean,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Person", personSchema);
