/*

  INITIALIZE DB CODE

  using Dexie IndexedDB Lib
  @see https://github.com/dfahlander/Dexie.js/wiki/API-Reference

 */

var DB = new Dexie('FutureHistory');

DB.version(1).stores({
  searches: "++id,query,openedLinks,ts",
  history: "++id,title,href,referrer,ts"
});

DB.open().catch(function(error){
  console.log(error);
});

// Variable to store search query clickabled links in
var SearchQueryUrls = [];

/* INITIALIZE CHROME API LISTENERS */

// Listen for browserAction button icon click to open history.html in new tab
chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.create({'url': chrome.extension.getURL('src/history.html')}, function(tab) {
    // History opened in new tab
  })
});

// Listen for message request from other parts of the extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "background") {

      console.log("Message received from", sender, "with the following data", request)

      switch (request.action) {
        case "get":
          console.log("Message is a request to get data from the database")
          handleRequestForRetrieval(request,sendResponse);
          break;
        case "store":
          console.log("Message is a request to add data to the database")
          handleRequestForStorage(request,sendResponse);
          break;
        case "log_links":
          console.log("Message is a request to log links from search")
          handleRequestForLogLinks(request,sendResponse);
          break;
        case "check_link":
          console.log("Message is a request to check if link is from a search")
          handleRequestForCheckLink(request,sendResponse);
          break;
      }

    }

    return true;
  });

// Adds all clickable links from searches to SearchQueryUrls
function handleRequestForLogLinks(request,sendResponse){
  var links = request.links;
  SearchQueryUrls = SearchQueryUrls.concat(links);
  console.log("Logged all link", SearchQueryUrls)
}

// Checks request from content on load if loaded page belonged to possible clicked link
// NOTE + TODO: This those not guaranty however that user got to site from a search...
function handleRequestForCheckLink(request,sendResponse){
  if(obj = isSearchQueryUrl(request.href)){

     DB.searches
        .where('id')
        .equals( parseInt(obj.key))
        .first()
        .then(function (data) {
          var link = obj.link || obj.url;

          var item = _.find(data, ['link', link]);

          if(typeof item == 'undefined'){

            data.openedLinks.push({
              link: link,
              title: obj.title
            })

            DB.searches.update(obj.key,data)

            console.log("Clicked link", link, "added to database. Record saved", data)
            sendResponse({saved: true})

          }

        });
  }
}

function isSearchQueryUrl(url){
  console.log(url);

  if(!SearchQueryUrls.length){
    return false;
  }

  var items = SearchQueryUrls.filter(function(obj,index){
    return obj.url == url || obj.link == url;
  });

  return items.length > 0 ? items.pop() : false;
}


function handleRequestForStorage(request,sendResponse){

        switch (request.store) {
          case "history":
            console.log("Database add request is to store a url as history")
            var queryObject = {title: request.title, href: request.href, referrer: request.referrer, ts: new Date().getTime() }

            DB.history.add(queryObject).then(function(response){
              console.log("Link saved in history with key", response)
              sendResponse({stored: true, key: response});
            });
            break;
          case "search":
            console.log("Database add request is to store search query")
            var queryObject = {query: request.query, ts: request.ts, openedLinks: []};
            var upperBound = parseInt(moment().format('x'))
            var lowerBound = parseInt(moment().hours(0).minutes(0).seconds(0).format('x'))

            DB.searches
              .where('ts')
              .between(lowerBound, upperBound)
              .toArray()
              .then(function (items) {
                var query = items.filter(function(q){
                  return q.query == queryObject.query;
                }).pop();

                if(!query){
                  DB.searches.add(queryObject).then(function(response){
                    console.log("Search query saved with key", response)
                    sendResponse({key: response});
                  });
                }else{
                  console.log("Search query already saved today with key", query.id)
                  sendResponse({key: query.id});
                }
              });

            break;

          case "search-link":
            console.log("Database add request is to store an opened link")
            DB.searches
            .where('id')
            .equals( parseInt(request.key))
            .first()
            .then(function (data) {

              console.log(data);

              data.openedLinks.push({
                link: request.link,
                title: request.title
              })

              DB.searches.update(request.key,data)
              console.log("Added link to search query record", request.title+" : "+request.link)

            });
            break;

          default:
            return true;
      }
}


function handleRequestForRetrieval(request,sendResponse){
       if (request.get == "searches") {
         console.log("Database get request is to retreive search queries data")

          var upperBound = parseInt(moment().format('x'))
          var lowerBound = parseInt(moment().subtract(7, 'days').format('x'))


          DB.searches
            .where('ts')
            .between(lowerBound, upperBound)
            .toArray()
            .then(function (searches) {
              sendResponse({searches: searches.reverse()})
              console.log("Got searches and send data in response")
            });

        }

}
