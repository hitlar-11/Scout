import { getAdminPassword, setAdminPassword } from "./db";

export const appRouter = {
  // Minimal login-like function to preserve existing behavior
  login: async (input: { password: string }) => {
    const crypto = require("crypto");
    const storedPassword = await getAdminPassword();
    if (!storedPassword) {
      return { success: false, message: "Admin password not configured" };
    }
    const inputHash = crypto.createHash("sha256").update(input.password).digest("hex");
    if (inputHash === storedPassword.passwordHash) {
      return { success: true, message: "Login successful" };
    }
    return { success: false, message: "Invalid password" };
  },

  // Minimal setPassword implementation — expects ctx with user id
  setPassword: async (
    ctx: { user: { id: number } },
    input: { password: string }
  ) => {
    const crypto = require("crypto");
    const passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");
    await setAdminPassword(passwordHash, ctx.user.id);
    return { success: true, message: "Password updated" };
  },
};

export type AppRouter = typeof appRouter;