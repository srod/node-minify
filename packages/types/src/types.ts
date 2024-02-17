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

type Compressor = (
    arg0: MinifierOptions
) => void | string | Promise<void | string>;

export type Settings = {
    compressorLabel?: string;
    compressor?: string | Compressor;
    sync?: boolean;
    callback?: (err: unknown, minified?: string) => void;
    content?: string;
    input?: string | string[];
    output?: string;
    options?: Options;
    option?: string;
    buffer?: number;
    type?: "js" | "css" | "uglifyjs";
    silence?: boolean;
    publicFolder?: string;
    replaceInPlace?: boolean;
};

export type MinifierOptions = {
    settings?: Settings;
    content?: string;
    callback?: null | ((err?: unknown | null, result?: string) => void);
    compressor?: string | Compressor;
    index?: number;
    args?: string[];
    data?: string;
    sync?: boolean;
    input?: string | string[];
    output?: string;
    // options?: Options;
};

export type Result = {
    compressor?: string | Compressor;
    compressorLabel: string | (() => void);
    size: string;
    sizeGzip: string;
};

export type Dictionary<T> = {
    [Key: string]: T;
};
