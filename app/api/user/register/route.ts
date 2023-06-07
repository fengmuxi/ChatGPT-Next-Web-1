import { NextRequest } from "next/server";
import { getIP } from "../../auth";

export async function POST(req: NextRequest) {
  try {
    const user=req.nextUrl.searchParams.get("user")
    const mail=req.nextUrl.searchParams.get("mail")
    const password=req.nextUrl.searchParams.get("password")
    const name=req.nextUrl.searchParams.get("name")
    const code=req.nextUrl.searchParams.get("code")
    let body={
      "id": null,
      "username": user,
      "nickName": name,
      "password": password,
      "gender": "男",
      "email": mail,
      "enabled": "true",
      "roles": [
        {
          "id": 2
        }
      ],
      "jobs": [
        {
          "id": 8
        }
      ],
      "dept": {
        "id": 5
      }
    }
    let res=await fetch("https://eladmin.dwzynj.top/api/users/registerUser/"+code, {
      method: "POST",
      headers:{
        "Content-Type":'application/json',
        "UserIp": String(getIP(req))
      },
      body:JSON.stringify(body)
    })
    let msg=await res.json()
    return new Response(JSON.stringify(msg))
  } catch (e) {
    console.error("[eladmin] ", e);
    return new Response(JSON.stringify(e));
  }
}
