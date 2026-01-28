import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "tekaba-auth";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === "authenticated";
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function verifyPassword(password: string): boolean {
  const correctPassword = process.env.DASHBOARD_PASSWORD;
  if (!correctPassword) {
    console.error("DASHBOARD_PASSWORD is not set");
    return false;
  }
  return password === correctPassword;
}
