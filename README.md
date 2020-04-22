# US Gubernatorial Covid-19 Communication
Deployed visualizations @ <a href="https://covidcommunication.herokuapp.com/">Covid Communication</a>
<hr>

<p> During the ongoing coronavirus crisis, this project aims to visualize the twitter communication of governors in all 50 states of the United States, as the diagnosed cases increase in each state from nearly no diagnosed cases on February 1, 2020 to the more than two hundred seventy thousand diagnosed cases on April 3, 2020. </p>

## Approach
<p> We compiled the following words as a good representation of whether a tweet's subject was Covid-19 as they are high-frequency words used in the context of the Covid-19 crisis: <strong> covid, virus, corona, distancing, masks, ppe, ventilators, flatten, test, healthcare professionals, healthcare workers, patients, spread, stay home, stayhome, unprecedented</strong>.</p>
  
<p> We gathered governor tweets and Covid-19 case information in the process outlined below and loaded the data in a local PostgreSQL database. We then served our information using a <a href="https://github.com/tedi529/Covid-Communication/blob/master/app.py">Flask app</a>. </p>

  - <p> We used <a href="https://simple.wikipedia.org/wiki/List_of_United_States_governors">wikipedia</a> to scrape information about every US governor as of March 26, 2020 in this <a href="https://github.com/tedi529/Covid-Communication/blob/master/analysis/Governors%20Scraper.ipynb">notebook</a>.</p>
  - <p> We scraped the professional and personal twitter handles of every US governor from February 1, 2020 to April 3, 2020 in this <a href="https://github.com/tedi529/Project-CovidCommunication/blob/master/analysis/Tweet_Scraper_Final.ipynb">notebook</a>.</p>
  - <p> We used the <a href="https://github.com/nytimes/covid-19-data">NYT Covid-19 Github Repository</a> to obtain state case information  for all dates <a href="https://github.com/tedi529/Covid-Communication/blob/master/analysis/Case_Count_Scraper.ipynb">here</a>.</p>

<p> We manipulated the data and built our visualizations using <a href="https://leafletjs.com/">Leaflet</a> and <a href="https://plotly.com/">Plotly</a> in the following files: <a href="https://github.com/tedi529/Covid-Communication/blob/master/static/js/app.js">app.js</a> and <a href="https://github.com/tedi529/Covid-Communication/blob/master/static/js/app1.js">app1.js</a>.</p> 

## Observations
<p> As expected, the count and proportion of tweets about Covid-19 by each governor increases as the instance of the virus increases in each state. The majority of tweets about Covid-19 occur after mid-March with very few before mid-February. There is a steady increase in the use of twitter after mid March, as evidenced by the increasing quantity of tweets. There is a second degree exponential increase in coronavirus cases in all states starting in mid March. The first instances of death due to coronavirus occur after mid March in most states, with notable exceptions Washington state, New York state, and California. </p>
