import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    logo: {
      type: String,
      required: true,
      trim: true
    },
    monthlyAmount: {
      type: Number,
      required: true,
      min: 0.01
    },
    startDate: {
      type: Date,
      required: true
    },
    nextBillingDate: {
      type: Date,
      required: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

subscriptionSchema.index({ userId: 1, isActive: 1, nextBillingDate: 1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
