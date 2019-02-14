// For toggling the bot on or off
var toggleState = document.getElementById('toggle-state');
var themeForm = document.getElementById('theme-form');
var submitThemeButton = document.getElementById('theme-button');

window.addEventListener('load', function() {
  chrome.storage.sync.get(['theme'], function(data) {
    document.getElementById("current-theme").textContent = "Theme: " + data.theme;
  });
});

toggleState.onclick = function() {
  // Get the current enabled state from chrome storage
  chrome.storage.sync.get(['enabled'], function(data) {
    // If the extension state is currently enabled, set it to disabled
    if (data.enabled == true) {
      chrome.storage.sync.set({enabled: false}, function() {
        if (chrome.runtime.error) {
          console.log("Runtime error");
        }
        else{
          // Set the icon to reflect the change
          chrome.browserAction.setIcon({
            path : "/images/discord-icon-disabled16.png"
          });
          // Send a message to the content script on the currently open tab to hide our ui if it exists
          // TODO: find a way to send the message to all open tabs with our content script running
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {enabled: false});
          });
        }
      });
    }
    // If the extension state is currently disabled, set it to enabled
    if (data.enabled == false) {
      chrome.storage.sync.set({enabled: true}, function() {
        if (chrome.runtime.error) {
          console.log("Runtime error");
        }
        else {
          // Set the icon to reflect the change
          chrome.browserAction.setIcon({
            path : "/images/discord-icon-active16.png"
          });
          // Send a message to the content script on the currently open tab to show our ui if it has a video
          // TODO: find a way to send the message to all open tabs with our content script running
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {enabled: true});
          });
        }
      });
    }
  });
};

// For themeing
submitThemeButton.addEventListener('click', function() {
  console.log('clicked');
  var theme;
  // Iterate through the for elements to find which one is checked
  // This will scale if future themes are ever added
  for ( var i = 0; i < themeForm.elements.length; i++ ) {
    var e = themeForm.elements[i];
    // Set theme to the value of whatever radio button is checked
    if (e.checked == true){
      theme = e.value;
    }
  }
  // Cheap way to make sure the theme is a value we would expect, but does not scale at all
  if (theme == "light" || theme == "dark") {
    chrome.storage.sync.set({theme: theme}, function() {
      if (chrome.runtime.error) {
        console.log("Runtime error");
      }
      else {
        document.getElementById("current-theme").textContent = "Theme: " + theme;
      }
    });
  }
});