import type { ChatRequest, ChatResponse } from "./api/openai/typing";
import {
  Message,
  ModelConfig,
  ModelType,
  shuixianRes,
  useAccessStore,
  useAppConfig,
  useChatStore,
  useUserStore,
} from "./store";
import { showToast } from "./components/ui-lib";
import { ACCESS_CODE_PREFIX } from "./constant";
import {
  ChatImageRequest,
  ChatImagesResponse,
} from "./api/openai-image/typing";
import { CreateImageRequestSizeEnum } from "openai";

const TIME_OUT_MS = 60000;

const makeRequestParam = (
  messages: Message[],
  options?: {
    stream?: boolean;
    overrideModel?: ModelType;
  },
): ChatRequest => {
  let sendMessages = messages.map((v) => ({
    role: v.role,
    content: v.content,
  }));

  const modelConfig = {
    ...useAppConfig.getState().modelConfig,
    ...useChatStore.getState().currentSession().mask.modelConfig,
  };

  // override model config
  if (options?.overrideModel) {
    modelConfig.model = options.overrideModel;
  }

  return {
    messages: sendMessages,
    stream: options?.stream,
    model: modelConfig.model,
    temperature: modelConfig.temperature,
    presence_penalty: modelConfig.presence_penalty,
  };
};

const makeRevChatRequestParam = (messages: Message[]) => {
  let sendMessages = messages.map((v) => ({
    role: v.role,
    content: v.content,
    isSensitive: false,
    needCheck: true,
  }));

  return {
    messages: JSON.stringify(sendMessages),
  };
};

const makeImageRequestParam = (messages: Message[]): ChatImageRequest => {
  return {
    prompt: messages[messages.length - 1].content,
    size: CreateImageRequestSizeEnum._1024x1024,
  };
};

export function getHeaders() {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {};

  const makeBearer = (token: string) => `Bearer ${token.trim()}`;
  const validString = (x: string) => x && x.length > 0;

  // use user's api key first
  if (validString(accessStore.token)) {
    headers.Authorization = makeBearer(accessStore.token);
  } else if (
    accessStore.enabledAccessControl() &&
    validString(accessStore.accessCode)
  ) {
    headers.Authorization = makeBearer(
      ACCESS_CODE_PREFIX + accessStore.accessCode,
    );
  }

  headers.Auth=useAccessStore.getState().auth.trim()

  return headers;
}

export function requestOpenaiClient(path: string) {
  const openaiUrl = useAccessStore.getState().openaiUrl;
  return (body: any, method = "POST") =>
    fetch(openaiUrl + path, {
      method,
      body: body && JSON.stringify(body),
      headers: getHeaders(),
    });
}

export async function requestChat(
  messages: Message[],
  options?: {
    model?: ModelType;
  },
) {
  const req: ChatRequest = makeRequestParam(messages, {
    overrideModel: options?.model,
  });

  const res = await requestOpenaiClient("v1/chat/completions")(req);

  try {
    const response = (await res.json()) as ChatResponse;
    return response;
  } catch (error) {
    console.error("[Request Chat] ", error, res.body);
  }
}

