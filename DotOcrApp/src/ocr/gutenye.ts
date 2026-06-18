import Ocr from "@gutenye/ocr-node";
import type { OcrEngine, OcrWord } from "./engine.ts";

/**
 * Primary engine: PaddleOCR models running through onnxruntime via
 * @gutenye/ocr-node. The `executionProviders` preference list drives the
 * accelerator: CUDA on an NVIDIA Linux box, CoreML (→ Metal/ANE) on M1, CPU
 * otherwise. ONNX Runtime picks the first available at session-init.
 *
 * Covers Latin scripts well. Non-Latin scripts not in the default PaddleOCR
 * model (e.g. Malayalam) should route to the Tesseract engine instead.
 */
export class GutenyeEngine implements OcrEngine {
  readonly name = "gutenye-paddle-onnx";
  private ocr: Awaited<ReturnType<typeof Ocr.create>> | null = null;

  constructor(private readonly executionProviders: string[]) {}

  private async ensure(): Promise<NonNullable<typeof this.ocr>> {
    if (this.ocr) return this.ocr;
    this.ocr = await Ocr.create({
      onnxOptions: {
        // aws4fetch-style string EP names map to onnxruntime providers.
        executionProviders: this.executionProviders as unknown as string[],
      },
    });
    return this.ocr;
  }

  async recognize(imagePath: string): Promise<OcrWord[]> {
    const ocr = await this.ensure();
    const lines = await ocr.detect(imagePath);
    return lines.map((l: { text: string; mean: number; box?: number[][] }) => ({
      text: l.text,
      confidence: l.mean,
      box: l.box,
    }));
  }

  async dispose(): Promise<void> {
    // @gutenye/ocr-node holds onnx sessions internally; no public dispose.
    this.ocr = null;
  }
}
