export type OptionsPossible =
    | string
    | boolean
    | Record<string, string>
    | object;

export type Options = {
    [Key: string]: boolean | Record<string, OptionsPossible>;
};

export type Settings = {
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
    type?: "js" | "css";
    silence?: boolean;
    publicFolder?: string;
    replaceInPlace?: boolean;
};

export type MinifierOptions = {
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
};

export type Result = {
    compressor?: string | ((arg0: MinifierOptions) => void);
    compressorLabel: string | (() => void);
    size: string;
    sizeGzip: string;
};

export type Dictionary<T> = {
    [Key: string]: T;
};
