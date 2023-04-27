import { BingChat} from "../../bing-chat/build/index";

export async function POST(req: Request) {
  try {
    let cookies = process.env.COOKIES;
    const api = new BingChat({
      cookie: cookies,
    });
    const res = await api.createImage(await req.json());
    console.log(res)
    return new Response();
  } catch (e) {
    console.error("[NewBing] ", e);
    return new Response(JSON.stringify(e));
  }
}
