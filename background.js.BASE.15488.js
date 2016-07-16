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
var db
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
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "background") {

      if (request.database == "store") {

        // Receive data for content pages to store in database
        if (request.store == "search") {
          // adds search query and ts to database
          var transaction = db.transaction(["searches"],"readwrite")
          var store = transaction.objectStore("searches")
          var storeQuery = store.add( {query: request.query, ts: request.ts, openedLinks: []} )
          storeQuery.onsuccess = function(event){
            sendResponse({key: event.target.result})
            console.log("Search query added to database")
          }
        } else if (request.store == "search-link") {
          // adds links clicked on to record containing matching search query
          var transaction = db.transaction(["searches"],"readwrite")
          var store = transaction.objectStore("searches")
          var lastQueryRequest = store.get(request.key)
          lastQueryRequest.onsuccess = function(event) {
            var openedLinks = lastQueryRequest.result.openedLinks
            // TODO: Store time spent on the specific page
            openedLinks.push({
              link: request.link,
              title: request.title
            })
            console.log("Links added to search query record")
          }
        }

      } else if (request.database == "get") {

        // Send data to history page
        // Respond to data message requests
        if (request.get ==  "searches") {
          var d = new Date()
          var upperBound = d.getTime()
          d.setDate(d.getDate() - 1)
          var lowerBound = d.getTime()
          var range = IDBKeyRange.bound(lowerBound, upperBound)
          var transaction = db.transaction(["searches"],"readonly")
          var store = transaction.objectStore("searches")
          var index = store.index("date")
          var requestSearches = index.openCursor(range)

          requestSearches.onsuccess = function(event) {
            getSearchData(event)
          }

          var searchData = []
          // Get an array with all the data the cursor can go through
          function getSearchData(event){
            var cursor = event.target.result
            if( cursor ) {
              var data = cursor.value
            	searchData.push( data )
            	cursor.continue()
            } else {
              console.log("Retreived all searche data", searchData)
              chrome.runtime.sendMessage(
                {for: "history", searches: searchData}
              )
            }
          }

        }
      }
    }
  }
)
