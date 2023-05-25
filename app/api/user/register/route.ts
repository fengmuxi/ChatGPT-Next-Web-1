import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const admin=process.env.ADMIN
    const token=process.env.SHUI_XIAN_TOKEN
    const user=req.nextUrl.searchParams.get("user")
    const password=req.nextUrl.searchParams.get("password")
    const name=req.nextUrl.searchParams.get("name")
    const formData = new FormData();
    formData.append("user",String(admin))
    formData.append("command","user_add")
    formData.append("api_user",String(user))
    formData.append("password",String(password))
    formData.append("name",String(name))
    let res=await fetch("https://dujiaoka.dwzynj.top/main/api/user/admin_user.php", {
      method: "POST",
      headers:{
        "token":String(token)
      },
      body:formData
    })
    let msg=await res.json()
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[shuixian] ", e);
    return new Response(JSON.stringify(e));
  }
}
