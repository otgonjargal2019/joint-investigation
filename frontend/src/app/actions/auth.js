"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  //console.log("getUserFromCookie function--->", token);

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      ...decoded,
      userId: decoded.sub,
    };
  } catch (error) {
    return null;
  }
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
