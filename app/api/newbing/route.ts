import { BingChat, ChatMessage } from "../../bing-chat/index";

export async function POST(req: Request) {
  try {
    let cookies = process.env.COOKIES;
    const api = new BingChat({
      cookie: cookies,
    });
    let chat: ChatMessage = {
      id: "",
      text: "",
      author: "bot",
      conversationId: "",
      clientId: "",
      conversationSignature: "",
    };
    const res: any = await bingAiMessageSendWrapper(
      api,
      await req.json(),
      chat,
    );
    // const res = await api.sendMessage(await req.json(), {
    //   // print the partial response as the AI is "typing"
    //   onProgress: (partialResponse) => {
    //     console.log(partialResponse.text);
    //   },
    //   variant: "Precise",
    // });
    // console.log(res['text'])
    return new Response(res["text"]);
  } catch (e) {
    console.error("[NewBing] ", e);
    return new Response(JSON.stringify(e));
  }
}

/**
 * @param { import("bing-chat").BingChat } client
 * @param { string } message
 * @param { import("bing-chat").ChatMessage } [session]
 * @returns { Promise<import("bing-chat").ChatMessage> }
 */
function bingAiMessageSendWrapper(
  client: BingChat,
  message: string,
  session: ChatMessage,
) {
  const TIMEOUT_THRESHOLD = 120 * 1000;
  return new Promise((resolve, reject) => {
    let response = {
      text: "",
    };
    let responseText = "";
    let temp = {
      time: new Date().valueOf(),
      response: response,
    };
    const verifyIfResponseChangedInterval = setInterval(() => {
      if (new Date().valueOf() - temp.time > TIMEOUT_THRESHOLD) {
        clearInterval(verifyIfResponseChangedInterval);
        temp.response.text = responseText;
        resolve(temp.response);
      }
    }, 500);
    client
      .sendMessage(message, {
        ...session,
        onProgress: (partialResponse) => {
          temp.response = partialResponse;
          responseText += partialResponse.text;
          temp.time = new Date().valueOf();
        },
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
