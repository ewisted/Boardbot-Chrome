import { Injectable } from '@angular/core';
import { StoredVideoInfoModel } from './models/StoredVideoInfoModel';

@Injectable({
  providedIn: 'root'
})
export class GoogleStorageService {
  private port: chrome.runtime.Port;
  
  constructor() { 
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      // Esablish a persistant connection to the content script
      this.port = chrome.tabs.connect(tabs[0].id);
      if (!this.port) { throw new Error("Port not connecting from google-storage service."); }
        // console.log("Popup connected to content script");
        // // Listener for all content script replys
        // this.setupReplyListener();
        // // Get video info
        // this.port.postMessage({getVideoInfo: true});
      //}
    });
  }

  // private GetStoredVideoTime() {
  //   this.port.onMessage.addListener(msg => {
  //     if (msg.videoInfo) {
  //       var videoEndTime = msg.videoInfo.length;
  //       var videoId = msg.videoInfo.videoId;
  //       if (msg.recoverInfo) { 
  //         this.inputBuilder = new PopupInputBuilder(this.fb, msg.recoverInfo.startSeconds, msg.recoverInfo.endSeconds, msg.recoverInfo.clipName);
  //         this.previewing = msg.recoverInfo.previewing;
  //         return new StoredVideoInfoModel
  //       }
  //     }

  //     this.port.postMessage({getVideoInfo: true});
  //   });
  // }
  // private setupReplyListener() {
  //   this.port.onMessage.addListener(msg => {
  //     // Response for video duration
  //     if (msg.videoInfo) {
  //       this.videoEndTime = msg.videoInfo.length;
  //       this.videoId = msg.videoInfo.videoId;
  //       if (msg.recoverInfo) { 
  //         this.inputBuilder = new PopupInputBuilder(this.fb, msg.recoverInfo.startSeconds, msg.recoverInfo.endSeconds, msg.recoverInfo.clipName);
  //         this.previewing = msg.recoverInfo.previewing;
  //       }
  //       else {
  //         this.inputBuilder = new PopupInputBuilder(this.fb, {minutes: 0, seconds: 0, ms: 0}, this.videoEndTime);
  //       }
  //       this.inputBuilder.enable();
  //       this.disabled = false;

  //       // Really hack-y way of getting the elements to refresh when the popup is loaded
  //       var el = document.getElementById("startMinutes");
  //       var evObj = document.createEvent("Events");
  //       evObj.initEvent("click", true, false);
  //       el.dispatchEvent(evObj);
  //     }

  //     if (msg.previewing != null) {
  //       this.previewing = msg.previewing;
  //     }

  //     if (msg.currentTime && msg.control) {
  //       this.inputBuilder.setTime(msg.control, msg.currentTime);
  //       this.save();
  //     }
  //   });
  // }
}
