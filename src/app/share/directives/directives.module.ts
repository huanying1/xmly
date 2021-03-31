import {NgModule} from '@angular/core';
import {StrTplOutletDirective} from './str-tpl-outlet.directive';
import {IconDirective} from './icon/icon.directive';
import {ToggleMoreDirective} from './toggle-more.directive';
import {DragModule} from "./drag/drag.module";


@NgModule({
  declarations: [StrTplOutletDirective, IconDirective, ToggleMoreDirective],
  imports: [DragModule],
  exports: [StrTplOutletDirective, IconDirective, ToggleMoreDirective, DragModule]
})
export class DirectivesModule {
}
