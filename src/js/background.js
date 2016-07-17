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


/* INITIALIZE CHROME API LISTENERS */

chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.create({'url': chrome.extension.getURL('src/history.html')}, function(tab) {
    // History opened in new tab
  })
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "background") {
      console.log("Message received from", sender, "with the following data", request)

      switch (request.action) {
        case "get":
          console.log("Message is a request to get data from the database from ")
          handleRequestForRetrieval(request,sendResponse);
          break;
        case "store":
          console.log("Message is a request to add data to the database from ")
          handleRequestForStorage(request,sendResponse);
          break;
      }

    }

    return true;
  });



function handleRequestForStorage(request,sendResponse){

        switch (request.store) {
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
          var lowerBound = parseInt(moment().subtract(1, 'days').format('x'))


          DB.searches
            .where('ts')
            .between(lowerBound, upperBound)
            .toArray()
            .then(function (searches) {
              sendResponse({searches: searches})
              console.log("Got searches and send data in response")
            });

        }

}
