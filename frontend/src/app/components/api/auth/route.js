import { NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/tokenVerification";
import { getSession } from "next-auth/react";

const IS_RUNNING_IN_SPACE = process.env.IS_RUNNING_IN_SPACE === "true";
const HF_TOKEN = process.env.HF_TOKEN;

export async function middleware(request) {
  const session = await getSession({ req: request });

  if (HF_TOKEN) {
    try {
      await verifyToken(HF_TOKEN);
      return NextResponse.next();
    } catch (error) {
      console.error(`Failed to verify token: ${error}`);
      if (IS_RUNNING_IN_SPACE) {
        return NextResponse.redirect("/login");
      } else {
        return NextResponse.json(
          { error: "Invalid or expired token: HF_TOKEN" },
          { status: 401 }
        );
      }
    }
  }

  if (IS_RUNNING_IN_SPACE && session?.oauth_info) {
    try {
      await verifyToken(session.oauth_info.access_token);
      return NextResponse.next();
    } catch (error) {
      console.error(`Failed to verify token: ${error}`);
      return NextResponse.redirect("/login");
    }
  }

  if (IS_RUNNING_IN_SPACE) {
    return NextResponse.redirect("/login");
  }

  return NextResponse.json(
    { error: "Invalid or expired token" },
    { status: 401 }
  );
}

export const config = {
  matcher: ["/"], // Apply this middleware to the root path
};
