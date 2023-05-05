export async function POST(req: Request) {
  try {
    let body = { message: await req.json() };

    console.log(JSON.stringify(body));
    let res = "";
    await fetch("http://47.94.237.159:8080/v1/wanjuan", {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
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
