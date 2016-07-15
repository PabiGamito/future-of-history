chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.create({'url': chrome.extension.getURL('history.html')}, function(tab) {
    // Tab opened.
  })
})
