import { OpenAIApi, Configuration } from "openai";
import { ChatImageRequest } from "../chat/typing";

export async function POST(req: Request) {
  try {
    let apiKey = process.env.OPENAI_API_KEY;

    const userApiKey = req.headers.get("token");
    if (userApiKey) {
      apiKey = userApiKey;
      console.log("user api key:" + apiKey);
    }

    const openai = new OpenAIApi(
      new Configuration({
        apiKey,
      }),
    );

    const requestBody = (await req.json()) as ChatImageRequest;
    const response = await openai.createImage({
      ...requestBody,
    });
    console.log(response.data.data[0].url);
    return new Response(JSON.stringify(response.data));
  } catch (e) {
    console.error("[Chat] ", e);
    return new Response(JSON.stringify(e));
  }
}
