chrome.runtime.sendMessage(
  {for: "background", database: "get", get: "searches"},
  function(response) {
    console.log(response.searches)
  }
)
