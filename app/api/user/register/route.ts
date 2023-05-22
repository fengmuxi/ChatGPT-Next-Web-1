import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const admin=process.env.ADMIN
    const key=process.env.KEY
    const user=req.nextUrl.searchParams.get("user")
    const password=req.nextUrl.searchParams.get("password")
    const name=req.nextUrl.searchParams.get("name")
    const mail=req.nextUrl.searchParams.get("mail")
    const code=req.nextUrl.searchParams.get("code")
    let res=await fetch("https://dujiaoka.dwzynj.top/main/api/user/register.php?admin="+admin+"&key="+key+"&user="+user+"&password="+password+"&name="+name+"&mail="+mail+"&code="+code, {
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
