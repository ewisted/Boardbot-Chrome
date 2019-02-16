import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { EventPageComponent } from './event-page/event-page.component';
import { PopupComponent } from './popup/popup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtensionMaterialModule } from './extension-material-module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    EventPageComponent,
    PopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ExtensionMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
