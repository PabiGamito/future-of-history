//Open history page when chrome extension browerAction icon is clicked on
chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.create({'url': chrome.extension.getURL('history.html')}, function(tab) {
    // Tab opened.
  })
})

// DATABASE
// Open connection to "hisotry" database
var openRequest = indexedDB.open("hisotry", 1)
// Define global variables
var db, storeSearches
// Run migrations if necessary
openRequest.onupgradeneeded = function(e) {
  var thisDB = e.target.result
  if(!thisDB.objectStoreNames.contains("searches")) {
    var searches = thisDB.createObjectStore("searches", { autoIncrement : true })
    searches.createIndex("date", "ts")
  }
}
// Error handling
openRequest.onerror = function(e) {
  console.log("Database Error: " + e.target.errorCode)
  console.log("Permission to create a database might not be enabled.")
}
// Once connected successfully to database
openRequest.onsuccess = function(e) {
  db = e.target.result;
  var transaction = db.transaction(["searches"],"readwrite")
  storeSearches = transaction.objectStore("searches")

}

// Receive data for content pages to store in database
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "background") {
      if (request.database) {
        if (request.store == "search") {
          // adds search query and ts to database
          var storeQuery = storeSearches.add( {query: params.q, ts: new Date().getTime(), openedLinks: []} )
          storeQuery.onsuccess = function(event){
            sendResponse({key: event.target.result})
          }
        } else if (request.store == "search-link") {
          // adds links clicked on to record containing matching search query
          var lastQueryRequest = storeSearches.get(request.key)
          lastQueryRequest.onsuccess = function(event) {
            var openedLinks = lastQueryRequest.result.openedLinks
            openedLinks.push({
              link: request.link,
              title: request.title
            })
          }
        }
      }
    }
  })
