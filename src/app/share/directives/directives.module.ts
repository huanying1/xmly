import { NgModule } from '@angular/core';
import { StrTplOutletDirective } from './str-tpl-outlet.directive';
import { IconDirective } from './icon/icon.directive';
import { ToggleMoreDirective } from './toggle-more.directive';



@NgModule({
  declarations: [StrTplOutletDirective, IconDirective, ToggleMoreDirective],
  exports:[StrTplOutletDirective,IconDirective,ToggleMoreDirective]
})
export class DirectivesModule { }
