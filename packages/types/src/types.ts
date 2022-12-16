export interface Options {
  sourceMap?: boolean;
  _sourceMap?: { url: string } | boolean;
  babelrc?: string;
  presets?: [];
  strict?: boolean;
}

export interface Settings {
  compressorLabel?: string;
  compressor?: string | ((arg0: MinifierOptions) => string);
  sync?: boolean;
  callback?: (err: Error, minified?: string) => void;
  content?: string;
  input?: string | string[];
  output?: string;
  options?: Options;
  option?: string;
  buffer?: number;
  type?: string;
  silence?: boolean;
}

export interface MinifierOptions {
  settings?: Settings;
  content?: string;
  callback?: null | ((err?: unknown | null, result?: string) => void);
  compressor?: string | (() => void);
  index?: number;
  args?: string[];
  data?: string;
  sync?: boolean;
  input?: string | string[];
  output?: string;
}

export interface Result {
  compressor?: string | (() => void);
  compressorLabel: string | (() => void);
  size: number;
  sizeGzip: number;
}

export interface Dictionary<T> {
  [Key: string]: T;
}
