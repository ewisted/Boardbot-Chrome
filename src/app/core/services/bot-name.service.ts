import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class BotNameService {
  private _botName: BehaviorSubject<string> = new BehaviorSubject<string>("BoardBot");;
  public botName: Observable<string> = this._botName.asObservable();

  constructor() {
    chrome.storage.sync.get(['botName'], (data) => {
      this._botName.next(data.botName != null ? data.botName : "BoardBot");
    });
    chrome.storage.onChanged.addListener((changes) => {
      var storageChange = changes['botName'];
      if (storageChange != null) {
        this._botName.next(storageChange.newValue);
      }
    });
  }

  getCurrentState(): string {
    return this._botName.value;
  }

  setBotName(botName: string) {
    chrome.storage.sync.set({botName: botName});
    this._botName.next(botName);
  }
}