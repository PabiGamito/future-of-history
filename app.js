if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  // If Google Search
  var uri = window.location
  var dec = decodeURI(uri.href)
  console.log("dec", dec)
  var query = dec.split(/[\#\&\?]/g)
  query.shift() // remove host part of url (ex: www.google.com)
  console.log("query", query)
  var params = {}
  query.forEach(function(q){
    var qs = q.split("=")
    params[qs[0]] = qs[1].replace(/\+/g, " ")
  })
  var searchQuery = params.q
  chrome.runtime.sendMessage({for: "background", database: "store", store: "search", query: searchQuery, ts: new Date().getTime(), href: uri.href})

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.for == "content") {
      if (request.key) {
        var key = request.key
        console.log("Created search query record #"+key)
        // prevent default browser click behavior
        $("a").click(function(event){
          event.preventDefault()
          return false
        })
        // select all links on page to add to db on click
        // TODO: make it also run on right click + open
        $("a").on('click', function(){
          // on link click send message to add link to db
          var linkTitle = $(this).text()
          var link = $(this).attr('data-href')
          chrome.runtime.sendMessage({for: "background", database: "store", store: "searchLink", key: key, title: linkTitle, link: link})
        })
      }
    }
  })


}
