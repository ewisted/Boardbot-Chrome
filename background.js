// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({theme: 'light'}, function() {
    console.log('Default theme set to light');
  });
  chrome.storage.sync.set({enabled: true}, function() {
    console.log('State set to enabled');
  });
});

// This gets fired whenever a change is made to chrome storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    // This switch case determines what changed and what to do with the change
    switch(key) {
      // If a user changes the theme, we need to communicate it to the content script
      case "theme":
        break;
      // If a user toggles enabled or disabled, this gets hit
      case "enabled":
        var storageChange = changes[key];
        console.log(storageChange.newValue);
    }
  }
});
