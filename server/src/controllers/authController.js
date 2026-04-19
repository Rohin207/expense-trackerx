import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { encodeBase64 } from "../utils/base64.js";
import { generateToken } from "../utils/generateToken.js";
import {
  validateLoginInput,
  validateSignupInput
} from "../utils/validators.js";

export const signup = async (req, res) => {
  const validationError = validateSignupInput(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { name, email, age, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    age: Number(age),
    password: hashedPassword
  });

  return res.status(201).json({
    message: "Account created successfully.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      savingsBalance: user.savingsBalance,
      savingsGoal: user.savingsGoal,
      hasVault: user.hasVault,
      emailBase64: encodeBase64(user.email),
      createdAt: user.createdAt
    }
  });
};

export const login = async (req, res) => {
  const validationError = validateLoginInput(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    message: "Logged in successfully.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      savingsBalance: user.savingsBalance,
      savingsGoal: user.savingsGoal,
      hasVault: user.hasVault,
      emailBase64: encodeBase64(user.email),
      createdAt: user.createdAt
    }
  });
};