export async function requestUsage() {
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = formatDate(startOfMonth);
  const endDate = formatDate(new Date(Date.now() + ONE_DAY));

  const [used, subs] = await Promise.all([
    requestOpenaiClient(
      `dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
    )(null, "GET"),
    requestOpenaiClient("dashboard/billing/subscription")(null, "GET"),
  ]);

  const response = (await used.json()) as {
    total_usage?: number;
    error?: {
      type: string;
      message: string;
    };
  };

  const total = (await subs.json()) as {
    hard_limit_usd?: number;
  };

  if (response.error && response.error.type) {
    showToast(response.error.message);
    return;
  }

  if (response.total_usage) {
    response.total_usage = Math.round(response.total_usage) / 100;
  }

  if (total.hard_limit_usd) {
    total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
  }

  return {
    used: response.total_usage,
    subscription: total.hard_limit_usd,
  };
}

function updateWallet() {
  fetch("/api/user/set?user="+useUserStore.getState().user+"&project=wallet&projectName=num&data=1",{
    method:"POST",
    headers:{
      ...getHeaders()
    }
  })
  if(useUserStore.getState().wallet>0){
    useUserStore.getState().updateWallet(1)
    return true
  }else{
    return false
  }
}

async function isVip() {
  let res=await fetch("/api/user/vip?user="+useUserStore.getState().user+"&password="+useUserStore.getState().password,{
    method:"POST",
    headers:{
      ...getHeaders()
    }
  })
  let response=await res.json() as shuixianRes
  if(response.code==1){
    if(response.msg=="1"){
      return true
    }
  }
  return false
}


export async function requestChatStream(
  messages: Message[],
  options?: {
    modelConfig?: ModelConfig;
    overrideModel?: ModelType;
    onMessage: (message: string, done: boolean) => void;
    onError: (error: Error, statusCode?: number) => void;
    onController?: (controller: AbortController) => void;
  },
) {
  if(!useAccessStore.getState().auth){
    options?.onError(new Error("Unauthorized"), 401);
      return
  }
  let vip=await isVip()
  const Bot = useAppConfig.getState().bot;
  if(!vip){
    if(!updateWallet()){
      options?.onMessage("积分不足请购买积分或会员卡密！", true);
      return
    }
    if (Bot == "Lemur"){
      const req = makeRevChatRequestParam(messages);
  
      console.log("[Request] ", req);
  
      const controller = new AbortController();
      const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);
  
      try {
        const res = await fetch("/api/lemur", {
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
          console.error("Unauthorized");
          options?.onError(new Error("Unauthorized"), res.status);
        } else {
          console.error("Stream Error", res.body);
          options?.onError(new Error("Stream Error"), res.status);
        }
      } catch (err) {
        console.error("NetWork Error", err);
        options?.onError(err as Error);
      }
    }else{
      options?.onMessage("该模型需要开通会员才能使用！", true);
      return
    }
  }
  if (Bot == "OpenAI") {
    const req = makeRequestParam(messages, {
      stream: true,
      overrideModel: options?.overrideModel,
    });

    console.log("[Request] ", req);

    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);

    try {
      const openaiUrl = useAccessStore.getState().openaiUrl;
      const res = await fetch(openaiUrl + "v1/chat/completions", {
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
          const resTimeoutId = setTimeout(() => finish(), TIME_OUT_MS);
          const content = await reader?.read();
          clearTimeout(resTimeoutId);

          if (!content || !content.value) {
            break;
          }

          const text = decoder.decode(content.value, { stream: true });
          responseText += text;

          const done = content.done;
          options?.onMessage(responseText, false);

          if (done) {
            break;
          }
        }
        finish();
      } else if (res.status === 401) {
        console.error("Unauthorized");
        options?.onError(new Error("Unauthorized"), res.status);
      } else {
        console.error("Stream Error", res.body);
        options?.onError(new Error("Stream Error"), res.status);
      }
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onError(err as Error);
    }
  } else if (Bot == "OpenAI绘画") {
    console.log("[Request] ", messages[messages.length - 1].content);
    const req = makeImageRequestParam(messages);
    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);
    try {
      const res = await fetch("/api/openai-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(req),
      });

      clearTimeout(reqTimeoutId);
      if(res.ok){
        const reg = /^['|"](.*)['|"]$/;
      const response = (await res.json()) as ChatImagesResponse;
      options?.onMessage(
        "![image](" +
          JSON.stringify(response.data[0].url).replace(reg, "$1") +
          ")",
        true,
      );
      controller.abort();
      }else if(res.status === 401){
        console.error("Unauthorized");
        options?.onError(new Error("Unauthorized"), res.status);
      }
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onMessage("请换一个问题试试吧", true);
    }
  } else if (Bot == "必应") {
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
      if(res.ok){
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
      }else if(res.status === 401){
        console.error("Unauthorized");
        options?.onError(new Error("Unauthorized"), res.status);
      }
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onMessage("请换一个问题试试吧", true);
    }
  } else if (Bot == "万卷") {
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
      if(res.ok){
        options?.onMessage(await res.text(), true);
      controller.abort();
      }else if(res.status === 401){
        console.error("Unauthorized");
        options?.onError(new Error("Unauthorized"), res.status);
      }
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onMessage("请换一个问题试试吧", true);
    }
  } else if (Bot == "必应绘画") {
    console.log("[Request] ", messages[messages.length - 1].content);
    const req = makeImageRequestParam(messages);
    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);
    try {
      const res = await fetch("/api/newbing-image", {
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
  }else{
    const req = makeRevChatRequestParam(messages);

    console.log("[Request] ", req);

    const controller = new AbortController();
    const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);

    try {
      const res = await fetch("/api/lemur", {
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
        console.error("Unauthorized");
        options?.onError(new Error("Unauthorized"), res.status);
      } else {
        console.error("Stream Error", res.body);
        options?.onError(new Error("Stream Error"), res.status);
      }
    } catch (err) {
      console.error("NetWork Error", err);
      options?.onError(err as Error);
    }
  }
}

export async function requestWithPrompt(
  messages: Message[],
  prompt: string,
  options?: {
    model?: ModelType;
  },
) {
  messages = messages.concat([
    {
      role: "user",
      content: prompt,
      date: new Date().toLocaleString(),
    },
  ]);

  const res = await requestChat(messages, options);

  return res?.choices?.at(0)?.message?.content ?? "";
}

// To store message streaming controller
export const ControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(
    sessionIndex: number,
    messageId: number,
    controller: AbortController,
  ) {
    const key = this.key(sessionIndex, messageId);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    const controller = this.controllers[key];
    controller?.abort();
  },

  stopAll() {
    Object.values(this.controllers).forEach((v) => v.abort());
  },

  hasPending() {
    return Object.values(this.controllers).length > 0;
  },

  remove(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    delete this.controllers[key];
  },

  key(sessionIndex: number, messageIndex: number) {
    return `${sessionIndex},${messageIndex}`;
  },
};
