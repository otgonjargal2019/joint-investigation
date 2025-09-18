import { logout } from "@/app/actions/auth";

export async function POST() {
  await logout();
  return new Response("Logged out", { status: 200 });
}
