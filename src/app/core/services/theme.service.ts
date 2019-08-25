import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ThemeService {
  private _darkTheme: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);;
  public isDarkTheme: Observable<boolean> = this._darkTheme.asObservable();

  constructor() {
    chrome.storage.sync.get(['isDarkTheme'], (data) => {
      this._darkTheme.next(data.isDarkTheme != null ? data.isDarkTheme : false);
      var refreshEle = document.getElementById("bot-name");
      if (refreshEle) {
        var evObj = document.createEvent("Events");
        evObj.initEvent("click", true, false);
        evObj.initEvent("blur", true, false);
        refreshEle.dispatchEvent(evObj);
      }
    });
    chrome.storage.onChanged.addListener((changes) => {
      var storageChange = changes['isDarkTheme'];
      if (storageChange != null) {
        this._darkTheme.next(storageChange.newValue);
      }
    });
  }

  getCurrentState(): boolean {
    return this._darkTheme.value;
  }

  setDarkTheme(isDarkTheme: boolean) {
    chrome.storage.sync.set({isDarkTheme: isDarkTheme});
    this._darkTheme.next(isDarkTheme);
  }
}
