import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ThemeService } from '../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  public toggleState: HTMLElement;
  isDarkTheme: Observable<boolean>;

  constructor(private snackBar: MatSnackBar, private themeService: ThemeService) {
    
  }

  ngOnInit() {
    this.toggleState = document.getElementById("theme-toggle");
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.toggleState.blur();
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
    document.getElementById("theme-toggle").blur();
  }
}
