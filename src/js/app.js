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

      var SearchQueryUrls = [];

      var $searchLinks = $('#rso .r a')

      console.log("Attempting to add all search links to array", $searchLinks)
      $searchLinks.each(function(index,value){
        var url = $(value).attr('data-href');
        if (!url) {
          url = $(value).attr('href')
        }
        console.log("Pushing search link", url, "to arr")
        SearchQueryUrls.push({
          link: url,
          url: url,
          key: key
        });

      });

      $searchLinks.on('click', function(){
          var linkTitle = $(this).text()
          var link = $(this).attr('data-href');

          if(!link){
            link = this.href;
          }

          console.log("Attempting to add opened link to query record :", linkTitle + " : " + link)

          sendClickAction({title: linkTitle,link: link},key);
      })

      console.log("Attempting to log links", SearchQueryUrls)

      chrome.runtime.sendMessage(
      {
        for: "background",
        action: "log_links",
        links: SearchQueryUrls
      },
      function(response) {
        if (response.saved) {
          console.log("Saved link as seached for link")
        }
      });
    }
  )

} //End if google search

// Send message to check if current page link matches a search query. If so, link added to query record as opened link
chrome.runtime.sendMessage(
    {
      for: "background",
      action: "check_link",
      href: window.location.href,
      title: document.title,
      referrer: document.referrer
    },
    function(response) {
      if (response.result) {
        console.log("Current opened page assumed to be opened from a search and saved in database to matching search query record")
      }
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


// Adds website as a new history record in database

chrome.runtime.sendMessage(
    {
      for: "background",
      action: "store",
      store: "history",
      title: document.title,
      href: window.location.href,
      referrer: document.referrer
    },
    function(response) {

    }
);

// TODO: Track time spend on a website. Time interval in which website was open, and time intervals when user was active on website
// README: Check out TimeMe.js - https://github.com/jasonzissman/TimeMe.js
