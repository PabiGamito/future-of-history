if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  console.log("Detected google search")

  var uri = (window.location.search.substr(1)+window.location.hash)
  var dec = decodeURI(uri)
  var query = dec.split(/[\#\&]/g)
  var params = {}

  query.forEach(function(q){
    var qs = q.split("=")
    params[qs[0]] = qs[1].replace(/\+/g, " ")
  });

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

      SearchQueryUrls = [];

      $('#rso .r a').each(function(index,value){
        console.log(index+value)
        var url = $(value).attr('data-href');
        if(!url){
          url = value.href;
        }

        SearchQueryUrls.push({
            title: $(value).text(),
            link: url,
            url: url,
            key: key
          });

      });

      $("a").on('click', function(){
          var linkTitle = $(this).text()
          var link = $(this).attr('data-href');

          if(_.isEmpty(link)){
            link = this.href;
          }

          console.log("Attempting to add opened link to query record :", linkTitle + " : " + link)

          sendClickAction({title: linkTitle,link: link},key);
      })

      chrome.runtime.sendMessage(
      {
        for: "background",
        action: "log_links",
        links: SearchQueryUrls
      },
      function(response) {

      });
    }
  )

} //End if google search

// Send message to check if current page link matches a search query. If so, link added to query record as opened link
chrome.runtime.sendMessage(
    {
      for: "background",
      action: "check_link",
      href: window.location.href
    },
    function(response) {

    }
);



function sendClickAction(linkObj,key){

  chrome.runtime.sendMessage(
          {for: "background", action: "store", store: "search-link", key: key, title: linkObj.title, link: linkObj.link},
          function(response) {
            console.log("Opened link ("+linkObj.link+") added to search query record")
          }
  )

}
