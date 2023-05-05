import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";

async function createStream(req: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch(
    "http://lemurchat.anfans.cn/api/chat/conversation-trial",
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: req.body,
    },
  );

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          if (event.id == "1") {
            let text1 = data.slice(data.indexOf("content"));
            const text = text1.slice(12, text1.indexOf("index") - 6);
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            return;
          }
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          try {
            const json = JSON.parse(data);
            // console.log(data.indexOf("content"))
            if (data.indexOf("content") == -1) {
              controller.close();
              return;
            }
            // console.log(event.data)
            const text = JSON.parse(json.data.slice(5)).choices[0].delta
              .content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
}

export async function POST(req: NextRequest) {
  try {
    const stream = await createStream(req);
    return new Response(stream);
  } catch (error) {
    console.error("[Chat Stream]", error);
  }
}

export const config = {
  runtime: "edge",
};
