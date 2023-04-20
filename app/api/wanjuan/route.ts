export async function POST(req: Request) {
  try {
    let token = process.env.WANJUAN_TOKEN;
    // let body = { message: await req.json() };
    let body = {"msgContent": await req.json(), "chatID": "104000676614877184"};

    console.log(JSON.stringify(body));
    let res = "";
    await fetch("https://insi.chat/v1/api/chat/msg?app_id=1009", {
      method: "POST",
      headers:{
        // "Authorization":"Bearer "+token
        "token": token
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data["statusInfo"]["code"] == 0) {
          // console.log("123123")
          res = data["data"]["msgContent"];
        } else {
          res = data["statusInfo"]["message"];
        }
      })
      .catch((err) => {
        console.error("[WanJuan] ", err);
        res = "出错了请重试！";
      });
    // console.log("12312"+res);
    return new Response(res);
  } catch (e) {
    console.error("[WanJuan] ", e);
    return new Response(JSON.stringify(e));
  }
}
