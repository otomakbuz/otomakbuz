import { OcrAdapter } from "./types";
import { MockOcrAdapter } from "./mock-adapter";

export function getOcrAdapter(): OcrAdapter {
  const adapterType = process.env.OCR_ADAPTER || "mock";

  switch (adapterType) {
    case "mock":
      return new MockOcrAdapter();
    // Future adapters:
    // case "google_vision":
    //   return new GoogleVisionAdapter();
    // case "aws_textract":
    //   return new AwsTextractAdapter();
    default:
      return new MockOcrAdapter();
  }
}

export type { OcrAdapter, OcrResult } from "./types";
