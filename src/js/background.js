/* 

  INITIALIZE DB CODE

  using Dexie IndexedDB Lib
  @see https://github.com/dfahlander/Dexie.js/wiki/API-Reference

 */

var DB = new Dexie('FutureHistory');

DB.version(1).stores({
  searches: "++id,query,ts,openedLinks"
});

DB.open().catch(function(error){
  console.log(error);
});


var SearchQueryUrls = [];

/* INITIALIZE CHROME API LISTENERS */

chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.create({'url': chrome.extension.getURL('src/history.html')}, function(tab) {
    // Tab opened.
  })
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "background") {
      switch (request.action) {
        case "get":
          handleRequestForRetrieval(request,sendResponse);
          break;
        case "store":
          handleRequestForStorage(request,sendResponse);
          break;
        case "log_links":
          handleRequestForLogLinks(request,sendResponse);
        case "check_link":
          handleRequestForCheckLink(request,sendResponse);    
      }

    }

    return true;
  });


function handleRequestForLogLinks(request,sendResponse){
  var links = request.links;
  SearchQueryUrls = SearchQueryUrls.concat(links);
}

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
          case "search":
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
                    sendResponse({key: response});
                  });
                }else{
                  sendResponse({key: query.id});
                }
              });

            break;

          case "search-link":
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

            });
            break;
        
          default:
            return true;
      }
}


function handleRequestForRetrieval(request,sendResponse){
       if (request.get == "searches") {

          var upperBound = parseInt(moment().format('x'))
          var lowerBound = parseInt(moment().subtract(1, 'days').format('x'))


          DB.searches
            .where('ts')
            .between(lowerBound, upperBound)
            .toArray()
            .then(function (searches) {
              sendResponse({searches: searches})
            });

        }

}