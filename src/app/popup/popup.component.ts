import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TimeInputBuilder } from './builders/time-input-builder'
import { MatSnackBar } from '@angular/material';
import { isNullOrUndefined } from 'util';
import { ActionTypes } from 'content-script/action-types';
import { CommandStringBuilder } from './builders/command-string-builder';
import { TrackPreviewBuilder } from './builders/track-preview-builder';
import { PreviewingResponse, GetCurrentTimeResponse } from 'content-script/response-messages';
import { SaveRequest, StopPreviewingRequest, StartPreviewingRequest, GetCurrentTimeRequest, SyncRequest } from 'content-script/request-messages';
import { timer, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  /**
   * End time of the video in seconds
   */
  public videoEndTime: number;
  /**
   * The current tabs youtube video id, if it exists
   */
  public videoId: string;
  /**
   * Port object used to communicate with the youtube script
   */
  public port: chrome.runtime.Port;
  /**
   * Builds and controls the inputs for start and end time
   */
  public inputBuilder = new TimeInputBuilder(this.fb);
  /**
   * If the clip maker should be disabled
   * Defaults to true but is updated if a content script is loaded
   */
  public disabled = true;
  /**
   * Builds and controls clip preview state
   */
  public previewBuilder = new TrackPreviewBuilder();

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
        this.port.postMessage(new SyncRequest());
      }
    });
  }

  setupReplyListener() {
    this.port.onMessage.addListener(msg => {
      switch (msg.ActionType) {

        case ActionTypes.Sync:
          this.videoEndTime = msg.Duration;
          this.videoId = msg.VideoId;
          this.inputBuilder.setTime(msg.StartSeconds, msg.EndSeconds);
          this.inputBuilder.setClipName(msg.ClipName);
          this.disabled = false;
          this.inputBuilder.enable();
          this.refreshDOM();
          break;

        case ActionTypes.PreviewingChanged:
          if (msg.Previewing && msg.ClipTimeMs > 0) {
            if (msg.MsIntoClip > 0) this.previewBuilder.trackPreviewProgress(msg.ClipTimeMs, msg.MsIntoClip);
            else this.previewBuilder.trackPreviewProgress(msg.ClipTimeMs);
          }
          else {
            this.previewBuilder.stopPreviewing();
          }
          break;

        case ActionTypes.GetCurrentTime:
          this.inputBuilder.setTime(msg.Control, msg.CurrentTime);
          this.save();
          break;
      }
    });
  }

  submit() {
    // If clip name is empty, open a snackbar with error message
    var clipName: string = this.inputBuilder.getClipName();
    if (!clipName) {
      this.snackBar.open("No clip name specified", "Close", {duration: 3000})
      return;
    }
    // If the start time is invalid, open a snackbar with error message
    if (!this.inputBuilder.isStartTimeValid()) {
      this.snackBar.open("Clip start time is invalid", "Close", {duration: 3000})
      return;
    }
    // if the end time is invalid, open a snackbar with error message
    if (!this.inputBuilder.isEndTimeValid(this.videoEndTime)) {
      this.snackBar.open("Clip end time is invalid", "Close", {duration: 3000});
      return;
    }

    // Build the command string
    var commandString = new CommandStringBuilder(clipName, this.videoId, this.inputBuilder.getSeconds("startTime"), this.inputBuilder.getSeconds("endTime")).build();

    // Send it to a snackbar
    var sb = this.snackBar.open(commandString, "Copy To Clipboard", {duration: 3000});

    // On button press, copy command string to users clipboard
    sb.onAction().subscribe(() => {
      document.addEventListener('copy', (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', (commandString));
        e.preventDefault();
        document.removeEventListener('copy', null);
      });
      document.execCommand('copy');
    });
  }

  save() {
    // Get the start and end times from their respective form groups
    var startSeconds = this.inputBuilder.getSeconds("startTime");
    var endSeconds = this.inputBuilder.getSeconds("endTime");
    var clipName = this.inputBuilder.getClipName();
    
    this.port.postMessage(new SaveRequest(startSeconds, endSeconds, clipName));
  }

  previewClip() {
    if (this.previewBuilder.previewing) {
      this.port.postMessage(new StopPreviewingRequest());
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
    this.port.postMessage(new StartPreviewingRequest(clipTimeMs, startSeconds, endSeconds));
    return;
  }

  // Really hack-y way of getting the preview button color to refresh on variable change
  // I've spent hours trying to figure out why ui elements don't update, and it might have to do with how gulp compiles the angular app to javascript
  refreshDOM() {
    var el = document.getElementById("startMinutes");
    var evObj = document.createEvent("Events");
    evObj.initEvent("click", true, false);
    evObj.initEvent("blur", true, false);
    el.dispatchEvent(evObj);
    return;
  }

  getCurrentTime(control: string) {
    this.port.postMessage(new GetCurrentTimeRequest(control));
    return;
  }

  getEndTime() {
    this.inputBuilder.setTime("endTime", this.videoEndTime);
    this.save();
    return;
  }

  // For some reason, angular allows for '+' and '-' in number input fields. This is a fix for that.
  onKeyDown(e: any){
    const pattern = /[0-9]/g;
    if (!pattern.test(e.key)) {
      // Input was not a number
      switch (e.key) {
        case "Backspace": return;
        case "ArrowLeft": return;
        case "ArrowRight": return;
        case "ArrowDown": return;
        case "ArrowUp": return;
        case "Tab": return;
        default: e.preventDefault();
      }
    }
    return;
  }
}
