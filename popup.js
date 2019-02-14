// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var toggleState = document.getElementById('toggle-state');

toggleState.onclick = function() {
  chrome.storage.sync.get(['enabled'], function(data) {
    if (data.enabled == true) {
      chrome.storage.sync.set({enabled: false}, function() {
        if (chrome.runtime.error) {
          console.log("Runtime error");
        }
        else{
          chrome.browserAction.setIcon({
            path : "/images/discord-icon-disabled16.png"
          });
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {enabled: false});
          });
        }
      });
    }
    if (data.enabled == false) {
      chrome.storage.sync.set({enabled: true}, function() {
        if (chrome.runtime.error) {
          console.log("Runtime error");
        }
        else {
          chrome.browserAction.setIcon({
            path : "/images/discord-icon-active16.png"
          });
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {enabled: true});
          });
        }
      });
    }
  });
};
