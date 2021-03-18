import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  forwardRef, ChangeDetectorRef, TemplateRef
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'xm-rate',
  templateUrl: './rate.component.html',
  styles: [
    `
      .xm-rate-wrap xm-rate-item:last-child .xm-rate-item {
        margin-right: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RateComponent),
      multi: true
    }
  ]
})
export class RateComponent implements OnInit, ControlValueAccessor {
  @Input() tpl:TemplateRef<void>
  @Input() count = 5
  private readonly = false
  startArray: number[] = []
  private hoverValue = 0
  private actualValue = 0
  private hasHalf = false
  rateItemStyles: string[] = ['xm-rate-item']

  constructor(private cdr:ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.updateStartArray()
  }

  private updateStartArray(): void {
    this.startArray = Array(this.count).fill(0).map((item, index) => index)
  }

  rateClick(isHalf: boolean, index: number): void {
    if (this.readonly) {
     return
    }
    this.hoverValue = index + 1
    this.hasHalf = isHalf
    this.setActualValue(isHalf ? index + 0.5 : this.hoverValue)
    this.updateStarStyle()
  }

  private setActualValue(value: number): void {
    if (this.actualValue !== value) {
      this.actualValue = value
      this.onChange(value)
    }
  }

  rateHover(isHalf: boolean, index: number): void {
    if (this.readonly || (this.hoverValue === index + 1 && isHalf === this.hasHalf)) {
      return
    }
    this.hoverValue = index + 1
    this.hasHalf = isHalf
    this.updateStarStyle()
  }

  private updateStarStyle(): void {
    this.rateItemStyles = this.startArray.map(index => {
      const base = 'xm-rate-item'
      const value = index + 1
      let cls = ''
      if (value < this.hoverValue || (!this.hasHalf && value === this.hoverValue)) {
        cls += base + '-full'
      } else if (this.hasHalf && value === this.hoverValue) {
        cls += base + '-half'
      }
      const midCls = this.readonly ? ' xm-rate-item-readonly ' : ' '
      return base + midCls + cls
    })
  }

  rateLeave(): void {
    this.hasHalf = !Number.isInteger(this.actualValue)
    this.hoverValue = Math.ceil(this.actualValue)
    this.updateStarStyle()
  }

  private onChange = (value: number) => {}
  private onTouched = () => {}

  writeValue(value: number): void {
    if (value) {
      this.actualValue = value || 0
      this.rateLeave()
      this.cdr.markForCheck()
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(disabled: boolean): void {
    this.readonly = disabled
  }


}
