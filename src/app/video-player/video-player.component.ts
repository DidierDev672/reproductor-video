import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { QualityLevel, VideoQuality } from '../video-quality.types';
import { VideoFullscreenService } from '../video-fullscreen.service';
import { VideoScalerService } from '../video-scaler.service';
import { Subscription } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { VideoFullscreenDirective } from '../video-fullscreen.directive';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, VideoFullscreenDirective],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('accordionAnimation', [
      state(
        'closed',
        style({
          height: '0',
          padding: '0',
          opacity: '0',
        })
      ),
      state(
        'open',
        style({
          height: '*',
          opacity: '1',
        })
      ),
      transition('closed <=> open', [animate('200ms ease-in-out')]),
    ]),
  ],
})
export class VideoPlayerComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('videoCanvas') videoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('outputCanvas') outputCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() videoSRC: string = '';
  isPlaying = false;
  isMuted = false;
  isFullscreen = false;
  controlsVisible = false;
  showVolumeSlider = false;
  showQualityMenu = false;
  showProgressTooltip = false;
  volumeLevel = 1;
  currentTime = 0;
  duration = 0;
  progress = 0;
  previewTime = 0;
  tooltipPosition = 0;
  stream: MediaStream | null = null;
  currentQuality?: VideoQuality;
  private hideControlsTimeout: any;

  supportedQualities: QualityLevel[] = [];
  private subscriptions = new Subscription();

  // Dimensiones del canvas.
  private readonly CANVAS_WIDTH = 640;
  private readonly CANVAS_HEIGHT = 480;

  isAccordionOpen = false;

  constructor(
    private fullscreenService: VideoFullscreenService,
    private videoScalarService: VideoScalerService
  ) {
    this.supportedQualities = this.videoScalarService.getSupportedQualities();
  }
  ngAfterViewInit(): void {
    this.setupEventListeners();
  }
  ngOnInit(): void {
    //! Suscribirse a los cambios de calidad
    this.subscriptions.add(
      this.videoScalarService.currentQuality$.subscribe((quality) => {
        this.currentQuality = quality;
        this.updateVideoQuality();
      })
    );
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  getQualityDetails(quality: QualityLevel): string {
    const qualityConfig = this.videoScalarService.getQualityConfig(quality);
    if (qualityConfig) {
      return `${qualityConfig.resolution.width}x${qualityConfig.resolution.height}`;
    }

    return '';
  }

  private updateVideoQuality() {
    if (this.videoPlayer && this.currentQuality) {
      const video = this.videoPlayer.nativeElement;
      const currentTime = video.currentTime;
      const isPlaying = !video.paused;

      //! Actualizar dimensiones
      video.width = this.currentQuality.resolution.width;
      video.height = this.currentQuality.resolution.height;

      //! Mantener el tiempo de reproducción
      video.currentTime = currentTime;

      //! Mantener el estado de reproducción
      if (isPlaying) {
        video.play();
      }
    }
  }

  async onQualityChange(quality: QualityLevel) {
    await this.videoScalarService.setQuality(quality);
    this.isAccordionOpen = false;
  }

  ngOnDestroy(): void {
    this.cleanupEventListeners();
  }

  async initializeCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: this.CANVAS_WIDTH,
          height: this.CANVAS_HEIGHT,
        },
      });

      const video = this.videoPlayer.nativeElement;
      video.srcObject = this.stream;
      video.onloadedmetadata = () => {
        video.play();
      };
    } catch (error) {
      console.error('Error al inicializar la cámara:', error);
    }
  }
  private setupEventListeners() {
    // Mouse move para mostrar/ocultar controles
    this.videoContainer.nativeElement.addEventListener(
      'mousemove',
      this.showControls.bind(this)
    );
    this.videoContainer.nativeElement.addEventListener(
      'mouseleave',
      this.hideControls.bind(this)
    );

    // Teclas de control
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private cleanupEventListeners() {
    this.videoContainer.nativeElement.removeEventListener(
      'mousemove',
      this.showControls.bind(this)
    );
    this.videoContainer.nativeElement.removeEventListener(
      'mouseleave',
      this.hideControls.bind(this)
    );
    document.removeEventListener('keydown', this.handleKeyPress.bind(this));
  }
  showControls() {
    this.controlsVisible = true;
    clearTimeout(this.hideControlsTimeout);
    if (this.isPlaying) {
      this.hideControlsTimeout = setTimeout(() => {
        this.controlsVisible = false;
      }, 3000);
    }
  }

  hideControls() {
    if (this.isPlaying) {
      this.controlsVisible = false;
    }
  }

  onMetadataLoaded() {
    this.duration = this.videoPlayer.nativeElement.duration;
  }

  onTimeUpdate() {
    const video = this.videoPlayer.nativeElement;
    this.currentTime = video.currentTime;
    this.progress = (video.currentTime / video.duration) * 100;
  }

  togglePlay() {
    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  startSeeking(event: MouseEvent) {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    this.videoPlayer.nativeElement.currentTime = pos * this.duration;
  }

  onProgressHover(event: MouseEvent) {
    const progressBar = event.target as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    this.tooltipPosition = pos * 100;
    this.previewTime = pos * this.duration;
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.volumeLevel = parseFloat(input.value);
    this.videoPlayer.nativeElement.volume = this.volumeLevel;
    this.isMuted = this.volumeLevel === 0;
  }

  toggleMute() {
    const video = this.videoPlayer.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
    this.volumeLevel = video.muted ? 0 : 1;
  }

  async toggleFullscreen() {
    try {
      if (this.isFullscreen) {
        await this.fullscreenService.exitFullScreen();
        this.isFullscreen = false;
      } else {
        await this.fullscreenService.enterFullScreen(
          this.videoContainer.nativeElement
        );
        this.isFullscreen = true;
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }

  closeFullscreen(): void {
    if (this.isFullscreen) {
      this.fullscreenService.exitFullScreen();
      this.isFullscreen = false;
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'f':
        this.toggleFullscreen();
        break;
      case 'm':
        this.toggleMute();
        break;
      case 'arrowright':
        this.videoPlayer.nativeElement.currentTime += 5;
        break;
      case 'arrowleft':
        this.videoPlayer.nativeElement.currentTime -= 5;
        break;
      case 'arrowup':
        this.volumeLevel = Math.min(1, this.volumeLevel + 0.1);
        this.videoPlayer.nativeElement.volume = this.volumeLevel;
        break;
      case 'arrowdown':
        this.volumeLevel = Math.max(0, this.volumeLevel - 0.1);
        this.videoPlayer.nativeElement.volume = this.volumeLevel;
        break;
      case 'escape':
        this.closeFullscreen();
        break;
    }
  }

  transform(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
