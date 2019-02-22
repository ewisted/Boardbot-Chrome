import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PopupInputBuilder } from './popup.input-builder'
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  public videoEndTime;
  public previewing;
  public videoId;
  public port: chrome.runtime.Port;
  public hasSavedStartInput;
  public hasSavedEndInput;
  public inputBuilder = new PopupInputBuilder(this.fb);
  public disabled = true;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) { }
  
  ngOnInit() { 
    // Connect to the currently open window
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      // Esablish a persistant connection to the content script
      this.port = chrome.tabs.connect(tabs[0].id);
      if (this.port) {
        console.log("Popup connected to content script");
        // Listener for all content script replys
        this.setupReplyListener();
        // Get video info
        this.port.postMessage({getVideoInfo: true});
      }
    });
  }

  setupReplyListener() {
    this.port.onMessage.addListener(msg => {
      // Response for video duration
      if (msg.videoInfo) {
        this.videoEndTime = msg.videoInfo.length;
        this.videoId = msg.videoInfo.videoId;
        if (msg.recoverInfo) { 
          this.inputBuilder = new PopupInputBuilder(this.fb, msg.recoverInfo.startSeconds, msg.recoverInfo.endSeconds, msg.recoverInfo.clipName);
          this.previewing = msg.recoverInfo.previewing;
        }
        else {
          this.inputBuilder = new PopupInputBuilder(this.fb, {minutes: 0, seconds: 0, ms: 0}, this.videoEndTime);
        }
        this.inputBuilder.enable();
        this.disabled = false;

        // Really hack-y way of getting the elements to refresh when the popup is loaded
        var el = document.getElementById("startMinutes");
        var evObj = document.createEvent("Events");
        evObj.initEvent("click", true, false);
        el.dispatchEvent(evObj);
      }

      if (msg.previewing != null) {
        this.previewing = msg.previewing;
      }

      if (msg.currentTime && msg.control) {
        this.inputBuilder.setTime(msg.control, msg.currentTime);
        this.save();
      }
    });
  }

  submit() {
    var clipName: string = this.inputBuilder.getClipName();
    if (!clipName) {
      this.snackBar.open("No clip name specified", "Close", {duration: 3000})
      return;
    }
    if (!this.inputBuilder.isStartTimeValid()) {
      this.snackBar.open("Clip cannot be less than 500ms", "Close", {duration: 3000})
      return;
    }
    if (!this.inputBuilder.isEndTimeValid(this.videoEndTime)) {
      this.snackBar.open("Clip end time cannot exceed video duration", "Close", {duration: 3000});
      return;
    }
    var startTimeValue = this.inputBuilder.getValue("startTime");
    var endTimeValue = this.inputBuilder.getValue("endTime");
    var startMinutes = this.prependZero(startTimeValue.minutes);
    var startSeconds = this.prependZero(startTimeValue.seconds);
    var startTimeString = startMinutes + ":" + startSeconds + "." + startTimeValue.ms;
    var endMinutes = this.prependZero(endTimeValue.minutes);
    var endSeconds = this.prependZero(endTimeValue.seconds);
    var endTimeString = endMinutes + ":" + endSeconds + "." + endTimeValue.ms;
    clipName = clipName.trim().replace(/\s+/g, '-').toLowerCase();

    var commandString = "@Boardbot add-clip " + clipName + " " + this.videoId + " " + startTimeString + " " + endTimeString;

    var sb = this.snackBar.open(commandString, "Copy To Clipboard", {duration: 3000});

    sb.onAction().subscribe(() => {
      document.addEventListener('copy', (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', (commandString));
        e.preventDefault();
        document.removeEventListener('copy', null);
      });
      document.execCommand('copy');
    });
  }

  prependZero(n) {
    return ("" + n).slice(-2);
  }

  save() {
    // Get the start and end times from their respective form groups
    var startSeconds = this.inputBuilder.getSeconds("startTime");
    var endSeconds = this.inputBuilder.getSeconds("endTime");
    var clipName = this.inputBuilder.getClipName();
    
    this.port.postMessage({save: true, startSeconds: startSeconds, endSeconds: endSeconds, clipName: clipName});
  }

  previewClip() {
    if (this.previewing) {
      this.port.postMessage({stopClip: true});
      return;
    }
    if (!this.inputBuilder.isStartTimeValid()) {
      this.snackBar.open("Clip cannot be less than 500ms", "Close", {duration: 3000})
      return;
    }
    if (!this.inputBuilder.isEndTimeValid(this.videoEndTime)) {
      this.snackBar.open("Clip end time cannot exceed video duration", "Close", {duration: 3000});
      return;
    }

    // Get the start and end times from their respective form groups
    var startSeconds = this.inputBuilder.getSeconds("startTime");
    var endSeconds = this.inputBuilder.getSeconds("endTime");
    var clipTimeMs = (endSeconds - startSeconds) * 1000;

    // Send bot a message to play at the start time
    this.port.postMessage({playClip: clipTimeMs, startSeconds: startSeconds});
    return;
  }

  getCurrentTime(control: string) {
    this.port.postMessage({getCurrentTime: control});
    return;
  }

  // For some reason, angular allows for '+' and '-' in number input fields. This is a fix for that.
  onKeyDown(e: any){
    const pattern = /[0-9]/g;
    if (!pattern.test(e.key)) {
      // Input was not a number
      if (e.key == "Backspace") return;
      e.preventDefault();
    }
    return;
  }
}
