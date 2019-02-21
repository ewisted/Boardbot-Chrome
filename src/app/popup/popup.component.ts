import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TimeInputValidators, ConfirmValidParentMatcher } from './popup.validators';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  public disabled;
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
      if (this.port) {
        this.disabled = false;
        console.log("Popup connected to content script");
        // Listener for all content script replys
        this.setupReplyListener();
        // Get video info
        this.port.postMessage({getVideoInfo: true});
      }
      else {
        this.disabled = true;
      }
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
}
