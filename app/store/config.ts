import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

export const DEFAULT_CONFIG = {
  bot: "Lemur" as BotType,
  submitKey: SubmitKey.Enter as SubmitKey,
  avatar: "1f603",
  fontSize: 14,
  theme: Theme.Auto as Theme,
  tightBorder: false,
  sendPreviewBubble: true,
  sidebarWidth: 300,

  disablePromptHint: false,

  dontShowMaskSplashScreen: false, // dont show splash screen when create chat

  modelConfig: {
    model: "gpt-3.5-turbo" as ModelType,
    temperature: 1,
    max_tokens: 2000,
    presence_penalty: 0,
    sendMemory: true,
    historyMessageCount: 8,
    compressMessageLengthThreshold: 1000,
  },
};

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ChatConfigStore = ChatConfig & {
  reset: () => void;
  update: (updater: (config: ChatConfig) => void) => void;
};

export type ModelConfig = ChatConfig["modelConfig"];

export const ALL_MODELS = [
  {
    name: "gpt-4",
    available: false,
  },
  {
    name: "gpt-4-0314",
    available: false,
  },
  {
    name: "gpt-4-32k",
    available: false,
  },
  {
    name: "gpt-4-32k-0314",
    available: false,
  },
  {
    name: "gpt-3.5-turbo",
    available: false,
  },
  {
    name: "gpt-3.5-turbo-0301",
    available: false,
  },
  {
    name: "qwen-v1", // 通义千问
    available: true,
  },
  {
    name: "qwen-plus-v1", // 通义千问
    available: true,
  },
  {
    name: "ERNIE-Bot-turbo", // 文心一言
    available: true,
  },
  {
    name: "spark", // 讯飞星火
    available: false,
  },
  {
    name: "llama", // llama
    available: false,
  },
  {
    name: "chatglm", // chatglm-6b
    available: false,
  },
] as const;

export const ALL_BOT = [
  {
    name: "OpenAI (VIP)",
    available: true,
  },
  {
    name: "OpenAI绘画 (VIP)",
    available: false,
  },
  {
    name: "必应 (VIP)",
    available: false,
  },
  {
    name: "必应绘画(VIP)",
    available: false,
  },
  {
    name: "万卷 (VIP)",
    available: false,
  },
  {
    name: "Lemur",
    available: true,
  },
];

export type BotType = (typeof ALL_BOT)[number]["name"];
export type ModelType = (typeof ALL_MODELS)[number]["name"];

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (typeof x !== "number" || isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export function limitModel(name: string) {
  return ALL_MODELS.some((m) => m.name === name && m.available)
    ? name
    : ALL_MODELS[4].name;
}

export function limitBot(name: string) {
  return ALL_BOT.some((m) => m.name === name && m.available)
    ? name
    : ALL_BOT[4].name;
}

export const ModalConfigValidator = {
  bot(x: string) {
    return limitBot(x) as BotType;
  },
  model(x: string) {
    return limitModel(x) as ModelType;
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 32000, 2000);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
};

export const useAppConfig = create<ChatConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,

      reset() {
        set(() => ({ ...DEFAULT_CONFIG }));
      },

      update(updater) {
        const config = { ...get() };
        updater(config);
        set(() => config);
      },
    }),
    {
      name: StoreKey.Config,
      version: 2,
      migrate(persistedState, version) {
        if (version === 2) return persistedState as any;

        const state = persistedState as ChatConfig;
        state.modelConfig.sendMemory = true;
        state.modelConfig.historyMessageCount = 4;
        state.modelConfig.compressMessageLengthThreshold = 1000;
        state.dontShowMaskSplashScreen = false;

        return state;
      },
    },
  ),
);
