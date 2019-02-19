var video, videoInfo, lightPlayButtonImageUrl, lightSubmitButtonImageUrl, darkPlayButtonImageUrl, darkSubmitButtonImageUrl;
lightPlayButtonImageUrl = chrome.runtime.getURL("assets/play_circle_outline_white_48x48.png");
lightSubmitButtonImageUrl = chrome.runtime.getURL("assets/add_circle_outline_white_48x48.png");
darkPlayButtonImageUrl = chrome.runtime.getURL("assets/play_circle_outline_black_48x48.png");
darkSubmitButtonImageUrl = chrome.runtime.getURL("assets/add_circle_outline_black_48x48.png");

// Main function for injecting our ui
var videoAvailable = setInterval(function() {
    video = document.getElementsByClassName("html5-main-video")[0];
    videoInfo = document.getElementsByClassName("ytd-video-primary-info-renderer")[0];
    chrome.storage.sync.get(['enabled'], function(data) {
        if (videoInfo && data.enabled && video != undefined){
            if (videoInfo.children.length == 6) {
                injectUI();
                clearInterval(videoAvailable);
            }
        }
    });   
}, 100);

// Recieves messages from popup.js or background.js
chrome.runtime.onConnect.addListener(function(port) {
    console.log("Conent script connected on listening port");
    port.onMessage.addListener(function(msg) {
        if (msg.getVideoInfo == "length") {
            port.postMessage({length: video.duration});
        }
    });
});

var mainContainer, startBox, endBox, nameBox, playButton, submitButton;
var playButtonImage, submitButtonImage;

function injectUI() {

    // Container for all out elements
    mainContainer = document.createElement("div");
    mainContainer.id = "main-container";
    mainContainer.style.height = "32px";
    mainContainer.style.width = "360px";

    // Start time input element
    startBox = document.createElement("input");
    startBox.id = "startBox";
    startBox.type = "text";
    startBox.style.width = "72px";
    startBox.style.height = "24px";
    startBox.value = "00:00:00";

    // Separates the start time and end time inputs
    var timeBoxSeparator = document.createElement("span");
    timeBoxSeparator.textContent = "\u2014";
    timeBoxSeparator.style.margin = "0 5px";
    timeBoxSeparator.style.paddingTop = "2px";
    timeBoxSeparator.style.fontSize = "12px";

    // End time input element
    endBox = document.createElement("input");
    endBox.id = "endBox";
    endBox.type = "text";
    endBox.style.width = "72px";
    endBox.style.height = "24px";
    endBox.value = "00:00:05.6";

    // Play button (previews clip)
    playButton = document.createElement("div");
    playButton.id = "playButton";
    playButton.setAttribute("role", "button");
    playButton.style.height = "100%";
    playButton.style.float = "right";
    playButton.style.cursor = "pointer";

    // Icon for our play button
    playButtonImage = document.createElement("img");
    playButtonImage.style.boxSizing = "border-box";
    playButtonImage.style.height = "100%";
    playButtonImage.style.float = "right";
    playButtonImage.style.padding = "4px 0";

    // Sumbit button (copies command args to clipboard)
    submitButton = document.createElement("div");
    submitButton.id = "submitButton";
    submitButton.setAttribute("role", "button");
    submitButton.style.height = "100%";
    submitButton.style.float = "right";
    submitButton.style.cursor = "pointer";

    // Icon for our submit button
    submitButtonImage = document.createElement("img");
    submitButtonImage.style.boxSizing = "border-box";
    submitButtonImage.style.height = "100%";
    submitButtonImage.style.float = "right";
    submitButtonImage.style.padding = "4px 0";

    // Separates end time input element from the clip name input element
    var nameBoxSeparator = document.createElement("span");
    nameBoxSeparator.textContent = "\u2014";
    nameBoxSeparator.style.margin = "0 5px";
    nameBoxSeparator.style.paddingTop = "2px";
    nameBoxSeparator.style.fontSize = "12px";

    // Clip name input element
    nameBox = document.createElement("input");
    nameBox.id = "startBox";
    nameBox.type = "text";
    nameBox.style.width = "100px";
    nameBox.style.height = "24px";
    nameBox.value = "Clip Name";
    
    chrome.storage.sync.get(['theme'], function(data) {
        if (data.theme == "light") {
            playButtonImage.src = darkPlayButtonImageUrl;
            submitButtonImage.src = darkSubmitButtonImageUrl;
        }
        if (data.theme == "dark") {
            playButtonImage.src = lightPlayButtonImageUrl;
            submitButtonImage.src = lightSubmitButtonImageUrl;
        }
    });

    videoInfo.appendChild(mainContainer);
    mainContainer.appendChild(startBox);
    mainContainer.appendChild(timeBoxSeparator);
    mainContainer.appendChild(endBox);
    mainContainer.appendChild(playButton);
    playButton.appendChild(playButtonImage);
    mainContainer.appendChild(submitButton);
    submitButton.appendChild(submitButtonImage);
    mainContainer.appendChild(nameBoxSeparator);
    mainContainer.appendChild(nameBox);

    // Preview clip
    var previewing;
    playButtonImage.addEventListener("click", function(){
        if (previewing == true) return;
        previewing = true;
        var startTime = timeToMS(startBox.value);
        var endTime = timeToMS(endBox.value);
        var clipTime = endTime - startTime;

        video.currentTime = (startTime / 1000);
        video.play();

        setTimeout(function() {
            video.pause();
            previewing = false;
        }, clipTime);
    });

    // Copy the add-clip command to users clipboard
    submitButtonImage.addEventListener("click", function(){
        var commandString = "@Boardbot add-clip ";
        commandString = commandString + nameBox.value + " ";
        var videoId = document.location.search.split("?v=")[1].substr(0, 11);
        commandString = commandString + videoId + " " + startBox.value + " " + endBox.value;

        var foo = document.createElement("textarea");
        foo.value = commandString;
        foo.setAttribute("readonly", "");
        foo.style.cssText = "position:\"absolute\";left:\"-9999px\"";
        document.body.append(foo);
        foo.select();
        document.execCommand("copy");
        document.body.removeChild(foo);

        alert("The Boardbot command has been copied to your clipboard.");
    });
}

