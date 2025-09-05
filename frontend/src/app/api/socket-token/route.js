import { getSocketToken } from "@/app/actions/socket";

export async function GET() {
  const token = await getSocketToken();
  if (!token)
    return new Response(JSON.stringify({ socketToken: null }), { status: 401 });

  return new Response(JSON.stringify({ socketToken: token }), { status: 200 });
}
