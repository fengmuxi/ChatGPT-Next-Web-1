import { NextRequest } from "next/server";
import { getIP } from "../../auth";

export async function POST(req: NextRequest) {
  try {
    let res=await fetch("https://eladmin.dwzynj.top/auth/code", {
      method: "GET",
      headers:{
        "UserIp": String(getIP(req))
      }
    })
    let msg=await res.json()
    // console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[eladmin] ", e);
    return new Response(JSON.stringify(e));
  }
}
