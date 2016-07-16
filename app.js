//It loaded page is a google search link
if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  var uri = (window.location.search+window.location.hash)
  var dec = decodeURI(uri)
  var query = dec.split(/[\#\&]/g)
  var params = {}
  query.forEach(function(q){
    var qs = q.split("=")
    params[qs[0]] = qs[1].replace(/\+/g, " ")
  })
  var searchQuery = params.q
  chrome.runtime.sendMessage(
    {for: "background", database: "store", store: "search", query: searchQuery, ts: new Date().getTime()},
    function(response) {
      var key = response.key
      console.log("Created search query record #"+key)
      // select all links on page to add to db on click
      // TODO: make it also run on right click + open
      $("a").on('click', function(){
        // on link click send message to add link to db
        var linkTitle = $(this).text()
        var link = $(this).attr('data-href')
        chrome.runtime.sendMessage(
          {for: "background", database: "store", store: "search-link", keyValue: key, title: linkTitle, link: link},
          function(response) {
            console.log("Opened link ("+link+") added to search query record")
          }
        )
      })
    }
  )
}
