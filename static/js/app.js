statesData.features = statesData.features.filter(x => (x.properties.name != 'District of Columbia') && (x.properties.name != 'Puerto Rico'));

let day_length = 24 * 60 * 60 * 1000;
// Based on Code from https://leafletjs.com/examples/choropleth/
let API_KEY = "pk.eyJ1IjoiamFjb2JzcGVhcjc3IiwiYSI6ImNrN3pjaThlajAwemQzaHA5bzM1eGJzYXYifQ.MSARNqh9xc7rTb8PQ1p4Qw";
var mapboxAccessToken = API_KEY;
var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
    id: 'mapbox/light-v9',
    attribution:  "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);



date_range = ['2020-02-01','2020-02-07'];

  

// Create a string representation of the date.
function divide(n,d){
  if(d!=0){
    return n/d;
  } else {
    return 0;
  }
};

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

function addWeek(myStr){
  temp = new Date(makeDate(myStr).getTime()+7*day_length);
  return formatDate(temp);
}

// Code based on examples from noUSSlider documentation
function timestamp(str) {
  return makeDate(str).getTime();
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

      

      function add_tweets(start,stop,state){
        state_data = tweets_counter[state];
        if(state_data===undefined){
          return {all:0,covid:0,noncovid:0}
        } else{
          data = tweets_counter[state].filter(function(row){
            after_start = timestamp(start)<=timestamp(row[0]);
            before_stop = timestamp(stop)>=timestamp(row[0]);
            return (after_start && before_stop);
          });
          total = {all:0,covid:0,noncovid:0};
          data.forEach(function(day){
            total.all = total.all + day[1].all;
            total.covid = total.covid + day[1].covid;
            total.noncovid = total.noncovid + day[1].non_covid;
          });
          return total;

        }
      }


      function get_color(info,start,stop){
        all = info.all
        covid = info.covid
        noncovid = info.noncovid
        proportion = divide(covid,all);
        interval = (timestamp(stop) - timestamp(start))/day_length
        rate = all/interval
        adjusted_proportion = 1+Math.pow(Math.abs(proportion-0.5),1.6)*Math.sign(proportion-0.5);
        

        if(rate<=0){
          transparency = 0;
        } else if(rate < 5){
          transparency = 1-Math.pow((5-rate/5),2);
        } else{
          transparency = 1;
        }
        

        green = 36*proportion + 213*(1-proportion);
        red = 213*proportion +36*(1-proportion);
        blue = 40;

        return `rgb(${red},${green},${blue},${transparency})`
      };


      function update_map(start,stop){

        
        statesData.features.forEach(function(element){
          info = element.properties;
          state = info.name
          info.tweets =  add_tweets(start,stop,state)        
        });

        function style(feature){
          return {
            fillColor:get_color(feature.properties.tweets),
            weight: 2,
            color: 'black'
          };
        }
        map.remove();
        map = L.map('map').setView([37.8, -96], 4);
        
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
            id: 'mapbox/light-v9',
            attribution:  "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);    

        fill_layer = L.geoJson(statesData,{style: style}).addTo(map);
      }

      
      
      function make_slider(value){
        console.log(value);
        if(value==="day"){
          slider = document.getElementById('slider');
          slider.noUiSlider.destroy();
          noUiSlider.create(slider, {
            // Create two timestamps to define a range.
            range: {
            min: timestamp('2020-02-01'),
            max: timestamp('2020-04-03')
            },
    
            // Steps of one week
            step: day_length,
    
            // Two more timestamps indicate the handle starting positions.
            start: [timestamp(date_range[0]), timestamp(date_range[1])],
    
            // No decimals
            format: wNumb({
              decimals: 0
              })
            });
    
          var dateValues = [
            d3.select('#event-start'),
            d3.select('#event-end')
          ];
    
          handle_id = ['From: ',"To: "]
    
          slider.noUiSlider.on('update', function (values, handle) {
            handle_date = new Date(+values[handle]);
            dateValues[handle].text(`${handle_id[handle]}${formatDate(handle_date)}`);
            date_range[handle] = formatDate(handle_date);
            update_map(date_range[0],date_range[1]);        
          });
    



        } else if(value==="week"){
          // Code based on examples from noUiSlider documentation
      
            slider = document.getElementById('slider');
            slider.noUiSlider.destroy();   

            noUiSlider.create(slider, {
              // Create two timestamps to define a range.
              range: {
              min: timestamp('2020-02-01'),
              max: timestamp('2020-04-03')
              },

              // Steps of one week
              step: day_length,

              // Two more timestamps indicate the handle starting positions.
              start: [timestamp(date_range[0])],

              // No decimals
              format: wNumb({
                decimals: 0
                })
              });

            var dateValues = [
              d3.select('#event-start'),
              d3.select('#event-end')
            ];

            handle_id = ['From: ',"To: "]

            slider.noUiSlider.on('update', function (arr) {
              time = parseInt(arr[0]);     
              date_1 = new Date(time)
              week_range = [formatDate(date_1),addWeek(formatDate(date_1))];
              week_range.forEach(function(my_date,idx){
                dateValues[idx].text(`${handle_id[idx]}${my_date}`);
                date_range[idx] = my_date;
              });                        
              update_map(date_range[0],date_range[1]);       
            });

              }
      }
            
      selMap = d3.select('#selMap');
      selMap.on('change',function(){
        val = this.value;
        if(val==="day"){
          text = "Adjust by Date Range";
        } else if(val === "week"){
          text = "Adjust by Week";
        }
        
        make_slider(this.value);
        d3.select("#slider_label").text(text);
      })


      
      // Code based on examples from noUiSlider documentation
      
      slider = document.getElementById('slider'); 

      noUiSlider.create(slider, {
        // Create two timestamps to define a range.
        range: {
        min: timestamp('2020-02-01'),
        max: timestamp('2020-04-03')
        },

        // Steps of one week
        step: day_length,

        // Two more timestamps indicate the handle starting positions.
        start: [timestamp(date_range[0])],

        // No decimals
        format: wNumb({
          decimals: 0
          })
        });

      var dateValues = [
        d3.select('#event-start'),
        d3.select('#event-end')
      ];

      handle_id = ['From: ',"To: "]

      slider.noUiSlider.on('update', function (arr) {
        time = parseInt(arr[0]);     
        date_1 = new Date(time)
        week_range = [formatDate(date_1),addWeek(formatDate(date_1))];
        week_range.forEach(function(my_date,idx){
          dateValues[idx].text(`${handle_id[idx]}${my_date}`);
          date_range[idx] = my_date;
        });                           
        update_map(date_range[0],date_range[1]); 
      }
      )
      

      


      update_map(date_range[0],date_range[1]);







    });      
  });
});