import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ThemeService } from '../core/services/theme.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BotNameService } from '../core/services/bot-name.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  public toggleState: HTMLElement;
  isDarkTheme: Observable<boolean>;
  botNameInput: FormGroup;
  botName: Observable<string>;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private themeService: ThemeService, private botNameService: BotNameService) {
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.botName = this.botNameService.botName;
    this.botNameInput = this.fb.group({
      botName: [{value: this.botNameService.getCurrentState(), disabled: false}, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
    this.refreshDOM();
  }

  refreshDOM() {
    this.toggleState = document.getElementById("bot-name");
    var evObj = document.createEvent("Events");
    evObj.initEvent("click", true, false);
    evObj.initEvent("blur", true, false);
    this.toggleState.dispatchEvent(evObj);
  }

  save() {
    this.botNameService.setBotName(this.botNameInput.get("botName").value);
  }
}
