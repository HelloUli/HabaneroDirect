import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "super_admin" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "super_admin" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "super_admin" | "admin";
  }
}
