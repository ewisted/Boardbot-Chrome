import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TimeInputValidators, ConfirmValidParentMatcher } from './popup.validators';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  public videoEndTime;
  public videoId;
  public port: chrome.runtime.Port;
  public timeInput: FormGroup;
  public hasSavedStartInput;
  public hasSavedEndInput;
  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  public nameInput = this.fb.group({
    clipName: ['', Validators.compose([Validators.required])]
  });

  constructor(private fb: FormBuilder, private validators: TimeInputValidators) { }

  ngOnInit() { 
    // Connect to the currently open window
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      // Esablish a persistant connection to the content script
      this.port = chrome.tabs.connect(tabs[0].id);
      console.log("Popup connected to content script");
      // Listener for all content script replys
      this.setupReplyListener();
      // Get video info
      this.port.postMessage({getVideoInfo: true});
    });
  }

  setupReplyListener() {
    this.port.onMessage.addListener(msg => {
      // Response for video duration
      if (msg.videoInfo) {
        this.videoEndTime = msg.videoInfo.length;
        this.videoId = msg.videoInfo.videoId;
        this.timeInput = this.fb.group({
        startTime: this.fb.group({
          minutes: ['', Validators.compose([Validators.required])],
          seconds: ['', Validators.compose([Validators.required])],
          ms: ['', Validators.compose([Validators.required])]
        }),
        endTime: this.fb.group({
          minutes: ['', Validators.compose([Validators.required])],
          seconds: ['', Validators.compose([Validators.required])],
          ms: ['', Validators.compose([Validators.required])]
        })
        }, { 
          validators: [
              this.validators.startTimeValidator(), 
              this.validators.endTimeValidator(this.videoEndTime)
            ] 
          }
        );
        chrome.storage.sync.get(['startTime', 'endTime', 'clipName'], items => {
          if (items.startTime) {
            console.log("Restoring previous start input data...");
            this.hasSavedStartInput = true;
            this.timeInput.controls['startTime'].setValue(items.startTime);
          }
          if (items.endTime) {
            console.log("Restoring previous end input data...");
            this.hasSavedEndInput = true;
            this.timeInput.controls['endTime'].setValue(items.endTime);
          }
          if (items.clipName) {
            console.log("Restoring previous name input...");
            this.nameInput.setValue({clipName: items.clipName});
          }
        });
        if (!this.hasSavedEndInput || !this.hasSavedStartInput) {
          var minutes = Math.floor(msg.length / 60);
          var seconds = Math.floor(msg.length % 60);
          var ms = +(msg.length % 1).toFixed(3) * 1000;    
          this.timeInput.controls["endTime"].setValue({minutes: minutes, seconds: seconds, ms: ms});
          this.timeInput.controls["startTime"].setValue({minutes: 0, seconds: 0, ms: 0});
          console.log(JSON.stringify(this.timeInput.value) + this.videoId);
        }
      } 

      if (msg.previewing != null) {
        console.log(msg.previewing);
        chrome.storage.sync.set({previewing: msg.previewing});
      }

      if (msg.currentTime && msg.control) {
        var minutes = Math.floor(msg.currentTime / 60);
        var seconds = Math.floor(msg.currentTime % 60);
        var ms = +(msg.currentTime % 1).toFixed(3) * 1000;  
        this.timeInput.controls[msg.control].setValue({minutes: minutes, seconds: seconds, ms: ms});
        this.save();
      }
    });
  }

  submit() {
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    var startMinutes = this.prependZero(startTimeValue.minutes);
    var startSeconds = this.prependZero(startTimeValue.seconds);
    var startTimeString = startMinutes + ":" + startSeconds + "." + startTimeValue.ms;
    var endMinutes = this.prependZero(endTimeValue.minutes);
    var endSeconds = this.prependZero(endTimeValue.seconds);
    var endTimeString = endMinutes + ":" + endSeconds + "." + endTimeValue.ms;
    var commandString = "@Boardbot add-clip " + this.nameInput.get('clipName').value + " " + this.videoId + " " + startTimeString + " " + endTimeString;

    console.log(commandString);

    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (commandString));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

  prependZero(n) {
    return ("" + n).slice(-2);
  }

  save() {
    // Get the start and end times from their respective form groups
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    var clipName = this.nameInput.get("name").value;
    chrome.storage.sync.set({
      startTime: {
        minutes: startTimeValue.minutes, 
        seconds: startTimeValue.seconds, 
        ms: startTimeValue.ms
      }, 
      endTime: {
        minutes: endTimeValue.minutes, 
        seconds: endTimeValue.seconds, 
        ms: endTimeValue.ms
      },
      clipName: clipName
    }, () => {
      console.log("Input saved");
    });
  }

  showErrors() {
    var errors = this.timeInput.errors;
    console.log(JSON.stringify(errors));
  }

  previewClip() {
    // Get the start and end times from their respective form groups
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = (endTimeValue.minutes * 60) + endTimeValue.seconds + (endTimeValue.ms / 1000);
    var startTime = (startTimeValue.minutes * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);

    if (endTime <= startTime) {
      console.log("Start time cannot be less than end time");
      return;
    }
    var clipTimeMs = (endTime - startTime) * 1000;
    chrome.storage.sync.get(['previewing'], value => {
      // Send bot a message to play at the start time
      if (value.previewing) {
        this.port.postMessage({stopClip: true});
      }
      else {
        this.port.postMessage({playClip: clipTimeMs, startTime: startTime});
      }
    });
  }

  getCurrentTime(control: string) {
    this.port.postMessage({getCurrentTime: control});
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

  // <summary>
  // These functions are for setting max values for the input field arrows
  // </summary>
  startMinutesMax() {
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    if (((startTimeValue.minutes + 1) * 60 + startTimeValue.seconds +  startTimeValue.ms / 1000) < (endTimeValue.minutes * 60 + endTimeValue.seconds + endTimeValue.ms / 1000)) {
      // Hardcoded at 10 hours max video length
      return 600;
    }
    else {
      return startTimeValue.minutes;
    }
  }

  startSecondsMax() {
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    if ((startTimeValue.minutes * 60 + (startTimeValue.seconds + 1) +  startTimeValue.ms / 1000) < (endTimeValue.minutes * 60 + endTimeValue.seconds + endTimeValue.ms / 1000)) {
      return 59;
    }
    else {
      return startTimeValue.seconds;
    }
  }

  startMsMax() {
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    if ((startTimeValue.minutes * 60 + startTimeValue.seconds +  (startTimeValue.ms + 1) / 1000) < (endTimeValue.minutes * 60 + endTimeValue.seconds + endTimeValue.ms / 1000)) {
      return 999;
    }
    else {
      return startTimeValue.ms;
    }
  }

  endMinutesMax() {
    var endTimeValue = this.timeInput.get("endTime").value;
    if (((endTimeValue.minutes + 1) * 60 + endTimeValue.seconds + endTimeValue.ms / 1000) <= this.videoEndTime) {
      // Hardcoded at 10 hours max video length
      return 600;
    }
    else {
      return endTimeValue.minutes;
    }
  }

  endSecondsMax() {
    var endTimeValue = this.timeInput.get("endTime").value;
    if ((endTimeValue.minutes * 60 + (endTimeValue.seconds + 1) + endTimeValue.ms / 1000) <= this.videoEndTime) {
      return 59;
    }
    else {
      return endTimeValue.seconds;
    }
  }

  endMsMax() {
    var endTimeValue = this.timeInput.get("endTime").value;
    if ((endTimeValue.minutes * 60 + endTimeValue.seconds + (endTimeValue.ms + 1) / 1000) <= this.videoEndTime) {
      return 999;
    }
    else {
      return endTimeValue.ms;
    }
  }

  endMinutesMin() {
    // Get the start and end times from their respective form groups
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = (endTimeValue.minutes - 1) * 60 + endTimeValue.seconds + (endTimeValue.ms / 1000);
    var startTime = (startTimeValue.minutes * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);
    if (endTime > startTime) {
      return 0;
    }
    else {
      return endTimeValue.minutes;
    }
  }

  endSecondsMin() {
    // Get the start and end times from their respective form groups
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = (endTimeValue.minutes * 60) + (endTimeValue.seconds - 1) + (endTimeValue.ms / 1000);
    var startTime = (startTimeValue.minutes * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);
    if (endTime > startTime) {
      return 0;
    }
    else {
      return endTimeValue.seconds;
    }
  }

  endMsMin() {
    // Get the start and end times from their respective form groups
    var startTimeValue = this.timeInput.get("startTime").value;
    var endTimeValue = this.timeInput.get("endTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = (endTimeValue.minutes * 60) + endTimeValue.seconds + ((endTimeValue.ms - 1) / 1000);
    var startTime = (startTimeValue.minutes * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);
    if (endTime > startTime) {
      return 0;
    }
    else {
      return endTimeValue.ms;
    }
  }

  // <summary>
  // These functions serve to track user input and make sure its always a possible clip
  // </summary>
  // TODO: These are only checking the max time, they also need to make sure the clip end time isn't before the start time
  onStartMinutesInput(event: any) {
    // Return if the key pressed was backspace
    if (event.key == "Backspace") {
      return;
    }
    // Get the newly entered value as a number
    var value = +event.target.value;
    // Get the start and end times from their respective form groups
    var endTimeValue = this.timeInput.get("endTime").value;
    var startTimeValue = this.timeInput.get("startTime").value;
    // Calculate the end time of the clip in seconds
    var endTime = (endTimeValue.minutes * 60) + endTimeValue.seconds + (endTimeValue.ms / 1000);
    var startTime = (value * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);
    if (startTime >= endTime) {
      // Calculate the highest number of possible minutes to start from
      var maxMinutes = Math.floor((endTime - startTimeValue.seconds - (startTimeValue.ms / 1000)) / 60);
      this.timeInput.controls["startTime"].setValue({minutes: maxMinutes, seconds: startTimeValue.seconds, ms: startTimeValue.ms});
      return;
    }
  }

  onStartSecondsInput(event: any) {
    // Return if the key pressed was backspace
    if (event.key == "Backspace") {
      return;
    }
    // Get the newly entered value as a number
    var value = +event.target.value;
    // Get the start and end times from their respective form groups
    var endTimeValue = this.timeInput.get("endTime").value;
    var startTimeValue = this.timeInput.get("startTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = (endTimeValue.minutes * 60 + endTimeValue.seconds + endTimeValue.ms / 1000);
    var startTime = startTimeValue.minutes * 60 + value + (startTimeValue.ms / 1000);
    // The clip cannot start after it ends
    if (startTime >= endTime) {
      // Calculate the max amount of seconds allowed by subtracting the other start time input values from the end time
      var maxSeconds = Math.floor(endTime - startTimeValue.minutes * 60 - (startTimeValue.ms / 1000));
      if (maxSeconds / 60 >= 1) {
        // This is so we're not accepting anything greater than or equal to a second as input
        this.timeInput.controls["startTime"].setValue({minutes: startTimeValue.minutes, seconds: 59, ms: startTimeValue.ms});
        return;
      }
      // This is so we're not accepting anything greater than or equal to a second as input
      this.timeInput.controls["startTime"].setValue({minutes: startTimeValue.minutes, seconds: maxSeconds, ms: startTimeValue.ms});
    }
    return;
  }

  onStartMsInput(event: any) {
    // Return if the key pressed was backspace
    if (event.key == "Backspace") {
      return;
    }
    // Get the newly entered value as a number
    var value = +event.target.value;
    // Get the start and end times from their respective form groups
    var endTimeValue = this.timeInput.get("endTime").value;
    var startTimeValue = this.timeInput.get("startTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = endTimeValue.minutes * 60 + endTimeValue.seconds + endTimeValue.ms / 1000;
    var startTime = endTimeValue.minutes * 60 + startTimeValue.seconds + value / 1000;
    // The clip cannot start after it ends
    if (startTime >= endTime) {
      // Calculate the max amount of milliseconds allowed by subtracting the other start time input values from the end time
      var maxMs = Math.floor((endTime - startTimeValue.minutes * 60 - startTimeValue.seconds) * 1000);
      // If there's less than a seconds worth of milliseconds from the end time, then we need to set the milliseconds to where the clip ends
      if (maxMs / 1000 < 1) {
        this.timeInput.controls["startTime"].setValue({minutes: startTimeValue.minutes, seconds: startTimeValue.seconds, ms: maxMs});
        return;
      }
    }
    // This is so we're not accepting anything greater than or equal to a millisecond as input
    if (value > 999) {
      this.timeInput.controls["startTime"].setValue({minutes: startTimeValue.minutes, seconds: startTimeValue.seconds, ms: 999});
    }
    return;
  }

  onEndMinutesInput(event: any) {
    // Return if the key pressed was backspace
    if (event.key == "Backspace") {
      return;
    }
    // Get the newly entered value as a number
    var value = +event.target.value;
    // Get the start and end times from their respective form groups
    var endTimeValue = this.timeInput.get("endTime").value;
    var startTimeValue = this.timeInput.get("startTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = (value * 60) + endTimeValue.seconds + (endTimeValue.ms / 1000);
    var startTime = (startTimeValue.minutes * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);
    // The clip cannot end after the video ends
    if (endTime > this.videoEndTime) {
      var minutes = Math.floor(this.videoEndTime / 60);
      var seconds = Math.floor(this.videoEndTime % 60);
      var ms = +(this.videoEndTime % 1).toFixed(3) * 1000; 
      // Set input to max time
      this.timeInput.controls["endTime"].setValue({minutes: minutes, seconds: seconds, ms: ms});
      return;
    }
    if (endTime < startTime) {
      var minMinutes = Math.floor(startTime / 60);
      this.timeInput.controls["endTime"].setValue({minutes: minMinutes, seconds: endTimeValue.seconds, ms: endTimeValue.ms});
      return;
    }
  }

  onEndSecondsInput(event: any) {
    // Return if the key pressed was backspace
    if (event.key == "Backspace") {
      return;
    }
    // Get the newly entered value as a number
    var value = +event.target.value;
    // Get the start and end times from their respective form groups
    var endTimeValue = this.timeInput.get("endTime").value;
    var startTimeValue = this.timeInput.get("startTime").value;
    // Calculate the end and start times of clip form in seconds
    // Format: 647.221 = 10 minutes, 47 seconds, and 221 milliseconds
    var endTime = (endTimeValue.minutes * 60) + value + (endTimeValue.ms / 1000);
    var startTime = (startTimeValue.minutes * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);
    // The clip cannot end after the video ends
    if (endTime > this.videoEndTime) {
      // Calculate the highest number of possible seconds to end the video at
      var maxSeconds = Math.floor(this.videoEndTime - (endTimeValue.minutes * 60) - (endTimeValue.ms / 1000));
      if (maxSeconds / 60 < 1) {
        this.timeInput.controls["endTime"].setValue({minutes: endTimeValue.minutes, seconds: maxSeconds, ms: endTimeValue.ms});
        return;
      }
    }
    // The clip cannot end before it begins
    if ((endTime < startTime) && (startTimeValue.minutes == endTimeValue.minutes)) {
      if ((startTimeValue.seconds == value) && (startTimeValue.ms >= endTimeValue.ms)) {
        
      }
      var minSeconds = startTimeValue.seconds
      this.timeInput.controls["endTime"].setValue({minutes: endTimeValue.minutes, seconds: minSeconds, ms: endTimeValue.ms});
      return;
    }
    // This is so we're not accepting anything greater than or equal to a second as input
    if (value > 59) {
      this.timeInput.controls["endTime"].setValue({minutes: endTimeValue.minutes, seconds: 59, ms: endTimeValue.ms});
    }
    return;
  }

  onEndMsInput(event: any) {
    // Return if the key pressed was backspace
    if (event.key == "Backspace") {
      return;
    }
    // Get the newly entered value as a number
    var value = +event.target.value;
    // Get the start and end times from their respective form groups
    var endTimeValue = this.timeInput.get("endTime").value;
    var endTime = endTimeValue.minutes * 60 + endTimeValue.seconds + (value / 1000);
    var startTimeValue = this.timeInput.get("startTime").value;
    var startTime = (startTimeValue.minutes * 60) + startTimeValue.seconds + (startTimeValue.ms / 1000);
    // The clip cannot end after the video ends
    if (endTime > this.videoEndTime) {
      // Calculate the highest number of milliseconds to end the video at
      var maxMs = Math.round((this.videoEndTime - endTimeValue.minutes * 60 - endTimeValue.seconds) * 1000);
      if (maxMs / 1000 < 1) {
        this.timeInput.controls["endTime"].setValue({minutes: endTimeValue.minutes, seconds: endTimeValue.seconds, ms: maxMs});
        return;
      }
    }
    if ((endTime < startTime) && (startTimeValue.minutes == endTimeValue.minutes) && (startTimeValue.seconds == endTimeValue.seconds)) {
      if (startTimeValue.ms == 999) {
        if (startTimeValue.seconds == 59) {
          this.timeInput.controls["endTime"].setValue({minutes: (endTimeValue.minutes + 1), seconds: 0, ms: 0});
        }
        else {
          this.timeInput.controls["endTime"].setValue({minutes: endTimeValue.minutes, seconds: (endTimeValue.seconds + 1), ms: 0});
        }
      }
      else {
        this.timeInput.controls["endTime"].setValue({minutes: endTimeValue.minutes, seconds: endTimeValue.seconds, ms: (startTimeValue.ms + 1)});
      }
      return;
    }
    // This is so we're not accepting anything greater than or equal to a millisecond as input
    if (value > 999) {
      this.timeInput.controls["endTime"].setValue({minutes: endTimeValue.minutes, seconds: endTimeValue.seconds, ms: 999});
    }
    return;
  }
}
