//Open history page when chrome extension browerAction icon is clicked on
chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.create({'url': chrome.extension.getURL('src/history.html')}, function(tab) {
    // Tab opened.
  })
})

// DATABASE
// Open connection to "hisotry" database
var openRequest = indexedDB.open("history", 1)
// Define global variables
var db
var searchData = []

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

      if (request.action == "get") {
        
        handleRequestForRetrieval(request,sendResponse);

      } else if (request.action == "store") {

        handleRequestForStorage(request,sendResponse);

      }
    }

    return true;
  }


)


function handleRequestForStorage(request,sendResponse){
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
}


function handleRequestForRetrieval(request,sendResponse){
       if (request.get == "searches") {
          var d = new Date()
          var upperBound = d.getTime()
          d.setDate(d.getDate() - 1)
          var lowerBound = d.getTime()
          var range = IDBKeyRange.bound(lowerBound, upperBound)
          var transaction = db.transaction(["searches"],"readonly")
          var store = transaction.objectStore("searches").openCursor().onsuccess = function(event) {
            getSearchData(event,sendResponse)
          }
          // var index = store.index("date")
          // var requestSearches = index.openCursor(range)

          // requestSearches.onsuccess = function(event) {
          //   getSearchData(event,sendResponse)
          // }

        }

}

// Get an array with all the data the cursor can go through
function getSearchData(event,sendResponse){
  
  var cursor = event.target.result
  
  if( cursor ) {
    var data = cursor.value
    console.log(data);

    searchData.push( JSON.parse(JSON.stringify(data)))
    
    cursor.continue()
  } else {
    console.log("Retreived all searche data", searchData)
    sendResponse({searches: searchData})
  }

}


function onRequest(request, sender, callback){ 

   if(request.action == 'ListenOnContextMenuAction'){
        
        var links = request.links;
        var key = request.key;

        chrome.contextMenus.onClicked.addListener(function(object,tab){
        
        if(object.hasOwnProperty('linkUrl')){
          
          var link = links.filter(function(item){
            return item.link == object.linkUrl || item.url == object.linkUrl;
          }).pop();

          if(link){
            sendClickAction(link,key);
          }

        }

      });
      
   }
} 



function sendClickAction(linkObj,key){
  console.log(linkObj);

  var transaction = db.transaction(["searches"],"readwrite")
    var store = transaction.objectStore("searches")
    var lastQueryRequest = store.get(key)
    lastQueryRequest.onsuccess = function(event) {
      var openedLinks = lastQueryRequest.result.openedLinks
      // TODO: Store time spent on the specific page
      openedLinks.push({
        link: linkObj.link,
        title: linkObj.title
      })
      console.log("Links added to search query record")
    }
  
}


//subscribe on request from content.js:
chrome.extension.onRequest.addListener(onRequest);