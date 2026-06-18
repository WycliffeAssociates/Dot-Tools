/** One detected text region from a single frame. */
export interface OcrWord {
  text: string;
  /** Confidence in [0, 1]. */
  confidence: number;
  /** Optional bounding box as [[x,y], ...]; engine-dependent. */
  box?: number[][];
}

export interface OcrEngine {
  readonly name: string;
  /** Run OCR on an image file path, returning detected words. */
  recognize(imagePath: string): Promise<OcrWord[]>;
  /** Release any held resources (model sessions, workers). */
  dispose(): Promise<void>;
}
