import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const admin=process.env.ADMIN
    const key=process.env.KEY
    const user=req.nextUrl.searchParams.get("user")
    const password=req.nextUrl.searchParams.get("password")
    let res=await fetch("https://dujiaoka.dwzynj.top/main/api/user/login.php?admin="+admin+"&key="+key+"&user="+user+"&password="+password, {
      method: "GET"
    })
    let msg=await res.json()
    // console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[shuixian] ", e);
    return new Response(JSON.stringify(e));
  }
}
