import {Component, OnInit, ChangeDetectionStrategy, forwardRef} from '@angular/core';
import {CheckboxComponent} from "./checkbox.component";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

export type CheckboxValue = number | string

@Component({
  selector: 'xm-checkbox-group',
  template: `
    <div class="xm-checkbox-group">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .xm-checkbox-group {
        display: inline-block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[
    {
      provide:NG_VALUE_ACCESSOR,
      useExisting:forwardRef(() => CheckboxGroupComponent),
      multi:true
    }
  ]
})
export class CheckboxGroupComponent implements OnInit,ControlValueAccessor {
  private current: CheckboxValue[] = []
  private checkboxes:CheckboxComponent[]= []

  constructor() {}

  private onChanged = (value:CheckboxValue[]) => {}
  private onTouched = () => {}

  ngOnInit(): void {
  }
  updateCheckBox(current:CheckboxValue[]) {
    if (this.checkboxes.length) {
      this.checkboxes.forEach(item => {
        item.writeValue(current.includes(item.value))
      })
    }
    this.current = current
    this.onChanged(this.current)
  }
  addCheckbox(checkbox: CheckboxComponent): void {
    this.checkboxes.push(checkbox)
  }
  handleCheckboxClick(value:CheckboxValue,check:boolean):void {
    const newCurrent = this.current.slice()
    if (check) {
      if (!newCurrent.includes(value)) {
        newCurrent.push(value)
      }
    } else {
      const targetIndex = newCurrent.findIndex(item => item === value)
      if (targetIndex > -1) {
        newCurrent.splice(targetIndex,1)
      }
    }
    this.writeValue(newCurrent)
  }
  writeValue(value: CheckboxValue[]): void {
    if (value) {
      setTimeout(() => {
        this.updateCheckBox(value)
      },0)
    }
  }
  registerOnChange(fn: (value:CheckboxValue[]) => void): void {
    this.onChanged = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }


}
