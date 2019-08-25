import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'boardbot-extension';
  isDarkTheme: Observable<boolean>;

  constructor(private themeService: ThemeService) { 
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  ngOnInit() {
  }
}
