import {NgModule} from '@angular/core';
import {StrTplOutletDirective} from './str-tpl-outlet.directive';
import {IconDirective} from './icon/icon.directive';
import {ToggleMoreDirective} from './toggle-more.directive';
import {DragModule} from "./drag/drag.module";
import { ImgLazyDirective } from './img-lazy.directive';


@NgModule({
  declarations: [StrTplOutletDirective, IconDirective, ToggleMoreDirective, ImgLazyDirective],
  imports: [DragModule],
  exports: [StrTplOutletDirective, IconDirective, ToggleMoreDirective, DragModule, ImgLazyDirective]
})
export class DirectivesModule {
}
