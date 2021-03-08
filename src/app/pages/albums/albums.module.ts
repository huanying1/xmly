import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlbumsRoutingModule } from './albums-routing.module';
import { AlbumsComponent } from './albums.component';
import {DirectivesModule} from "../../share/directives/directives.module";
import {PiPesModule} from "../../share/pipes/pipes.module";


@NgModule({
  declarations: [AlbumsComponent],
  imports: [
    CommonModule,
    AlbumsRoutingModule,
    DirectivesModule,
    PiPesModule
  ],
  exports:[]
})
export class AlbumsModule { }
