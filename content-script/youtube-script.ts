// import { TimeInput } from '../common/models/TimeInput'
import { GetCurrentTimeRequest, StartPreviewingRequest, SaveRequest } from "./request-messages";
import { Message } from './message';
import { ActionTypes } from './action-types';
import { PreviewingResponse, GetCurrentTimeResponse, SyncResponse, Pong } from './response-messages';

var video, clipTimer, startSeconds, endSeconds, clipName, previewing, clipTimeMs;

console.log('Boardbot: Content script injected');
var onVideoFound = new Event('videofound');

// Look for video on webpage
var videoAvailable = setInterval(() => {
    video = document.getElementsByClassName("html5-main-video")[0];
    if (video != null) {
      window.dispatchEvent(onVideoFound);
      console.log("Boardbot: Video found");
      clearInterval(videoAvailable);
    }
}, 100);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.ActionType == ActionTypes.Ping) {
    sendResponse(new Pong());
  }
});

// Recieves messages from popup.js or background.js
chrome.runtime.onConnect.addListener(port => {
    console.log("Boardbot: Content script connected on listening port");

    window.addEventListener('videofound', (e) => {
      var videoId = document.location.search.split("?v=")[1].substr(0, 11);
      port.postMessage(new SyncResponse(
        video.duration,
        videoId,
        startSeconds == null ? 0 : startSeconds,
        endSeconds == null ? video.duration : endSeconds,
        clipName == null ? "" : clipName));
      if (previewing) {
        var msIntoClip = (video.currentTime - startSeconds) * 1000;
        port.postMessage(new PreviewingResponse(previewing, clipTimeMs, msIntoClip));
      }

      video.onpause = () => {
        if (previewing) {
          previewing = false;
          clearInterval(clipTimer);
          port.postMessage(new PreviewingResponse(previewing));
        }
      };
    });

    port.onMessage.addListener(msg => {
      switch (msg.ActionType) {

        case ActionTypes.Sync:
          var videoId = document.location.search.split("?v=")[1].substr(0, 11);
          port.postMessage(new SyncResponse(
            video.duration,
            videoId,
            startSeconds == null ? 0 : startSeconds,
            endSeconds == null ? video.duration : endSeconds,
            clipName == null ? "" : clipName));
          if (previewing) {
            var msIntoClip = (video.currentTime - startSeconds) * 1000;
            port.postMessage(new PreviewingResponse(previewing, clipTimeMs, msIntoClip));
          }
          break;

        case ActionTypes.StartPreviewing:
          startSeconds = msg.StartSeconds;
          endSeconds = msg.EndSeconds;
          clipTimeMs = msg.ClipTimeMs;
          video.currentTime = startSeconds;
          video.play();
          previewing = true;
          port.postMessage(new PreviewingResponse(previewing, msg.ClipTimeMs));

          clipTimer = setInterval(() => {
            video.currentTime = startSeconds;
          }, msg.ClipTimeMs);
          break;

        case ActionTypes.StopPreviewing:
          clearInterval(clipTimer);
          video.pause();
          previewing = false;
          port.postMessage(new PreviewingResponse(previewing));
          break;

        case ActionTypes.GetCurrentTime:
          port.postMessage(new GetCurrentTimeResponse(video.currentTime, msg.Control));
          break;

        case ActionTypes.Save:
          startSeconds = msg.StartSeconds;
          endSeconds = msg.EndSeconds;
          clipName = msg.ClipName;
          break;
      }
    });
});
