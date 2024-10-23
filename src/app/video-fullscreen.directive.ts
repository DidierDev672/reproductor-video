import { Directive, ElementRef, HostListener } from '@angular/core';
import { VideoFullscreenService } from './video-fullscreen.service';

@Directive({
  selector: '[appVideoFullscreen]',
  standalone: true,
})
export class VideoFullscreenDirective {
  constructor(
    private el: ElementRef,
    private fullscreenService: VideoFullscreenService
  ) {}

  @HostListener('dblclick')
  onDoubleClick(): void {
    if (this.fullscreenService.isFullscreen()) {
      this.fullscreenService.exitFullScreen();
    } else {
      this.fullscreenService.enterFullScreen(this.el.nativeElement);
    }
  }
}
