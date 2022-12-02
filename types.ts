export interface Options {
  sourceMap?: boolean;
  _sourceMap?: { url: string } | boolean;
  babelrc?: {};
  presets?: [];
  strict?: boolean;
}

// export interface Settings {
//   options: Options;
//   content: string;
//   output: string;
// }

export interface Settings {
  compressorLabel: string | Function;
  compressor: string | Function;
  sync?: boolean;
  callback?: Function;
  content?: string;
  input: string | string[];
  output: string;
  // options?: string | Options;
  options: Options;
  buffer?: number;
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

export interface Cli {
  compressor: string | Function;
  input: string;
  output: string;
  // option: Options;
  option: string;
  silence?: boolean;
}

export interface Result {
  compressor?: string | Function;
  compressorLabel: string | Function;
  size: number;
  sizeGzip: number;
}
