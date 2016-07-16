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
        request.searches.reverse().forEach(function(searchData) {
          var searchQuery = searchData.query
          var formattedTime = moment.unix(searchData.ts/1000).calendar()
          var link = searchData.href
          var links = searchData.openedLinks
          $("body").append("<p>"+formattedTime+": <a href='"+link+"'>"+searchQuery+"</a></p>")
          links.forEach(function(linkData){
            $("body").append("<a href='"+linkData.link+"'>"+linkData.title+"</a></p>")
          })
          console.log(searchData)
        })
      }
    }
  }
)
