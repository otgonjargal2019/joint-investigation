"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function login({ id, password }) {
  //   if (id !== "testuser" || password !== "1234") {
  //     return { error: "Invalid credentials" };
  //   }

  // ROLE:
  // 1. admin
  // 2. investigator
  // 3. manager

  const token = jwt.sign(
    { id: "crazy1000", role: "admin", name: "고광천" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const cookieStore = await cookies();

  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.set("access_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      headquarters: "침해 대응 본부",
      department: "온라인 보호부",
    };
  } catch (error) {
    return null;
  }
}
