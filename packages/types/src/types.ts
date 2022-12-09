export interface Options {
  sourceMap?: boolean;
  _sourceMap?: { url: string } | boolean;
  babelrc?: {};
  presets?: [];
  strict?: boolean;
}

export interface Settings {
  compressorLabel?: string | Function;
  compressor: string | Function;
  sync?: boolean;
  callback?: Function;
  content?: string;
  input: string | string[];
  output: string;
  options?: Options;
  option?: string;
  buffer?: number;
  type?: string;
  silence?: boolean;
}

export interface MinifierOptions {
  settings?: Settings;
  content?: string;
  callback?: Function;
  index?: number;
  args?: string[];
  data?: string;
  sync?: boolean;
  input?: string | string[];
}

export interface Result {
  compressor?: string | Function;
  compressorLabel: string | Function;
  size: number;
  sizeGzip: number;
}

export interface Dictionary<T> {
  [Key: string]: T;
}
