import jwt from "jsonwebtoken";

export const generateVaultToken = (userId) =>
  jwt.sign(
    {
      userId,
      scope: "vault"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30m"
    }
  );
