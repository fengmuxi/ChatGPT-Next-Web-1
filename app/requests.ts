import type {
  ChatRequest,
  ChatReponse,
  ChatImageRequest,
  ChatImagesResponse,
} from "./api/chat/typing";
import {
  filterConfig,
  Message,
  ModelConfig,
  useAccessStore,
  useChatStore,
} from "./store";
import Locale from "./locales";
import { CreateImageRequestSizeEnum } from "openai";
const TIME_OUT_MS = 120000;

const makeRequestParam = (
  messages: Message[],
  options?: {
    filterBot?: boolean;
    stream?: boolean;
  },
): ChatRequest => {
  let sendMessages = messages.map((v) => ({
    role: v.role,
    content: v.content,
  }));

  if (options?.filterBot) {
    sendMessages = sendMessages.filter((m) => m.role !== "assistant");
  }

  return {
    model: "gpt-3.5-turbo",
    messages: sendMessages,
    stream: options?.stream,
  };
};

const makeImageRequestParam = (messages: Message[]): ChatImageRequest => {
  return {
    prompt: messages[messages.length - 1].content,
    size: CreateImageRequestSizeEnum._1024x1024,
  };
};

function getHeaders() {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {};

  if (accessStore.enabledAccessControl()) {
    headers["access-code"] = accessStore.accessCode;
  }

  if (accessStore.token && accessStore.token.length > 0) {
    headers["token"] = accessStore.token;
  }

  return headers;
}

export async function requestChat(messages: Message[]) {
  const req: ChatRequest = makeRequestParam(messages, { filterBot: true });

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify(req),
  });

  return (await res.json()) as ChatReponse;
}

export async function requestChatStream(
  messages: Message[],
  model: string,
  options?: {
    filterBot?: boolean;
    modelConfig?: ModelConfig;
    onMessage: (message: string, done: boolean) => void;
    onError: (error: Error) => void;
    onController?: (controller: AbortController) => void;
  },
) {
  if (model == "聊天") {
    const req = makeRequestParam(messages, {
      stream: true,
      filterBot: options?.filterBot,
    });

    // valid and assign model config
    if (options?.modelConfig) {
      Object.assign(req, filterConfig(options.modelConfig));
    }

    console.log("[Request] ", req);

    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      clearTimeout(reqTimeoutId);

      let responseText = "";

      const finish = () => {
        options?.onMessage(responseText, true);
        controller.abort();
      };

      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        options?.onController?.(controller);

        while (true) {
          // handle time out, will stop if no response in 10 secs
          const resTimeoutId = setTimeout(() => finish(), TIME_OUT_MS);
          const content = await reader?.read();
          clearTimeout(resTimeoutId);
          const text = decoder.decode(content?.value);
          responseText += text;

          const done = !content || content.done;
          options?.onMessage(responseText, false);

          if (done) {
            break;
          }
        }

        finish();
      } else if (res.status === 401) {
        console.error("Anauthorized");
        responseText = Locale.Error.Unauthorized;
        finish();
      } else {
        console.error("Stream Error");
        options?.onError(new Error("Stream Error"));
      }
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onError(err as Error);
    }
  } else if (model == "AI绘画") {
    console.log("[Request] ", messages[messages.length - 1].content);
    const req = makeImageRequestParam(messages);
    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);
    try {
      const res = await fetch("/api/chat-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(req),
      });

      clearTimeout(reqTimeoutId);
      const reg = /^['|"](.*)['|"]$/;
      const response = (await res.json()) as ChatImagesResponse;
      options?.onMessage(
        JSON.stringify(response.data[0].url).replace(reg, "$1"),
        true,
      );
      controller.abort();
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onMessage("请换一个问题试试吧", true);
    }
  } else if (model == "必应") {
    console.log("[Request] ", messages[messages.length - 1].content);
    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);
    try {
      const res = await fetch("/api/newbing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(messages[messages.length - 1].content),
      });

      clearTimeout(reqTimeoutId);

      let message = await res.text();
      // let responseText = "";
      // for (let i = 1; i <= message.length; i++) {
      //   // handle time out, will stop if no response in 10 secs
      //   let messages = message.slice(0,i);
      //   console.log(message)
      //   responseText = messages;
      //   options?.onMessage(responseText, false);
      // }
      options?.onMessage(message, true);
      controller.abort();
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onMessage("请换一个问题试试吧", true);
    }
  } else {
    console.log("[Request] ", messages[messages.length - 1].content);
    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);
    try {
      const res = await fetch("/api/wanjuan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(messages[messages.length - 1].content),
      });

      clearTimeout(reqTimeoutId);
      options?.onMessage(await res.text(), true);
      controller.abort();
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onMessage("请换一个问题试试吧", true);
    }
  }
}

export async function requestWithPrompt(messages: Message[], prompt: string) {
  messages = messages.concat([
    {
      role: "user",
      content: prompt,
      date: new Date().toLocaleString(),
    },
  ]);

  const res = await requestChat(messages);

  return res.choices.at(0)?.message?.content ?? "";
}

// To store message streaming controller
export const ControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(
    sessionIndex: number,
    messageIndex: number,
    controller: AbortController,
  ) {
    const key = this.key(sessionIndex, messageIndex);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionIndex: number, messageIndex: number) {
    const key = this.key(sessionIndex, messageIndex);
    const controller = this.controllers[key];
    console.log(controller);
    controller?.abort();
  },

  remove(sessionIndex: number, messageIndex: number) {
    const key = this.key(sessionIndex, messageIndex);
    delete this.controllers[key];
  },

  key(sessionIndex: number, messageIndex: number) {
    return `${sessionIndex},${messageIndex}`;
  },
};
