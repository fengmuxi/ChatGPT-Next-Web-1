import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let res=await fetch("https://eladmin.dwzynj.top/auth/code", {
      method: "GET"
    })
    let msg=await res.json()
    // console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[eladmin] ", e);
    return new Response(JSON.stringify(e));
  }
}
