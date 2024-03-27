import {Directive, ElementRef, HostBinding, Input, OnChanges, Renderer2, SimpleChanges} from '@angular/core';
import {IconType} from "./types";

@Directive({
  selector: 'i[xmIcon]',
})
export class IconDirective implements OnChanges {
  @HostBinding('class.iconfont') readonly hostClass = true
  @Input('xmIcon') type: IconType

  constructor(private el: ElementRef, private rd2: Renderer2) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {type} = changes
    if (type.previousValue) {
      this.rd2.removeClass(this.el.nativeElement, 'icon-' + type.previousValue)
    }
    this.rd2.addClass(this.el.nativeElement, 'icon-' + this.type)
  }

}
