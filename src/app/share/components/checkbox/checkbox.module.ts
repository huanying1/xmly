import { NgModule } from '@angular/core';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxGroupComponent } from './checkbox-group.component';



@NgModule({
  declarations: [CheckboxComponent, CheckboxGroupComponent],
  exports:[CheckboxComponent, CheckboxGroupComponent]
})
export class CheckboxModule { }
