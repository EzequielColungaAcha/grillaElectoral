import mongoose from 'mongoose';

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
      index: true, // Add index for search performance
    },
    vote: {
      type: Boolean,
      required: true,
      index: true, // Add index for filtering
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
      index: true, // Add index for filtering
    },
    referer: {
      type: String,
    },
    driver: {
      type: String,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
      index: true, // Add index for table-based queries
    },
    tableNumber: {
      type: Number,
      required: true,
      index: true, // Add index for table number filtering
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
personSchema.index({ tableNumber: 1, order: 1 }); // For sorting within tables
personSchema.index({ tableId: 1, vote: 1 }); // For vote counting per table
personSchema.index({ firstName: 'text', lastName: 'text', dni: 'text' }); // For text search
personSchema.index({ vote: 1, affiliate: 1 }); // For combined filtering

export default mongoose.model('Person', personSchema);
