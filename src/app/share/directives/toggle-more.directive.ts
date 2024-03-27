import {Directive, ElementRef, EventEmitter, Input, OnChanges, Output, Renderer2, SimpleChanges} from '@angular/core';
import {timer} from "rxjs";

@Directive({
  selector: '[xmToggleMore]'
})
export class ToggleMoreDirective implements OnChanges{
  @Input() content:string
  @Input() isFull = false
  @Input('xmToggleMore') maxHeight = 0
  private trueHeight = this.maxHeight
  @Output() initTrueHeight = new EventEmitter<number>()
  constructor(private el:ElementRef,private rd2:Renderer2) {

  }
  ngOnChanges(changes: SimpleChanges) {
    const {content,isFull} = changes
    timer(100).subscribe(()=>{
      if (content?.currentValue) {
        this.trueHeight = this.hiddenDomRect(this.el.nativeElement).height
        this.initTrueHeight.emit(this.trueHeight)
      }
    })
    if (isFull) {
      const maxHeight = isFull.currentValue ? this.trueHeight : this.maxHeight
      this.rd2.setStyle(this.el.nativeElement,'maxHeight',maxHeight + 'px')
    }
  }

  //获取隐藏元素尺寸
  private hiddenDomRect(dom:HTMLElement):DOMRect {
    const cloneNode = dom.cloneNode(true) as HTMLElement
    this.rd2.setStyle(cloneNode,'position','absolute')
    this.rd2.setStyle(cloneNode,'visibility','hidden')
    this.rd2.setStyle(cloneNode,'pointerEvents','node')
    this.rd2.setStyle(cloneNode,'maxHeight','unset')
    this.rd2.appendChild(dom.parentNode,cloneNode)
    const rect = cloneNode.getBoundingClientRect()
    this.rd2.removeChild(dom.parentNode,cloneNode)
    return rect
  }
}
