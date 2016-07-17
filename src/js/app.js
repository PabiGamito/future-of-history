//It loaded page is a google search link
if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  console.log("Detected google search")

  var uri = (window.location.search.substr(1)+window.location.hash)
  var dec = decodeURI(uri)
  var query = dec.split(/[\#\&]/g)
  var params = {}

  query.forEach(function(q){
    var qs = q.split("=")
    params[qs[0]] = qs[1].replace(/\+/g, " ")
  })

  var searchQuery = params.q

  console.log("Attempting to save search query", searchQuery)
  chrome.runtime.sendMessage(
    {
      for: "background",
      action: "store",
      store: "search",
      query: searchQuery,
      ts: new Date().getTime()
    },
    function(response) {
      if(!response){
        console.log(chrome.runtime.lastError);
        return;
      }
      var key = response.key
      console.log("Search query is or was saved in database with key", key)

      $("a").on('click', function(){
        // on link click send message to add link to db
        var linkTitle = $(this).text()
        var link = $(this).attr('data-href')
        console.log("Attempting to add opened link to query record :", linkTitle + " : " + link)

        sendClickAction({title: linkTitle,link: link},key);

      })
    }
  )

}


function sendClickAction(linkObj,key){

  chrome.runtime.sendMessage(
          {for: "background", action: "store", store: "search-link", key: key, title: linkObj.title, link: linkObj.link},
          function(response) {
            console.log("Opened link ("+linkObj.link+") added to search query record")
          }
  )
}
