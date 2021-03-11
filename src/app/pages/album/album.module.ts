import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlbumRoutingModule } from './album-routing.module';
import { AlbumComponent } from './album.component';
import {TagModule} from "../../share/components/tag/tag.module";
import {DirectivesModule} from "../../share/directives/directives.module";
import {PiPesModule} from "../../share/pipes/pipes.module";


@NgModule({
  declarations: [AlbumComponent],
  imports: [
    CommonModule,
    AlbumRoutingModule,
    TagModule,
    DirectivesModule,
    PiPesModule
  ]
})
export class AlbumModule { }
