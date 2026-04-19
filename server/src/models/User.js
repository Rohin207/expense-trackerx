import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 120
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    savingsBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    savingsGoal: {
      type: Number,
      default: 0,
      min: 0
    },
    vaultPin: {
      type: String,
      default: null
    },
    hasVault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
