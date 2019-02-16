import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.css']
})
export class EventPageComponent implements OnInit {

  constructor() { 
    chrome.runtime.onInstalled.addListener(function() {
      chrome.storage.sync.set({theme: 'light'}, function() {
        console.log('Default theme set to light');
      });
      chrome.storage.sync.set({enabled: true}, function() {
        console.log('State set to enabled');
      });
    });
  }

  ngOnInit() {
  }

}
