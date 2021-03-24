import {NgModule, Optional, SkipSelf} from '@angular/core';
import {BrowserModule} from "@angular/platform-browser";
import {AppRoutingModule} from "./app-routing.module";
import { HeaderComponent } from './layouts/header/header.component';
import {BreadcrumbModule} from "./share/components/breadcrumb/breadcrumb.module";
import {HttpClientModule} from "@angular/common/http";
import {PagesModule} from "./pages/pages.module";
import { LoginComponent } from './layouts/login/login.component';
import {ReactiveFormsModule} from "@angular/forms";
import {CheckboxModule} from "./share/components/checkbox/checkbox.module";


@NgModule({
  declarations: [HeaderComponent, LoginComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    PagesModule,
    AppRoutingModule,
    BreadcrumbModule,
    ReactiveFormsModule,
    CheckboxModule,
  ],
  exports: [
    HeaderComponent,
    BreadcrumbModule,
    BrowserModule,
    AppRoutingModule,
    LoginComponent
  ]
})
export class CoreModule {
  constructor(@SkipSelf() @Optional() parentModules: CoreModule) {
    if (parentModules) {
      throw new Error('CoreModule只能被AppModule引入')
    }
  }
}
