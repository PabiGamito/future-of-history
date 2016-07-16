//Open connection to "future" database
var openRequest = indexedDB.open("history", 1)
openRequest.onsuccess = function(e) {
  db = e.target.result;
  var transaction = db.transaction(["searches"],"readwrite")
  var store = transaction.objectStore("searches")

  var index = store.index("date")

  function getDaySearches() {
    var daySearches = [];

    var d = new Date();
    var upperBound = [d.getTime()]
    d.setDate(d.getDate() - 1)
    var lowerBound = [d.getTime()]
    var range = IDBKeyRange.bound(lowerBound, upperBound)
    var request = index.openCursor(range)

    request.onsuccess = function(event) {
      var cursor = event.target.result
        console.log(cursor)
      if( cursor ) {
      	daySearches.push( cursor.value )
      	cursor.continue()
      } else {
      	console.log('Retreived searches from the past day')
      }
    }

    return daySearches
  }

  var request = store.get(1)
  request.onsuccess = function(event) {
      console.log(event.target.result)
  }

  getDaySearches().forEach(function(){
    //Display all the search queries
  })

}
openRequest.onupgradeneeded = function(e) {
  var thisDB = e.target.result
  if(!thisDB.objectStoreNames.contains("searches")) {
     var searches = thisDB.createObjectStore("searches", { autoIncrement : true })
     searches.createIndex("date", "ts")
  }
}
openRequest.onerror = function(e) {
  console.log("Database Error: " + e.target.errorCode)
  console.log("Permission to create a database might not be enabled.")
}
