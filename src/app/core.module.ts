import {NgModule, Optional, SkipSelf} from '@angular/core';
import {BrowserModule} from "@angular/platform-browser";
import {AppRoutingModule} from "./app-routing.module";
import { HeaderComponent } from './layouts/header/header.component';
import {BreadcrumbModule} from "./share/components/breadcrumb/breadcrumb.module";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {PagesModule} from "./pages/pages.module";
import { LoginComponent } from './layouts/login/login.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CheckboxModule} from "./share/components/checkbox/checkbox.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {InterceptorService} from "./services/apis/interceptor.service";
import {DirectivesModule} from "./share/directives/directives.module";
import {MessageModule} from "./share/components/message/message.module";


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
    BrowserAnimationsModule,
    FormsModule,
    DirectivesModule,
    MessageModule
  ],
  exports: [
    HeaderComponent,
    BreadcrumbModule,
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
    MessageModule
  ],
  providers:[
    {
      provide:HTTP_INTERCEPTORS,
      useClass:InterceptorService,
      multi:true
    }
  ]
})
export class CoreModule {
  constructor(@SkipSelf() @Optional() parentModules: CoreModule) {
    if (parentModules) {
      throw new Error('CoreModule只能被AppModule引入')
    }
  }
}
