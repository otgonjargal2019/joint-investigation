"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getSocketToken() {
  const cookieStore = await cookies();
  const mainToken = cookieStore.get("access_token")?.value;
  if (!mainToken) return null;

  const decoded = jwt.verify(mainToken, process.env.JWT_SECRET);

  const socketToken = jwt.sign(
    { sub: decoded.sub },
    process.env.SOCKET_SECRET,
    { expiresIn: "60m" }
  );

  return socketToken;
}
