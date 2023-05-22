import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token=req.headers.get("auth") ?? ""
    const admin=process.env.ADMIN
    const key=process.env.KEY
    const user=req.nextUrl.searchParams.get("user")
    let res=await fetch("https://dujiaoka.dwzynj.top/main/api/user/find_password.php?admin="+admin+"&key="+key+"&user="+user, {
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
