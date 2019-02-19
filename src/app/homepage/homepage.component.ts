import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  public toggleState: HTMLElement;
  public availableThemes = ["light", "dark"];
  public selectedTheme;

  constructor(private snackBar: MatSnackBar) { 
  }

  ngOnInit() {
    this.toggleState = document.getElementById('toggle-state');

    this.toggleState.onclick = function() {
      // Get the current enabled state from chrome storage
      chrome.storage.sync.get(['enabled'], function(data) {
        // If the extension state is currently enabled, set it to disabled
        if (data.enabled == true) {
          chrome.storage.sync.set({enabled: false}, function() {
              // Set the icon to reflect the change
              chrome.browserAction.setIcon({
                path : "assets/discord-icon-disabled16.png"
              });
              // Send a message to the content script on the currently open tab to hide our ui if it exists
              // TODO: find a way to send the message to all open tabs with our content script running
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {enabled: false});
              });
          });
        }
        // If the extension state is currently disabled, set it to enabled
        if (data.enabled == false) {
          chrome.storage.sync.set({enabled: true}, function() {
              // Set the icon to reflect the change
              chrome.browserAction.setIcon({
                path : "assets/discord-icon-active16.png"
              });
              // Send a message to the content script on the currently open tab to show our ui if it has a video
              // TODO: find a way to send the message to all open tabs with our content script running
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {enabled: true});
              });
          });
        }
      });
    };
  }

  updateTheme(theme: string) {
    chrome.storage.sync.set({theme: theme});
    this.snackBar.open(theme, "Close");
  }
}