function timeToMS(time) {
    var timeArray = [];
    var ms = "0";
    var milliseconds = 0;
    // If the timespan is formatted as 00:00:00
    if(time.length == 8){
        if(time[2] == ":" && time[5] == ":"){
            // Break up the timespan into parts by ":" so we get an array with 00, 00, and 00
            timeArray = time.split(":");
            // Remove leading 0's
            timeArray.forEach(e => {
                if(e.indexOf(0) == "0"){
                    e = e[1];
                }
            });
        }
    }
    // If the timespan is formatted as 00:00:00.0
    if(time.length == 10){
        if(time[2] == ":" && time[5] == ":" && time[8] == "."){
            // Splitting by "." will give us an array with two members, 00:00:00 and 0
            var splitString = time.split(".");
            // Break up the timespan into parts by ":" so we get an array with 00, 00, and 00
            timeArray = splitString[0].split(":");
            // Remove leading 0's
            timeArray.forEach(e => {
                if(e.indexOf(0) == "0"){
                    e = e[1];
                }
            });
            ms = splitString[1];
        }
    }
    // Parse all the elements of the array as ints
    var hours = parseInt(timeArray[0], 10);
    var minutes = parseInt(timeArray[1], 10);
    var seconds = parseInt(timeArray[2], 10);
    milliseconds = parseInt(ms, 10) * 100;
    var totalMilliseconds = milliseconds + (seconds * 1000) + (minutes * 60000) + (hours * 3600000);

    //console.log("Minutes: " + minutes + " Seconds: " + seconds + " MS: " + milliseconds);
    
    return totalMilliseconds;
}