if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  
  var uri = (window.location.search.substr(1)+window.location.hash)
  var dec = decodeURI(uri)
  var query = dec.split(/[\#\&]/g)
  var params = {}
  
  query.forEach(function(q){
    var qs = q.split("=")
    params[qs[0]] = qs[1].replace(/\+/g, " ")
  });

  var searchQuery = params.q
  
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

      SearchQueryUrls = [];

      $('a').each(function(index,value){
        var url = $(value).attr('data-href');
        if(_.isEmpty(url)){
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

}


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



