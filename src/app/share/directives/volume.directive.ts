import {
  AfterViewInit,
  Directive,
  ElementRef, EventEmitter,
  HostListener,
  Inject,
  Output,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from "@angular/common";
import {clamp} from 'lodash'

interface StartPosition {
  y: number  //鼠标点击音量圆点时距离顶部的距离
  bottom:number //音量条底部距离浏览器视口顶部的位置
}

@Directive({
  selector: '[xmVolume]'
})

export class VolumeDirective implements AfterViewInit {
  private bar: HTMLElement
  private barHeight: number
  startPosition: StartPosition
  movable = false
  private circle: HTMLElement
  private dragMoveHandler: () => void
  private dragEndHandler: () => void
  private dragMoveDocHandler: () => void
  @Output() volume = new EventEmitter<number>()

  constructor(
    private rd2: Renderer2,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platform: object,
    @Inject(DOCUMENT) private doc: Document
  ) {
  }

  ngAfterViewInit() {
    this.circle = this.el.nativeElement
    this.bar = this.circle.parentElement
    this.barHeight = this.bar.getBoundingClientRect().height
  }

  setVolume(top:number) {
    console.log(top)
    this.rd2.setStyle(this.bar,'height',top + 'px')
    const volume = (this.barHeight * (top * 0.01) * 0.01)
    this.volume.emit(volume)
  }

  @HostListener('mousedown', ['$event'])
  dragStart(event: MouseEvent) {
    if (isPlatformBrowser(this.platform)) {
      const allowDrag = event.button === 0
      event.preventDefault()
      event.stopPropagation()
      if (allowDrag) {
        const y = event.clientY
        const {bottom} = this.bar.getBoundingClientRect()
        this.startPosition = {
          y,
          bottom
        }
        this.toggleMoving(true)
      }
    }
  }

  moveVolume(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()
    console.log('move')
    const diffY = this.startPosition.bottom - event.clientY - 5
    const {top} = this.calculate(diffY)
    this.rd2.setStyle(this.circle,'bottom',top + 'px')
    this.setVolume(top)
  }

  toggleMoving(movable: boolean): void {
    this.movable = movable
    if (movable) {
      this.dragMoveHandler = this.rd2.listen(this.circle, 'mousemove', this.moveVolume.bind(this))
      this.dragMoveDocHandler = this.rd2.listen(this.doc, 'mousemove', this.moveVolume.bind(this))
      this.dragEndHandler = this.rd2.listen(this.doc, 'mouseup', this.moveEnd.bind(this))
    } else {
      if (this.dragMoveHandler) {
        this.dragMoveHandler()
      }
      if(this.dragMoveDocHandler) {
        this.dragMoveDocHandler()
      }
      if (this.dragEndHandler) {
        this.dragEndHandler()
      }
    }
  }

  moveEnd() {
    console.log('end')
    this.toggleMoving(false)
  }

  calculate(diffY: number): { top: number } {
    let newTop = clamp(diffY, 0, this.barHeight)
    return {
      top: newTop
    }
  }
}
