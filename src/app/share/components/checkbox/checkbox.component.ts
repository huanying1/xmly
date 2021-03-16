import {
  ChangeDetectionStrategy,
  Component,
  forwardRef, HostBinding, HostListener, Input,
  OnInit, Optional,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CheckboxGroupComponent} from "./checkbox-group.component";

@Component({
  selector: '[xm-checkbox]',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[
    {
      provide:NG_VALUE_ACCESSOR,
      useExisting:forwardRef(() => CheckboxComponent),
      multi:true
    }
  ],
  encapsulation:ViewEncapsulation.None
})
export class CheckboxComponent implements OnInit,ControlValueAccessor {
  @HostBinding('class.xm-checkbox-wrap') checkedClass = true
  @HostBinding('class.checked') checked = false
  @HostBinding('class.disabled') disabled = false

  @Input() value

  constructor(@Optional() private parent:CheckboxGroupComponent) { }

  ngOnInit(): void {
    if (this.parent) {
      this.parent.addCheckbox(this)
    }
  }
  @HostListener('click',['$event'])
  hostClick(e:MouseEvent):void {
    e.preventDefault()
    if (!this.disabled) {
      this.checked = !this.checked
      this.onChanged(this.checked)
    }
    if (this.parent) {
      this.parent.handleCheckboxClick(this.value,this.checked)
    }
  }

  private onChanged = (value:boolean) => {}
  private onTouched = () => {}

  writeValue(value: boolean): void {
    this.checked = value
  }

  registerOnChange(fn: (value:boolean) => void): void {
    this.onChanged = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled
  }

}
