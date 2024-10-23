export interface Resolution {
    width: number;
    height: number;
    quality: string;
}


export interface VideoQuality {
    resolution: Resolution;
    bitrate: number;
    fps: number;
}


export enum QualityLevel {
    LOW = '144p',
    MEDIUM = '240p',
    HIGH = '720p',
    FULL_HD = '1080p'
}
