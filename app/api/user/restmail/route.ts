import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const mail=req.nextUrl.searchParams.get("mail")
    let res=await fetch("https://eladmin.dwzynj.top/api/code/email/resetPass?email="+mail, {
      method: "POST"
    })
    let msg=await res.json()
    // console.log(res.status)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[eladmin] ", e);
    return new Response(JSON.stringify(e));
  }
}
