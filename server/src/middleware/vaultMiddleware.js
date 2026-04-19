import jwt from "jsonwebtoken";

export const requireVaultAccess = (req, res, next) => {
  try {
    const vaultToken = req.headers["x-vault-token"];

    if (!vaultToken) {
      return res.status(401).json({ message: "Vault access token missing." });
    }

    const decoded = jwt.verify(vaultToken, process.env.JWT_SECRET);

    if (decoded.scope !== "vault" || decoded.userId !== String(req.user._id)) {
      return res.status(403).json({ message: "Vault access denied." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Vault session expired. Verify PIN again." });
  }
};
