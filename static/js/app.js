// Create a string representation of the date.

function two_digit(entry){
  my_char = entry.toString() 
  if(my_char.length === 1){
    return '0'+my_char
  } else{
    return my_char
  }
}

function formatDate(date) {
  month = two_digit(date.getMonth()+1);
  num_date = two_digit(date.getDate());
  return date.getFullYear() + "-" + month + "-" + num_date;
}

function makeDate(my_str) {
  return new Date(my_str+'T00:00');
}

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

      table2.forEach(function(tweet){
        tweet.date_comp = makeDate(tweet.tweet_date);
      });

      // Group table2 by state and tweet date
      let grouped_states = _.groupBy(table2, "state");
      
      grouped_tweets = {}
      Object.keys(grouped_states).forEach(function(state){
        temp = _.groupBy(grouped_states[state],"tweet_date");

        grouped_tweets[state] = Object.entries(temp).sort(function(a,b){
          return makeDate(a[0]) - makeDate(b[0]);
        });
      });


      function sort_tweets(my_list){
        counter = {};
        covid_tweets = my_list.filter(tweet => tweet.about_covid===true);
        counter.all = my_list.length;
        counter.covid=covid_tweets.length;
        counter.non_covid= counter.all-counter.covid;
        return counter;
      }



      

      tweets_counter = {}
      Object.keys(grouped_tweets).forEach(function(state){
        dates = []
        tweet_dates = grouped_tweets[state].map(x=>x[0]);
        date_arr.forEach(function(date){
          if(tweet_dates.includes(date)){
            count = sort_tweets(grouped_tweets[state].filter(x=>x[0]===date)[0][1]);
            dates.push([date,count]);
          } else{
            dates.push([date,{all:0,covid:0,non_covid:0}]);
          }



          
        })

        tweets_counter[state] = dates
      });

      console.log(tweets_counter);


      
      // Code based on examples from noUSSlider documentation
      function timestamp(str) {
        return new Date(str).getTime();
      }

      var dateSlider = d3.select('#slider');

      noUiSlider.create(dateSlider, {
        // Create two timestamps to define a range.
        range: {
        min: timestamp('2010'),
        max: timestamp('2016')
      },

      // Steps of one week
      step: 7 * 24 * 60 * 60 * 1000,

      // Two more timestamps indicate the handle starting positions.
      start: [timestamp('2011'), timestamp('2015')],

      // No decimals
      format: wNumb({
        decimals: 0
        })
      });

      var dateValues = [
        d3.select('#event-start'),
        d3.select('#event-end')
      ];

      dateSlider.noUiSlider.on('update', function (values, handle) {
        handle_date = new Date(+values[handle]);
        console.log(handle_date)
        // dateValues[handle].innerHTML = formatDate();
      });



    });      
  });
});