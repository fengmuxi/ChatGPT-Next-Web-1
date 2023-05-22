import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const admin=process.env.ADMIN
    const key=process.env.KEY
    const user=req.nextUrl.searchParams.get("user")
    const mail=req.nextUrl.searchParams.get("mail")
    let res=await fetch("https://dujiaoka.dwzynj.top/main/api/user/code.php?admin="+admin+"&key="+key+"&user="+user+"&mail="+mail, {
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
