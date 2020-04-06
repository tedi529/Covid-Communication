// Code to re-factor js array into necessary format and graph governors bar graph and cases using plotly

// Function to create a string representation of the date and add "0" in front when necessary
function two_digit(entry) {
  my_char = entry.toString() 
  if(my_char.length === 1) {
    return '0'+my_char
  } else{
    return my_char
  }
}

// Functions that return date in necessary formats
function formatDate(date) {
  month = two_digit(date.getMonth()+1);
  num_date = two_digit(date.getDate());
  return date.getFullYear() + "-" + month + "-" + num_date;
}

function makeDate(my_str) {
  return new Date(my_str+'T00:00');
}

// Create array of dates from Feb 1, 2020 to April 3, 2020
date_arr = []
date = makeDate('2020-02-01')
while (date <= makeDate('2020-04-03')) {
  date_arr.push(formatDate(date));
  date.setDate(date.getDate()+1);
};

// Read information with API call to our page
d3.json("/api/governors").then(function(governors) {
  
  d3.json("/api/governors_twitter").then(function(governors_twitter) {

    d3.json("/api/tweets").then(function(tweets) {
      
      // Join of governors and their twitter handles
      const join1 = (a1, a2) => 
        a1.map(itm => ({
          ...a2.find((item) => (item.governor_id === itm.governor_id) && item),
          ...itm
      }));
       
      let table1 = join1(governors_twitter, governors);
      
      // Join of table1 and tweets of each governor
      const join2 = (a1, a2) => 
        a1.map(itm => ({
          ...a2.find((item) => (item.handle_id === itm.handle_id) && item),
          ...itm
      }));  

      let table2 = join2(tweets, table1);
      console.log(table2)

      // Join of table 2 and cases of each day

      // Format each tweet date
      table2.forEach(function(tweet) {
        tweet.date_comp = makeDate(tweet.tweet_date);
      });

      // Group table2 by state and tweet date
      let grouped_states = _.groupBy(table2, "state");
      
      // Group each state by tweet date
      grouped_tweets = {}
      Object.keys(grouped_states).forEach(function(state) {
        temp = _.groupBy(grouped_states[state],"tweet_date");

        grouped_tweets[state] = Object.entries(temp).sort(function(a,b) {
          return makeDate(a[0]) - makeDate(b[0]);
        });
      });

      // Function to create object of tweet counts 
      function sort_tweets(my_list) {
        counter = {};
        covid_tweets = my_list.filter(tweet => tweet.about_covid===true);
        counter.all = my_list.length;
        counter.covid=covid_tweets.length;
        counter.non_covid= counter.all-counter.covid;
        return counter;
      }

      // Create object of tweet counts
      tweets_counter = {}
      Object.keys(grouped_tweets).forEach(function(state) {
        dates = [];
        tweet_dates = grouped_tweets[state].map(x=>x[0]);
        date_arr.forEach(function(date) {
          if (tweet_dates.includes(date)) {
            count = sort_tweets(grouped_tweets[state].filter(x=>x[0]===date)[0][1]);
            dates.push([date,count]);
          } else {
            dates.push([date,{all:0,covid:0,non_covid:0}]);
          }  
        })

        tweets_counter[state] = dates
      });

      // Create states array
      let states = Object.keys(tweets_counter);

      console.log(tweets_counter)

      // Create dropdown menu function
      function loadDropdown() {
        let dropdownMenu = $("#selGovernor2");
        dropdownMenu.empty();

        dropdownMenu.prop('selectedIndex', 0);

      // Populate dropdown with states
        $.each(Object.keys(grouped_states), function (index, entry) {
          dropdownMenu.append($('<option></option>').attr('value', entry).text(entry));
        });
      };  
    
      // Call updatePage() when a change takes place to the DOM (a new state is selected)
      function updatePage(state) {
        
        // Creates individual bar plot of number of tweets about Covid-19
        let trace_non_covid = {
          x: date_arr,
          y: tweets_counter[state].map(x => x[1].non_covid),
          name: "Not About Covid-19",
          type: "bar"
        };

        let trace_covid = {
          x: date_arr,
          y: tweets_counter[state].map(x => x[1].covid),
          name: "About Covid-19",
          type: "bar"
        }

        let data = [trace_non_covid, trace_covid];

        let layout = {
          xaxis: {title: "Date"},
          yaxis: {title: "Tweet Count"},
          barmode: 'group'
        };

        Plotly.newPlot('bar_graph', data, layout, {responsive: true});
      }; 

      // Initialize the page with default plot of first governor
      function init() {
        let firstState = states[0]

        loadDropdown();
        updatePage(firstState);

        // Call updatePage() when a change takes place to the DOM
        d3.selectAll("#selGovernor2").on("change", function() {
          let state = states.filter(i => i == this.value);

          updatePage(state);
        });
      };

      init();

    });      
  });
});


