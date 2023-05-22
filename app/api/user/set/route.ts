import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";

export async function GET(req: NextRequest) {
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
    const project=req.nextUrl.searchParams.get("project")
    const projectName=req.nextUrl.searchParams.get("projectName")
    const data=req.nextUrl.searchParams.get("data")
    let res=await fetch("https://dujiaoka.dwzynj.top/main/api/user/user_set.php?admin="+admin+"&key="+key+"&user="+user+"&project="+project+"&"+projectName+"="+data, {
        method: "GET",
        headers:{
          "token":token
        },
      })

    let msg=await res.json()
    // console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[shuixian] ", e);
    return new Response(JSON.stringify(e));
  }
}
