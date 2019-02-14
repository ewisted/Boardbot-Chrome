var video, videoInfo, lightPlayButtonImageUrl, lightSubmitButtonImageUrl, darkPlayButtonImageUrl, darkSubmitButtonImageUrl;
lightPlayButtonImageUrl = chrome.runtime.getURL("/images/play_circle_outline_white_48x48.png");
lightSubmitButtonImageUrl = chrome.runtime.getURL("/images/add_circle_outline_white_48x48.png");
darkPlayButtonImageUrl = chrome.runtime.getURL("/images/play_circle_outline_black_48x48.png");
darkSubmitButtonImageUrl = chrome.runtime.getURL("/images/add_circle_outline_black_48x48.png");

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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.enabled == false) {
        videoInfo.removeChild(document.getElementById("main-container"));
      }
      if (request.enabled == true && videoInfo && video != undefined) {
        if (videoInfo.children.length == 6) {
            injectUI();
        }
      }
      
    });

var mainContainer, startBox, endBox, nameBox, playButton, submitButton;
var playButtonImage, submitButtonImage;

function injectUI() {

    mainContainer = document.createElement("div");
    mainContainer.id = "main-container";
    mainContainer.style.height = "32px";
    mainContainer.style.width = "360px";
    videoInfo.appendChild(mainContainer);

    startBox = document.createElement("input");
    startBox.id = "startBox";
    startBox.type = "text";
    startBox.style.width = "72px";
    startBox.style.height = "24px";
    startBox.value = "00:00:00";
    mainContainer.appendChild(startBox);

    var timeBoxSeparator = document.createElement("span");
    timeBoxSeparator.textContent = "\u2014";
    timeBoxSeparator.style.margin = "0 5px";
    timeBoxSeparator.style.paddingTop = "2px";
    timeBoxSeparator.style.fontSize = "12px";
    mainContainer.appendChild(timeBoxSeparator);

    endBox = document.createElement("input");
    endBox.id = "endBox";
    endBox.type = "text";
    endBox.style.width = "72px";
    endBox.style.height = "24px";
    endBox.value = "00:00:05.6";
    mainContainer.appendChild(endBox);

    playButton = document.createElement("div");
    playButton.id = "playButton";
    playButton.setAttribute("role", "button");
    playButton.style.height = "100%";
    playButton.style.float = "right";
    playButton.style.cursor = "pointer";
    mainContainer.appendChild(playButton);

    playButtonImage = document.createElement("img");
    playButtonImage.style.boxSizing = "border-box";
    playButtonImage.style.height = "100%";
    playButtonImage.style.float = "right";
    playButtonImage.style.padding = "4px 0";
    playButtonImage.src = darkPlayButtonImageUrl;
    playButton.appendChild(playButtonImage);

    submitButton = document.createElement("div");
    submitButton.id = "submitButton";
    submitButton.setAttribute("role", "button");
    submitButton.style.height = "100%";
    submitButton.style.float = "right";
    submitButton.style.cursor = "pointer";
    mainContainer.appendChild(submitButton);

    submitButtonImage = document.createElement("img");
    submitButtonImage.style.boxSizing = "border-box";
    submitButtonImage.style.height = "100%";
    submitButtonImage.style.float = "right";
    submitButtonImage.style.padding = "4px 0";
    submitButtonImage.src = darkSubmitButtonImageUrl;
    submitButton.appendChild(submitButtonImage);

    var nameBoxSeparator = document.createElement("span");
    nameBoxSeparator.textContent = "\u2014";
    nameBoxSeparator.style.margin = "0 5px";
    nameBoxSeparator.style.paddingTop = "2px";
    nameBoxSeparator.style.fontSize = "12px";
    mainContainer.appendChild(nameBoxSeparator);

    nameBox = document.createElement("input");
    nameBox.id = "startBox";
    nameBox.type = "text";
    nameBox.style.width = "100px";
    nameBox.style.height = "24px";
    nameBox.value = "Clip Name";
    mainContainer.appendChild(nameBox);

    playButtonImage.addEventListener("click", function(){
        var startTime = timeToMS(startBox.value);
        var endTime = timeToMS(endBox.value);
        var clipTime = endTime - startTime;

        video.currentTime = (startTime / 1000);
        video.play();

        setTimeout(function() {
            video.pause();
        }, clipTime);
    });

    submitButtonImage.addEventListener("click", function(){
        var commandString = "@Boardbot add-clip ";
        commandString = commandString + nameBox.value + " ";
        var videoId = document.location.search.split("?v=")[1].substr(0, 11);
        commandString = commandString + videoId + " " + startBox.value + " " + endBox.value;

        var foo = document.createElement("textarea");
        foo.value = commandString;
        foo.setAttribute("readonly", "");
        foo.style = {position: "absolute", left: "-9999px"};
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
            splitString = time.split(".");
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
