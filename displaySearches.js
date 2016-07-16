chrome.runtime.sendMessage(
  {for: "background", database: "get", get: "searches"},
  function(response) {
    //Can't use response returns as undefined instead uses onMessage to receive data
  }
)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "history") {
      if (request.searches)
      alert("Got a message");
      console.log(request.searches)
    }
  }
)
