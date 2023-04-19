import type {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateImageRequest,
  ImagesResponse,
} from "openai";

export type ChatRequest = CreateChatCompletionRequest;
export type ChatReponse = CreateChatCompletionResponse;
export type ChatImageRequest = CreateImageRequest;
export type ChatImagesResponse = ImagesResponse;
