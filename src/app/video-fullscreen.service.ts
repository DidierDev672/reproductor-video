import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoFullscreenService {
  // BehaviorSubject para manejar el estado del fullscreen
  private isFullscreenSubject = new BehaviorSubject<boolean>(false);

  // Observable público para que los componentes puedan suscribirse a cambios
  public isFullscreen$: Observable<boolean> =
    this.isFullscreenSubject.asObservable();

  constructor() {
    // Detectar cambios en el estado fullscreen del navegador
    document.addEventListener(
      'fullscreenchange',
      this.handleFullscreenChange.bind(this)
    );
    document.addEventListener(
      'webkitfullscreenchange',
      this.handleFullscreenChange.bind(this)
    );
    document.addEventListener(
      'mozfullscreenchange',
      this.handleFullscreenChange.bind(this)
    );
    document.addEventListener(
      'MSFullscreenChange',
      this.handleFullscreenChange.bind(this)
    );
  }

  /**
   * Maneja los cambios en el estado del fullscreen
   * Actualiza el BehaviorSubject cuando el estado cambia
   */

  private handleFullscreenChange(): void {
    const isFullscreen = this.isFullscreen();
    this.isFullscreenSubject.next(isFullscreen);
  }

  /**
   * Verifica si el navegador soporta fullscreen
   */

  public isFullscreenSupported(): boolean {
    const doc = document as any;
    return !!(
      doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled
    );
  }

  /**
   * Verifica si actualmente está en modo fullscreen
   */

  public isFullscreen(): boolean {
    const doc = document as any;
    return (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullscreenElement ||
      doc.msFullscreenElement
    );
  }

  /**
   * Activa el modo pantalla completa en el elemento especificado
   * @param element Elemento HTML que se pondrá en pantalla completa
   * @returns Promise que se resuelve cuando se completa la acción
   */
  public enterFullScreen(element: HTMLElement): Promise<void> {
    if (!this.isFullscreenSupported()) {
      return Promise.reject(
        new Error('El navegador no soporta el modo pantalla completa')
      );
    }

    const el = element as any;
    // Intentar con diferentes prefijos según el navegador
    const enterFullscreen =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;

    if (enterFullscreen) {
      try {
        return enterFullscreen.call(element);
      } catch (error) {
        return Promise.reject('Método fullscreen no encontrado');
      }
    }

    return Promise.reject('Método fullscreen no encontrado');
  }
  /**
   * Sale del modo pantalla completa
   * @returns Promise que se resuelve cuando se completa la acción
   */
  public exitFullScreen(): Promise<void> {
    if (!this.isFullscreen()) {
      return Promise.resolve();
    }

    const doc = document as any;

    // Intentar con diferentes prefijos según el navegador
    const exitFullscreen =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (exitFullscreen) {
      try {
        return exitFullscreen.call(document);
      } catch (error) {
        return Promise.reject('Método para salir de fullscreen no encontrado');
      }
    }

    return Promise.reject('Método para salir de fullscreen no encontrado');
  }

  /**
   * Toggle del estado fullscreen
   * @param element Elemento HTML para entrar en fullscreen
   * @returns Promise que se resuelve cuando se completa la acción
   */

  public toggleFullScreen(element: HTMLElement): Promise<void> {
    return this.isFullscreen()
      ? this.exitFullScreen()
      : this.enterFullScreen(element);
  }
  /**
   * Obtiene el elemento actual en fullscreen
   * @returns El elemento HTML en fullscreen o null
   */

  public getFullscreenElement(): Element | null {
    const doc = document as any;
    return (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      null
    );
  }
}
