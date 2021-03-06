import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { EventPageComponent } from './event-page/event-page.component';
import { PopupComponent } from './popup/popup.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ExtensionMaterialModule } from './extension-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    EventPageComponent,
    PopupComponent
  ],
  imports: [
    CoreModule,
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ExtensionMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
