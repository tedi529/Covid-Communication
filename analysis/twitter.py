from bs4 import BeautifulSoup as bs
import pandas as pd
import requests
from splinter import Browser
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options  
from time import sleep
import pymongo
import csv
import os   
from datetime import datetime, date
import dateutil.parser as dp
import numpy as np

def init_browser():
    # @NOTE: Replace the path with your actual path to the chromedriver
    executable_path = {"executable_path": "chromedriver.exe"}
    return Browser("chrome", **executable_path, headless=False)

def get_date(my_str):
    str_time = dp.parse(my_str).replace(tzinfo=None)
    return datetime.strftime(str_time,"%Y-%m-%d")

def feb_or_later(my_str):
    str_time = dp.parse(my_str).replace(tzinfo=None)
    start_time = dp.parse('2020-02-01T00:00:00.000Z').replace(tzinfo=None)
    return (str_time >= start_time)


def parse_tweet(tweet):
    entry = {}
            
    #Get Time of Tweet
    entry['time'] = tweet.find("time")['datetime']


    # Gets Text of Tweet
    # L is the "layers" of the tweet.  L[2] is the text itself.
    Layers = []
    Layers.append(tweet.findAll("div",recursive=False)[1])
    Layers.append(Layers[0].findAll("div",recursive=False)[1])
    Layers.append(Layers[1].findAll("div",recursive=False)[len(Layers[1])-3].text)
    entry['text'] = Layers[2]
    
    #Checks For Tweets about COVID-19
    keywords = ['covid','virus','corona','distancing','masks',
                'ppe','ventilators','flatten','test',
                'healthcare professionals','healthcare workers',
                'patients','spread','stay home','stayhome','unprecedented']

    about_covid = False
    
    for word in keywords:
        if word in entry['text'].lower():
            about_covid = True
            break
    
    entry['about_covid']=about_covid


    #Get Handle
    entry['handle'] = Layers[0].findAll('a')[0]['href']


    #Get Is_Retweet
    info = tweet.find_parent('div').find('div').text
    entry['is_retweet'] = ('retweet' in info.lower())
    
    return entry

#Scrapes many tweets
def twitter(url):
    #SOURCE: https://medium.com/@dawranliou/twitter-scraper-tutorial-with-python-requests-beautifulsoup-and-selenium-part-2-b38d849b07fe
    chrome_options = Options()  
    chrome_options.add_argument("--headless") 
    driver = webdriver.Chrome(executable_path=os.path.abspath("chromedriver"), options=chrome_options)  
    driver.get(url)
    print('here')
    body = driver.find_element_by_tag_name('body')
    sleep(4)
    
    
    tweets = []
    last_tweet_date = date.today()
    run = True
    while run:
        body.send_keys(Keys.PAGE_DOWN)
        html = driver.page_source
        soup = bs(html,'lxml')
        timeline = soup.findAll("div", {"data-testid" : "tweet"})
        
        for tweet in timeline:
            try:
                response = parse_tweet(tweet)
                
                if not response['is_retweet']:
                    tweet_time = response['time']
                    run = feb_or_later(tweet_time)
                    
                    
                
                if run:
                    add = True
                    for tweet in tweets:
                        if ((response['time']==tweet['time']) 
                            and (response['handle']==tweet['handle'])):
                            add = False
                            break                    
           
                    if add:
                        if not response['is_retweet']:
                            last_tweet_date = get_date(response['time'])
                        
                        response['tweet_date'] = last_tweet_date
                        tweets.append(response)
                
                
            except TypeError:
                #This allows us to ignore deleted tweets
                pass


    driver.close()
    return tweets
    
   