//Save Google Queries to Database
if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  //Open connection to "future" database
  var openRequest = indexedDB.open("future",1)
  openRequest.onsuccess = function(e) {
    db = e.target.result;
    var transaction = db.transaction(["searches"],"readwrite")
    var store = transaction.objectStore("searches")

    var query = window.location.search.substr(1).split(/[\#\&]+/)
    var params = {}
    query.forEach(function(q){
      var qs = q.split("=")
      params[qs[0]] = qs[1].replace(/\+/g, " ")
    })
    //Add search query to database (params.q => search query)
    store.add({query:params.q, ts: new Date().getTime()})
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
  var as = document.querySelectorAll("a")
  for(var i = 0; i < as.length; i++){
    var a = as[i]
    a.addEventListener("click", function(){
      console.log("you clicked", this.getAttribute('data-href'))
      console.log("with the page title", this.innerHTML)
    })
  }
}
