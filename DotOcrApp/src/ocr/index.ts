import { GutenyeEngine } from "./gutenye.ts";
import { TesseractEngine } from "./tesseract.ts";
import type { OcrEngine } from "./engine.ts";

export type { OcrEngine, OcrWord } from "./engine.ts";

// ISO 639-1 (Brightcove srclang) → Tesseract.js language code (639-2/3).
const TESSERACT_LANG_MAP: Record<string, string> = {
  en: "eng",
  fr: "fra",
  pt: "por",
  es: "spa",
  sw: "swa",
  mr: "mar",
  ml: "mal",
  hi: "hin",
};

// Languages the default PaddleOCR model doesn't handle well → route to
// Tesseract instead. Malayalam is the one in the current playlist set.
const ROUTE_TO_TESSERACT = new Set(["ml"]);

/**
 * Chooses + caches an OCR engine per srclang. PaddleOCR (Gutenye) is the
 * default; specific scripts fall through to Tesseract.js.
 */
export class OcrEnginePool {
  private gutenye: GutenyeEngine | null = null;
  private readonly tesseract = new Map<string, TesseractEngine>();

  constructor(private readonly executionProviders: string[]) {}

  forLang(srclang: string): OcrEngine {
    if (ROUTE_TO_TESSERACT.has(srclang)) {
      return this.tesseractFor(srclang);
    }
    this.gutenye ??= new GutenyeEngine(this.executionProviders);
    return this.gutenye;
  }

  private tesseractFor(srclang: string): TesseractEngine {
    const code = TESSERACT_LANG_MAP[srclang] ?? "eng";
    let engine = this.tesseract.get(code);
    if (!engine) {
      engine = new TesseractEngine(code);
      this.tesseract.set(code, engine);
    }
    return engine;
  }

  async dispose(): Promise<void> {
    await this.gutenye?.dispose();
    await Promise.all([...this.tesseract.values()].map((e) => e.dispose()));
    this.gutenye = null;
    this.tesseract.clear();
  }
}
