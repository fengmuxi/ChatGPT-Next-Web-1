// import { createParser } from "eventsource-parser";
// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "../auth";

// async function createStream(req: NextRequest) {
//   const authResult = auth(req);
//   if (authResult.error) {
//     return authResult.msg;
//   }
//   const encoder = new TextEncoder();
//   const decoder = new TextDecoder();

//   const res = await fetch(
//     "http://lemurchat.anfans.cn/api/chat/conversation-trial",
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//       method: "POST",
//       body: req.body,
//     },
//   );

//   const stream = new ReadableStream({
//     async start(controller) {
//       function onParse(event: any) {
//         if (event.type === "event") {
//           const data = event.data;
//           if (event.id == "1") {
//             let text1 = data.slice(data.indexOf("content"));
//             const text = text1.slice(12, text1.indexOf("index") - 6);
//             const queue = encoder.encode(text);
//             controller.enqueue(queue);
//             return;
//           }
//           // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
//           try {
//             const json = JSON.parse(data);
//             // console.log(data.indexOf("content"))
//             if (data.indexOf("content") == -1) {
//               controller.close();
//               return;
//             }
//             // console.log(event.data)
//             const text = JSON.parse(json.data.slice(5)).choices[0].delta
//               .content;
//             const queue = encoder.encode(text);
//             controller.enqueue(queue);
//           } catch (e) {
//             controller.error(e);
//           }
//         }
//       }

//       const parser = createParser(onParse);
//       for await (const chunk of res.body as any) {
//         parser.feed(decoder.decode(chunk));
//       }
//     },
//   });
//   return stream;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const authResult = auth(req);
//     if (authResult.error) {
//       return NextResponse.json(authResult, {
//         status: 401,
//       });
//     }
//     const stream = await createStream(req);
//     return new Response(stream);
//   } catch (error) {
//     console.error("[Chat Stream]", error);
//   }
// }

// export const config = {
//   runtime: "edge",
// };



import { createParser } from "eventsource-parser";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";
import { requestLemur} from "../common";

async function createStream(res: Response) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

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
            // console.log(json)
            if (data.indexOf("content") == -1) {
              controller.close();
              return;
            }
            const text = JSON.parse(json.data.slice(6)).choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(JSON.parse(data));
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk, { stream: true }));
      }
    },
  });
  return stream;
}

function formatResponse(msg: any) {
  const jsonMsg = ["```json\n", JSON.stringify(msg, null, "  "), "\n```"].join(
    "",
  );
  return new Response(jsonMsg);
}

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Lemur Route] params ", params);

  const authResult = auth(req);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const api = await requestLemur(req);

    const contentType = api.headers.get("Content-Type") ?? "";

    // streaming response
    if (contentType.includes("stream")) {
      const stream = await createStream(api);
      const res = new Response(stream);
      res.headers.set("Content-Type", contentType);
      return res;
    }

    // try to parse error msg
    try {
      const mayBeErrorBody = await api.json();
      if (mayBeErrorBody.error) {
        console.error("[Lemur Response] ", mayBeErrorBody);
        return formatResponse(mayBeErrorBody);
      } else {
        const res = new Response(JSON.stringify(mayBeErrorBody));
        res.headers.set("Content-Type", "application/json");
        res.headers.set("Cache-Control", "no-cache");
        return res;
      }
    } catch (e) {
      console.error("[Lemur Parse] ", e);
      return formatResponse({
        msg: "invalid response from Lemur server",
        error: e,
      });
    }
  } catch (e) {
    console.error("[Lemur] ", e);
    return formatResponse(e);
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
