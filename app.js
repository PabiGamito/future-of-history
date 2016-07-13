if(window.location.href.match(/www.google.com\/search/)){
  var openRequest = indexedDB.open("future",1);
  openRequest.onsuccess = function(e) {
    db = e.target.result;
    var transaction = db.transaction(["searches"],"readwrite");
    var store = transaction.objectStore("searches");

    var query = window.location.search.substr(1).split("&")
    var params = {}
    query.forEach(function(q){
      var qs = q.split("=")
      params[qs[0]] = qs[1]
    })
    store.add({query:params.q, ts: new Date()},1)
  }
  openRequest.onupgradeneeded = function(e) {
    var thisDB = e.target.result
    if(!thisDB.objectStoreNames.contains("searches")) {
	thisDB.createObjectStore("searches")
    }
  }
  var as = document.querySelectorAll("a")
  for(var i = 0; i < as.length; i++){
    var a = as[i]
    a.addEventListener("click", function(){
      console.log("you clicked", this.getAttribute('data-href'))
    })
  }
}
