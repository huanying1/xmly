import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  PLATFORM_ID,
  QueryList,
  Renderer2
} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from "@angular/common";
import {DragHandlerDirective} from "./drag-handler.directive";
import {clamp} from 'lodash'

interface StartPosition {
  x: number //鼠标点下的位置距离浏览器左边的距离
  y: number  //鼠标点下的位置距离浏览器顶部的距离
  left?: number //元素距离浏览器左边的距离
  top?: number  //元素距离浏览器顶部的距离
}

@Directive({
  selector: '[xmDrag]'
})
export class DragDirective implements AfterViewInit {
  @Input() limitInWindow = false
  private startPosition: StartPosition
  private hostEl: HTMLElement
  private movable = false
  private dragMoveHandler: () => void
  private dragEndHandler: () => void
  @ContentChildren(DragHandlerDirective, {descendants: true}) private handlers: QueryList<DragHandlerDirective>

  constructor(
    private el: ElementRef,
    private rd2: Renderer2,
    @Inject(PLATFORM_ID) private platform: object,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngAfterViewInit(): void {
    this.hostEl = this.el.nativeElement
    this.setHandlerMouseStyle()
  }

  private setHandlerMouseStyle(): void {
    if (this.handlers) {
      this.handlers.forEach(item => this.rd2.setStyle(item.el.nativeElement, 'cursor', 'move'))
    } else {
      this.rd2.setStyle(this.hostEl, 'cursor', 'move')
    }
  }

  @HostListener('mousedown', ['$event'])
  dragStart(event: MouseEvent): void {
    if (isPlatformBrowser(this.platform)) {
      const allowDrag = event.button === 0 &&
        (!this.handlers.length || this.handlers.some(item => item.el.nativeElement.contains(event.target)))
      if (allowDrag) {
        event.preventDefault()
        event.stopPropagation()
        const {left, top} = this.hostEl.getBoundingClientRect()
        this.startPosition = {
          x: event.clientX,
          y: event.clientY,
          left,
          top
        }
        this.toggleMoving(true)
      }
    }
  }

  toggleMoving(movable: boolean): void {
    this.movable = movable
    if (movable) {
      this.dragMoveHandler = this.rd2.listen(this.doc, 'mousemove', this.dragMove.bind(this))
      this.dragEndHandler = this.rd2.listen(this.doc, 'mouseup', this.dragEnd.bind(this))
    } else {
      if (this.dragMoveHandler) {
        this.dragMoveHandler()
      }
      if (this.dragEndHandler) {
        this.dragEndHandler()
      }
    }
  }

  dragMove(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    const diffX = event.clientX - this.startPosition.x
    const diffY = event.clientY - this.startPosition.y
    const {left, top} = this.calculate(diffX, diffY)
    this.rd2.setStyle(this.hostEl,'right','unset')
    this.rd2.setStyle(this.hostEl, 'top', top + 'px')
    this.rd2.setStyle(this.hostEl, 'left', left + 'px')
  }

  dragEnd() {
    this.toggleMoving(false)
  }

  calculate(diffX: number, diffY: number): { left: number, top: number } {
    let newLeft = this.startPosition.left + diffX
    let newTop = this.startPosition.top + diffY
    if (this.limitInWindow) {
      const {width, height} = this.hostEl.getBoundingClientRect()
      const maxLeft = this.doc.documentElement.clientWidth - width
      const maxTop = this.doc.documentElement.clientHeight - height
      newLeft = clamp(newLeft,0,maxLeft)
      newTop = clamp(newTop,0,maxTop)
    }
    return {
      left: newLeft,
      top: newTop
    }
  }
}
