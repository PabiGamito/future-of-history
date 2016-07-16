requestSearchesFromIndexedDB()

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.for == "history") {
      if (request.searches){
        // Add loaded searches to page (default: past day searches)
        displaySearches(request)
      }
    }
  }
)

Vue.filter('format_time', function (ts) {
  return moment.unix(ts/1000).calendar()
})

// README: Add the following code back in if needed
/*var SearchesComponent = {
  template: '#searches',
  data: function(){
    return {
      searches: []
    }
  },
  ready: function(){
    this.fetchSearches(0,30);
  },
  methods: {
    fetchSearches: function(offset,limit){
      offset = offset || 0;
      limit = limit || 30;
      var _self = this;
      fetchSearchesFromIndexDB(offset,limit,function(error,items){
        if(error){
          //TODO Shoe error alert
          return;
        }
        _self.searches = items;
      });
    },
    formatTime: function(ts){
      return moment.unix(ts/1000).calendar()
    }
  }
}*/


new Vue({
    el: '#app',
    data: {
      'active_tab': 'visited'
    },
    methods: {
      activateTab: function(name){
        this.active_tab = name;
      }
    },
    components: {'search-component': SearchesComponent},
    computed: {
      searchTabIsActive: function(){
        return this.active_tab == 'search';
      },
      analyticsTabIsActive: function(){
        return this.active_tab == 'analytics';
      },
      visitedTabIsActive:  function(){
        return this.active_tab == 'visited';
      }
    }
  })


function requestSearchesFromIndexedDB(){
  chrome.runtime.sendMessage(
    {for: "background", database: "get", get: "searches"},
    function(response) {
      // Can't use response returns as undefined instead uses onMessage to receive data
    }
  )
}

function displaySearches(request){
  request.searches.reverse().forEach(function(searchData) {
    var searchQuery = searchData.query
    var formattedTime = moment.unix(searchData.ts/1000).calendar()
    var link = searchData.href
    var links = searchData.openedLinks
    // TODO: add to page based on how html is coded
    $("body").append("<p>"+formattedTime+": <a href='"+link+"'>"+searchQuery+"</a></p>")
    links.forEach(function(linkData){
      var href = linkData.link
      var title = linkData.title
      // TODO: add to page based on how html is coded
      // TODO: "Merge" same links together and add small badge with number of times opened next to it if opened more than once.
      $("body").append("<a href='"+href+"'>"+title+"</a><br>")
    })
    console.log(searchData)
  })
}

function addSearches(){
  // TODO: Make sure it doesn't add duplicates and does not skip some
  // Runs on load more request from user
}
