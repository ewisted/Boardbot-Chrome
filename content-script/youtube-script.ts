var video, clipTimer;

console.log('Boardbot: Content script injected');

// Main function for injecting our ui
var videoAvailable = setInterval(() => {
    video = document.getElementsByClassName("html5-main-video")[0];
    if (video != null) {
        console.log("Boardbot: Video found");
        clearInterval(videoAvailable);
    }
}, 100);

// Recieves messages from popup.js or background.js
chrome.runtime.onConnect.addListener(port => {
    console.log("Conent script connected on listening port");
    port.onMessage.addListener(msg => {
        if (msg.getVideoInfo) {
            var videoId = document.location.search.split("?v=")[1].substr(0, 11);
            port.postMessage({videoInfo: {length: video.duration, videoId: videoId}});
        }
        if (msg.playClip && msg.startTime) {
            video.currentTime = msg.startTime;
            video.play();
            port.postMessage({previewing: true});
            clipTimer = setInterval(() => {
                video.currentTime = msg.startTime;
            }, msg.playClip);
        }
        if (msg.stopClip == true) {
            clearInterval(clipTimer);
            video.pause();
            port.postMessage({previewing: false});
        }
        if (msg.getCurrentTime) {
            port.postMessage({currentTime: video.currentTime, control: msg.getCurrentTime});
        }
    });
});