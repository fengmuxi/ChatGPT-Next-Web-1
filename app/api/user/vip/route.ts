import { NextRequest, NextResponse } from "next/server";
import { auth, getIP } from "../../auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = auth(req);
    if (authResult.error) {
      return NextResponse.json(authResult, {
        status: 401,
      });
    }
    const token=req.headers.get("auth") ?? ""
    let res=await fetch("https://eladmin.dwzynj.top/api/users/isVip", {
      method: "GET",
      headers:{
        "Authorization":token,
        "UserIp": String(getIP(req))
      }
    })
    // console.log(req.headers)
    if(res.status==401){
      let msg={
        flag:false,
        msg:"未登录！"
      }
    // console.log(res.status)
    return new Response(JSON.stringify(msg))
    }
    let msg=await res.json()
    console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[eladmin] ", e);
    return new Response(JSON.stringify(e));
  }
}
