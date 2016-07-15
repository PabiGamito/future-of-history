//Save Google Queries to Database
if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  //Open connection to "future" database
  var openRequest = indexedDB.open("future", 1)
  openRequest.onsuccess = function(e) {
    db = e.target.result;
    var transaction = db.transaction(["searches"],"readwrite")
    var store = transaction.objectStore("searches")

    var query = (window.location.search.substr(1)+window.location.hash).split(/[\#\&]/g)
    console.log(window.location)
    var params = {}
    query.forEach(function(q){
      var qs = q.split("=")
      params[qs[0]] = qs[1].replace(/\+/g, " ")
    })
    //add search query to database (params.q => search query)
    var storeQuery = store.add( {query: params.q, ts: new Date().getTime(), openedLinks: []} )
    storeQuery.onsuccess = function(event){
      var lastQueryRequest = store.get(event.target.result)
      lastQueryRequest.onsuccess = function(event) {
        var data = lastQueryRequest.result
        var openedLinks = data.openedLinks
        //add all clicked links form this query to the database
        var as = document.querySelectorAll("a")
        for(var i = 0; i < as.length; i++){
          var a = as[i]
          a.addEventListener("click", function(){
            openedLinks.push({
              link: this.getAttribute('data-href'),
              title: this.innerHTML
            })
          })
        }
      }
    };

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
}
