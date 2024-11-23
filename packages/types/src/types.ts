export type CompressorReturnType = string | void | Promise<string | void>;
export type Compressor = (args: MinifierOptions) => CompressorReturnType;

export type Settings = {
    compressorLabel?: string;
    compressor: Compressor;
    sync?: boolean;
    callback?: (err: unknown, minified?: CompressorReturnType) => void;
    content?: string;
    input?: string | string[];
    output?: string;
    options?: Record<string, unknown>;
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
};

export type Result = {
    compressor?: string | Compressor;
    compressorLabel: string;
    size: string;
    sizeGzip: string;
};
