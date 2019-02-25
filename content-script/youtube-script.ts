
import {ChromeStorageRequestModel} from 'src/app/ChromeStorageRequestModel';
import {TestModule} from './TestModule';
var video, clipTimer, startSeconds, endSeconds, clipName, previewing;
console.log('Boardbot: Content script injected');

// Main function for injecting our ui
var videoAvailable = setInterval(() => {
    debugger;
    video = document.getElementsByClassName("html5-main-video")[0];
    if (video != null) {
        console.log("Boardbot: Video found");
        clearInterval(videoAvailable);
    }
}, 100);

// Recieves messages from popup.js or background.js
chrome.runtime.onConnect.addListener(port => {
    console.log("Boardbot: Content script connected on listening port");

    port.onMessage.addListener(msg  => {
        var test = TestModule.Test.TestProp;
         var message = msg as ChromeStorageRequestModel;
        switch(message.action) {
            // case test.ChromeStorageActionTypes.GetVideo: {

            // }
            // case ChromeStorageActionEnum.ChromeStorageActionEnum.ReturnVideo: {
                
            // }
            // case ChromeStorageActionEnum.ChromeStorageActionEnum.SetPreview: {
                
            // }
            // case ChromeStorageActionEnum.ChromeStorageActionEnum.StoreClipToCache: {
                
            // }
        };

        if (msg.getVideoInfo) {
            var videoId = document.location.search.split("?v=")[1].substr(0, 11);
            if (startSeconds || endSeconds || clipName || previewing) {
                port.postMessage({
                    videoInfo: {
                        length: video.duration, 
                        videoId: videoId
                    }, 
                    recoverInfo: {
                        startSeconds: startSeconds, 
                        endSeconds: endSeconds, 
                        clipName: clipName, 
                        previewing: previewing
                    }
                });
            }
            else {
                port.postMessage({videoInfo: {length: video.duration, videoId: videoId}});
            }
        }
        if (typeof msg.playClip === "number" && typeof msg.startSeconds === "number") {
            video.currentTime = msg.startSeconds;
            video.play();
            previewing = true;
            port.postMessage({previewing: true});
            clipTimer = setInterval(() => {
                video.currentTime = msg.startSeconds;
            }, msg.playClip);
        }
        if (msg.stopClip == true) {
            clearInterval(clipTimer);
            video.pause();
            previewing = false;
            port.postMessage({previewing: false});
        }
        if (msg.getCurrentTime) {
            port.postMessage({currentTime: video.currentTime, control: msg.getCurrentTime});
        }
        if (msg.save) {
            startSeconds = msg.startSeconds;
            endSeconds = msg.endSeconds;
            clipName = msg.clipName;
        }
    });
});
