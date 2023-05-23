import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = auth(req);
    if (authResult.error) {
      return NextResponse.json(authResult, {
        status: 401,
      });
    }
    const token=req.headers.get("auth") ?? ""
    const admin=process.env.ADMIN
    const key=process.env.KEY
    const user=req.nextUrl.searchParams.get("user")
    const password=req.nextUrl.searchParams.get("password")
    let res=await fetch("https://dujiaoka.dwzynj.top/main/api/user/user_vip.php?admin="+admin+"&key="+key+"&user="+user+"&password="+password, {
      method: "GET",
      headers:{
        "token":token
      }
    })
    let msg=await res.json()
    console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[shuixian] ", e);
    return new Response(JSON.stringify(e));
  }
}
