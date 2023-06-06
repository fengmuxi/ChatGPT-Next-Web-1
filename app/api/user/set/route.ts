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
    const name=req.nextUrl.searchParams.get("name")
    let body={
      nickName:name
    }
    let res=await fetch("https://eladmin.dwzynj.top/api/users/myCenter", {
        method: "PUT",
        headers:{
          "Content-Type":'application/json;charset=utf-8',
          "Authorization":token
        },
        body:JSON.stringify(body)
      })
      if(res.status==401){
        let msg={
          flag:false,
          msg:"未登录！"
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
