import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ThemeService {
  private _darkTheme: Subject<boolean> = new Subject<boolean>();
  isDarkTheme = this._darkTheme.asObservable();

  constructor() {
    chrome.storage.sync.get(['isDarkTheme'], (data) => {
      this._darkTheme.next(data.isDarkTheme != null ? data.isDarkTheme : false);
    });
    chrome.storage.onChanged.addListener((changes) => {
      var storageChange = changes['isDarkTheme'];
      if (storageChange != null) {
        this._darkTheme.next(storageChange.newValue);
      }
    });
  }

  setDarkTheme(isDarkTheme: boolean) {
    chrome.storage.sync.set({isDarkTheme: isDarkTheme});
  }
}
