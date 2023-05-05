import { OpenAIApi, Configuration } from "openai";
import { ChatImageRequest } from "../openai-image/typing";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";

export async function POST(req: NextRequest) {
  const authResult = auth(req);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }
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
    console.log("[Chat-image]" + response.data.data[0].url);
    return new Response(JSON.stringify(response.data));
  } catch (e) {
    console.error("[Chat-image] ", e);
    return new Response(JSON.stringify(e));
  }
}
