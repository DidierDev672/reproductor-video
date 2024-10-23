import { Injectable } from '@angular/core';
import { QualityLevel, VideoQuality } from './video-quality.types';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VideoScalerService {
  private readonly supportedQualities: Map<QualityLevel, VideoQuality>;
  private currentQualitySubject: BehaviorSubject<VideoQuality>;
  public currentQuality$: Observable<VideoQuality>;
  constructor() {
    this.supportedQualities = new Map<QualityLevel, VideoQuality>();
    this.supportedQualities.set(QualityLevel.LOW, {
      resolution: { width: 256, height: 144, quality: '144p' },
      bitrate: 1000000,
      fps: 24
    });
    this.supportedQualities.set(QualityLevel.MEDIUM, {
      resolution: { width: 640, height: 360, quality: '360p' },
      bitrate: 5000000,
      fps: 30
    });
    this.supportedQualities.set(QualityLevel.HIGH, {
      resolution: { width: 1280, height: 720, quality: '720p' },
      bitrate: 25000000,
      fps: 30
    });
    this.supportedQualities.set(QualityLevel.FULL_HD, {
      resolution: { width: 1920, height: 1080, quality: '1080p' },
      bitrate: 5000000,
      fps: 60
    });

    const defaultQuality = this.supportedQualities.get(QualityLevel.HIGH)!;
    this.currentQualitySubject = new BehaviorSubject<VideoQuality>(defaultQuality);
    this.currentQuality$ = this.currentQualitySubject.asObservable();
  }

  public getOptimalQuality(bandwidth: number): QualityLevel {
    if (bandwidth < 150000) return QualityLevel.LOW;
    if (bandwidth < 1000000) return QualityLevel.MEDIUM;
    if (bandwidth < 3000000) return QualityLevel.HIGH;
    return QualityLevel.FULL_HD;
  }

  public async setQuality(quality: QualityLevel): Promise<void>{
    const newQuality = this.supportedQualities.get(quality);
    if (!newQuality) {
      throw new Error(`Calidad "${quality}" no soportada`);
    }

    this.currentQualitySubject.next(newQuality);
  }

  public getSupportedQualities(): QualityLevel[]{
    return Array.from(this.supportedQualities.keys());
  }


  public getQualityConfig(quality: QualityLevel): VideoQuality | undefined {
    return this.supportedQualities.get(quality);
  }

}
