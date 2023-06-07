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
    let res=await fetch("https://eladmin.dwzynj.top/api/users/updatePass", {
        method: "POST",
        headers:{
          "Content-Type":'application/json;charset=utf-8',
          "Authorization":token,
          "UserIp": String(getIP(req))
        },
        body:JSON.stringify(await req.json())
      })
      if(res.status==401){
        let msg={
          flag:false,
          message:"未登录！"
        }
      // console.log(res.status)
      return new Response(JSON.stringify(msg))
      }
    let msg=await res.json()
    // console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[eladmin] ", e);
    return new Response(JSON.stringify(e));
  }
}
