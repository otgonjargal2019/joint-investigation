import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROLES } from "./shared/dictionary";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only block homepage
  if (pathname === "/") {
    const token = req.cookies.get("access_token")?.value;

    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role === ROLES.PLATFORM_ADMIN) {
          return NextResponse.redirect(
            new URL("/admin/account-management", req.url)
          );
        }

        if (payload.role === ROLES.COPYRIGHT_HOLDER) {
          return NextResponse.redirect(new URL("/notice", req.url));
        }
      } catch (err) {
        console.log("JWT verify error:", err.message);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // only homepage
};
