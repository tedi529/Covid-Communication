from flask import Flask, render_template, jsonify, url_for, Response
import numpy as np
import os
import psycopg2

from time import sleep
import requests
import pandas as pd
import matplotlib.pyplot as plt
from config import password

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, func, create_engine, ForeignKey
from sqlalchemy.dialects.postgresql import TEXT, BOOLEAN
from sqlalchemy.orm import Session
import datetime as dt



#################################################
# Database Setup
#################################################
#Create ORM Classes
Base=declarative_base()

class Governors(Base):
    __tablename__="governors"
    governor_id = Column(Integer, primary_key = True, autoincrement=True)
    governor = Column(String(50))
    state = Column(String(20))
    party = Column(String(20))
    inauguration = Column(String(50))
    term_begin = Column(Integer)
    term_end = Column(Integer)
    term_limit = Column(String(10))

class Cases(Base):
    __tablename__="cases"
    record_date = Column(String(10),primary_key=True)
    governor_id = Column(Integer,ForeignKey("governors.governor_id"),primary_key=True)
    cases = Column(Integer)
    deaths = Column(Integer)


class Handles(Base):
    __tablename__="governors_twitter"
    governor_id = Column(Integer,ForeignKey("governors.governor_id"))
    handle_id = Column(Integer, primary_key = True)
    twitter_handle = Column(TEXT)
    gov_official_handle = Column(BOOLEAN)

class Tweets(Base):
    __tablename__="tweets"
    tweet_id = Column(Integer,primary_key=True,autoincrement=True)
    handle_id = Column(Integer,ForeignKey("governors.governor_id"))
    about_covid = Column(BOOLEAN)
    tweet_date = Column(String(10))
    tweet_handle = Column(TEXT)
    is_retweet = Column(BOOLEAN)


    
#Create Connection
engine = create_engine(f"postgresql://postgres:{password}@localhost:5432/Twitter_COVID19")
conn = engine.connect()

# cxnstring = os.environ['DATABASE_URL']
# engine = create_engine(cxnstring,pool_recycle=3600)
conn = engine.connect()
session = Session(bind=engine)
Base.metadata.create_all(engine)


#################################################
# Flask Setup
#################################################
app = Flask(__name__, static_url_path='')


#################################################
# Flask Routes
#################################################


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/<table_name>")
def tweet_tables(table_name):
    return Response(pd.read_sql(f"SELECT * FROM {table_name}", conn).to_json(orient='records'))


if __name__ == "__main__":
    app.run(debug=True)
