// Simulates auth proxy layer (like WorkOS authkit in the real app)
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-proxy", "true");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|monitoring).*)"],
};
