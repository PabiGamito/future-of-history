chrome.runtime.sendMessage(
  {for: "background", database: "get", get: "searches"},
  function(response) {
    //Can't use response returns as undefined instead uses onMessage to receive data
  }
)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "history") {
      if (request.searches){
        request.searches.forEach(function(searchData) {
          var searchQuery = searchData.query
          var formattedTime = moment.unix(searchData.ts/1000).calendar()
          var links = searchData.openedLinks
          $("body").append("<p>"+formattedTime+"</p>")
          console.log(searchData)
        })
      }
    }
  }
)
