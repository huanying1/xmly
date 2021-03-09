import { NgModule } from '@angular/core';
import {TagComponent} from "./tag.component";
import {DirectivesModule} from "../../directives/directives.module";
import {CommonModule} from "@angular/common";



@NgModule({
  declarations: [TagComponent],
  imports: [
    DirectivesModule,
    CommonModule
  ],
  exports:[TagComponent]
})
export class TagModule { }
