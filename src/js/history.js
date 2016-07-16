Vue.filter('format_time', function (ts) {
  return moment.unix(ts/1000).calendar()
})

var SearchesComponent = {
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
    toggleShowLinkedList: function(item){
      item.showLinkedList = !item.showLinkedList;
    }
  }
}




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



function fetchSearchesFromIndexDB(offset,limit,callback){
  chrome.runtime.sendMessage(
    {for: "background", action: "get", get: "searches"},
    function(response) {
      if (response.searches){

          var data = response.searches;
          data = _.groupBy( _.each(data,function(item,index){
            item.day = moment(item.ts).format('DD.MM.YYYY');
            item.time = moment(item.ts).format('h:mm');
            item.showLinkedList = false;
          }),'day');

          callback(null,data);
          return;
      }

      callback({error: 'failed to fetch Searches'});

    }
  )
}