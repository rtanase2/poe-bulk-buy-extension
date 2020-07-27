// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
    console.log('installed');
    // chrome.storage.sync.set({message: 'This is a message. TODO MAKE THIS BUY ALL WHISPER TO COPY'}, function() {
    //   console.log('Message value set');
    // });
  // chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  //   chrome.declarativeContent.onPageChanged.addRules([{
  //     conditions: [new chrome.declarativeContent.PageStateMatcher({
  //       pageUrl: {hostEquals: 'www.pathofexile.com', schemes:['https']},
  //     })],
  //     actions: [new chrome.declarativeContent.ShowPageAction()]
  //   }]);
  // });
});

// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
//   console.log('done sending message in background');
// });
