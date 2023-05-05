import type { CreateImageRequest, ImagesResponse } from "openai";

export type ChatImageRequest = CreateImageRequest;
export type ChatImagesResponse = ImagesResponse;

export type Updater<T> = (updater: (value: T) => void) => void;
