//Save Google Queries to Database
if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  var query = (window.location.search.substr(1)+window.location.hash).split(/[\#\&]/g)
  console.log(window.location)
  var params = {}
  query.forEach(function(q){
    var qs = q.split("=")
    params[qs[0]] = qs[1].replace(/\+/g, " ")
  })
  // send search query to database (params.q => search query)
  chrome.runtime.sendMessage({for: "background", database: true, store: "search", query: params.q, ts: new Date().getTime()}, function(response) {
    var key = response.key
    console.log("Created search query record #"+key)
    // select all links on page to add to db on click
    // TODO: make it also run on right click + open
    var as = document.querySelectorAll("a")
    for(var i = 0; i < as.length; i++){
      var a = as[i]
      a.addEventListener("click", function(){
        // on link click send message to add link to db
        var linkTitle = this.innerHTML
        var link = this.getAttribute('data-href')
        chrome.runtime.sendMessage({for: "background", database: true, store: "search-link", keyValue: key, title: linkTitle, link: link}, function(response) {
          console.log("Opened link added to search query record")
        })
      })
    }
  })
}
