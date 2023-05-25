import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const admin=process.env.ADMIN
    const key=process.env.LOGIN_KEY
    const password=process.env.PASSWORD
    const formData = new FormData();
    formData.append("user",String(admin))
    formData.append("key",String(key))
    formData.append("password",String(password))
    let res=await fetch("https://dujiaoka.dwzynj.top/main/user/login.php?", {
      method: "POST",
      body:formData
    })
    let msg=await res.json()
    // console.log(msg)
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[shuixian] ", e);
    return new Response(JSON.stringify(e));
  }
}
