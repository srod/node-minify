export type OptionsPossible =
    | string
    | boolean
    | Record<string, string>
    | object;

export type Options = {
    [Key: string]:
        | string
        | string[]
        | boolean
        | Record<string, OptionsPossible>;
};

export type OptionsTest = Options & {
    minify: Settings;
};

type Compressor = (args: MinifierOptions) => string;

export type Settings = {
    compressorLabel?: string;
    compressor: Compressor;
    sync?: boolean;
    callback?: (err: unknown, minified?: string) => void;
    content?: string;
    input?: string | string[];
    output?: string;
    options?: Options;
    option?: string;
    buffer?: number;
    type?: "js" | "css";
    silence?: boolean;
    publicFolder?: string;
    replaceInPlace?: boolean;
};

export type MinifierOptions = {
    settings: Settings;
    content?: string;
    callback?: (err?: unknown, result?: string) => void;
    index?: number;
    sync?: boolean;
    input?: string | string[];
    output?: string;
};

export type Result = {
    compressor?: string | Compressor;
    compressorLabel: string;
    size: string;
    sizeGzip: string;
};
