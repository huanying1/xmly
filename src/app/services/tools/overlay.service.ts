import {Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from "@angular/common";
import {fromEvent, merge, Observable, Subject, timer} from "rxjs";
import {takeUntil} from "rxjs/operators";

export interface OverlayRef {
  container: HTMLElement
  backdropClick: () => Observable<MouseEvent>
  backdropKeyUp: () => Observable<KeyboardEvent>
  dispose: () => void
}

export interface OverlayConfig {
  center?: boolean
  fade?: boolean
  backgroundColor?: string
  responseEvent?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private overlayRef: OverlayRef
  private rd2: Renderer2
  readonly defaultConfig: Required<OverlayConfig> = {
    center: false,
    fade: false,
    backgroundColor: 'transparent',
    responseEvent: true
  }
  private config: Required<OverlayConfig>
  private backdropElement: HTMLElement
  private detachment$ = new Subject<void>()
  private backDropClick$ = new Subject<MouseEvent>()
  private backDropKeyup$ = new Subject<KeyboardEvent>()

  constructor(
    private rdFactory2: RendererFactory2,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.rd2 = rdFactory2.createRenderer(null, null)
  }

  create(config?: OverlayConfig): OverlayRef {
    if (isPlatformBrowser(this.platformId)) {
      this.config = {...this.defaultConfig, ...config}
      const container = this.rd2.createElement('div')
      this.rd2.addClass(container, 'overlay-container')
      container.innerHTML = `<div class="overlay-mask"></div>`
      this.rd2.appendChild(this.doc.body, container)
      this.backdropElement = container.querySelector('.overlay-mask')
      this.setConfigs(container)
      this.overlayRef = {
        container,
        backdropClick: this.backDropClick.bind(this),
        backdropKeyUp: this.backDropKeyup.bind(this),
        dispose: this.dispose.bind(this)
      }
      return this.overlayRef
    }

  }

  backDropClick(): Observable<MouseEvent> {
    return this.backDropClick$.asObservable()
  }

  backDropKeyup(): Observable<KeyboardEvent> {
    return this.backDropKeyup$.asObservable()
  }

  listenEvents() {
    merge(
      fromEvent(this.backdropElement, 'click'),
      fromEvent(this.doc, 'keyup'),
    ).pipe(takeUntil(this.detachment$)).subscribe((event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        this.backDropKeyup$.next(event)
      } else {
        this.backDropClick$.next(event)
      }
    })
  }

  setConfigs(container: HTMLElement): void {
    const {center, fade, backgroundColor, responseEvent} = this.config
    if (center) {
      this.rd2.addClass(container, 'overlay-center')
    }
    if (fade) {
      timer(0).subscribe(() => {
        this.rd2.addClass(this.backdropElement, 'overlay-mask-show')
      })
    }
    if (backgroundColor) {
      this.rd2.setStyle(this.backdropElement, 'background-color', backgroundColor)
    }
    if (responseEvent) {
      this.rd2.setStyle(this.backdropElement, 'pointer-events', 'auto')
      this.listenEvents()
    }

  }

  private dispose(): void {
    if (this.overlayRef) {
      if (this.config.fade) {
        fromEvent(this.backdropElement, 'transitionend')
          .pipe(takeUntil(this.detachment$)).subscribe(() => {
          this.destroy()
        })
        this.rd2.removeClass(this.backdropElement, 'overlay-mask-show')
      } else {
        this.destroy()
      }
    }
  }

  private destroy(): void {
    this.detachment$.next()
    this.detachment$.complete()
    this.rd2.removeChild(this.doc.body, this.overlayRef.container)
    this.overlayRef = null

  }

}
