import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { BotNameService } from './services/bot-name.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [ThemeService, BotNameService]
})
export class CoreModule { }
