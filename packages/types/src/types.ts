export type CompressorReturnType = string;
export type Compressor = (
    args: MinifierOptions
) => Promise<CompressorReturnType>;

export type Settings = {
    compressorLabel?: string;
    compressor: Compressor;
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
    index?: number;
};

export type Result = {
    compressor?: string | Compressor;
    compressorLabel: string;
    size: string;
    sizeGzip: string;
};
