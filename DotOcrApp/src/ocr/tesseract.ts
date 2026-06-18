import { createWorker, type Worker } from "tesseract.js";
import type { OcrEngine, OcrWord } from "./engine.ts";

/**
 * Fallback engine: Tesseract.js (pure WASM). Used for languages the PaddleOCR
 * default model doesn't cover (e.g. Malayalam `mal`). Lower accuracy on
 * stylized title cards but broad script coverage and no native install.
 *
 * `lang` uses Tesseract language codes (e.g. "eng", "fra", "mal", "hin").
 */
export class TesseractEngine implements OcrEngine {
  readonly name: string;
  private worker: Worker | null = null;

  constructor(private readonly lang: string) {
    this.name = `tesseract-${lang}`;
  }

  private async ensure(): Promise<Worker> {
    if (this.worker) return this.worker;
    this.worker = await createWorker(this.lang);
    return this.worker;
  }

  async recognize(imagePath: string): Promise<OcrWord[]> {
    const worker = await this.ensure();
    // Request the block hierarchy so we can read line-level text. We emit one
    // entry per line (a reference like "John 3:14-16" stays intact on a line,
    // unlike word-level splitting). Confidence is reported 0–100.
    const { data } = await worker.recognize(imagePath, {}, { blocks: true });
    const out: OcrWord[] = [];
    for (const block of data.blocks ?? []) {
      for (const para of block.paragraphs) {
        for (const line of para.lines) {
          const b = line.bbox;
          out.push({
            text: line.text,
            confidence: line.confidence / 100,
            box: [
              [b.x0, b.y0],
              [b.x1, b.y0],
              [b.x1, b.y1],
              [b.x0, b.y1],
            ],
          });
        }
      }
    }
    return out;
  }

  async dispose(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
