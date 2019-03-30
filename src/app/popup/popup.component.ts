import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PopupInputBuilder } from './popup.input-builder'
import { MatSnackBar } from '@angular/material';
import { isNullOrUndefined } from 'util';
import { ActionTypes } from 'content-script/action-types';
import { GetVideoResponse, PreviewingResponse, GetCurrentTimeResponse } from 'content-script/response-messages';
import { SaveRequest, StopPreviewingRequest, StartPreviewingRequest, GetCurrentTimeRequest, GetVideoRequest } from 'content-script/request-messages';

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
   * Property video preview button is bound to, determines if the user is previewing or not
   */
  public previewing: boolean;
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
  public inputBuilder = new PopupInputBuilder(this.fb);
  /**
   * If the clip maker should be disabled
   * Defaults to true but is updated if a content script is loaded
   */
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
        this.port.postMessage(new GetVideoRequest());
      }
    });
  }

  setupReplyListener() {
    this.port.onMessage.addListener(msg => {
      console.log(msg);
      switch (msg.ActionType) {

        case ActionTypes.GetVideo:
          this.inputBuilder = new PopupInputBuilder(this.fb, msg.StartSeconds, msg.EndSeconds, msg.ClipName)
          this.setPreviewingState(msg.Previewing);
          this.inputBuilder.enable();
          this.disabled = false;
          this.videoEndTime = msg.Duration;
          this.videoId = msg.VideoId;

          // Really hack-y way of getting the elements to refresh when the popup is loaded
          var el = document.getElementById("startMinutes");
          var evObj = document.createEvent("Events");
          evObj.initEvent("click", true, false);
          evObj.initEvent("blur", true, false);
          el.dispatchEvent(evObj);
          break;

        case ActionTypes.PreviewingChanged:
          this.setPreviewingState(msg.Previewing);
          break;

        case ActionTypes.GetCurrentTime:
          this.inputBuilder.setTime(msg.Control, msg.CurrentTime);
          this.save();
          break;
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

  getEndTime() {
    this.inputBuilder.setTime("endTime", this.videoEndTime);
    return;
  }

  prependZero(n) {
    return ("" + n).slice(-2);
  }

  save() {
    // Get the start and end times from their respective form groups
    var startSeconds = this.inputBuilder.getSeconds("startTime");
    var endSeconds = this.inputBuilder.getSeconds("endTime");
    var clipName = this.inputBuilder.getClipName();
    
    this.port.postMessage(new SaveRequest(startSeconds, endSeconds, clipName));
  }

  previewClip() {
    if (this.previewing) {
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
    this.port.postMessage(new StartPreviewingRequest(clipTimeMs, startSeconds));
    return;
  }

  // TODO: This method doesn't really need to exist, need to figure out why DOM elements aren't updating on variable change
  setPreviewingState(previewing: boolean) {
    console.log("Previewing: " + previewing);
    this.previewing = previewing;
    // Really hack-y way of getting the preview button color to refresh on variable change. Idk why it only updates on blur or click
    var el = document.getElementById("startMinutes");
    var evObj = document.createEvent("Events");
    evObj.initEvent("click", true, false);
    evObj.initEvent("blur", true, false);
    el.dispatchEvent(evObj);
  }

  getCurrentTime(control: string) {
    this.port.postMessage(new GetCurrentTimeRequest(control));
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
