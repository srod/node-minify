export interface Options {
  [key: string]: string | boolean | [] | { url: string } | { filename: string } | undefined;
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
  callback?: (err: unknown, minified?: string) => void;
  content?: string;
  input?: string | string[];
  output?: string;
  options?: Options;
  option?: string;
  buffer?: number;
  type?: string;
  silence?: boolean;
  publicFolder?: string;
  replaceInPlace?: boolean;
}

export interface MinifierOptions {
  settings?: Settings;
  content?: string;
  callback?: null | ((err?: unknown | null, result?: string) => void);
  compressor?: string | ((arg0: MinifierOptions) => void);
  index?: number;
  args?: string[];
  data?: string;
  sync?: boolean;
  input?: string | string[];
  output?: string;
}

export interface Result {
  compressor?: string | ((arg0: MinifierOptions) => void);
  compressorLabel: string | (() => void);
  size: string;
  sizeGzip: string;
}

export interface Dictionary<T> {
  [Key: string]: T;
}
