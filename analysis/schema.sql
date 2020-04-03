
-- Governors Table (Run with Jupyter Upload)
CREATE TABLE governors (governor_id SERIAL PRIMARY KEY,
                        governor VARCHAR(50),
						state VARCHAR(20),
						party VARCHAR(20),
						inauguration VARCHAR(50),
						term_begin INTEGER,
						term_end INTEGER,
						term_limit VARCHAR(10));




-- Cases Table (Run with Jupyter Upload)
CREATE TABLE cases (record_date VARCHAR(10),
                    governor_id INTEGER,
					cases INTEGER,
					deaths INTEGER);
ALTER TABLE cases ADD CONSTRAINT fk_governor_id FOREIGN KEY (governor_id)
REFERENCES governors(governor_id);

ALTER TABLE cases ADD CONSTRAINT pk_cases PRIMARY KEY (record_date,governor_id);





-- Governors_Twitter Table (Run with Postgres Import)
CREATE TABLE governors_twitter (governor_id INTEGER,
							   handle_id INTEGER,
							   twitter_handle TEXT,
							   gov_official_handle BOOLEAN);

ALTER TABLE governors_twitter ADD CONSTRAINT fk_governor_id FOREIGN KEY (governor_id)
REFERENCES governors(governor_id);

ALTER TABLE governors_twitter ADD CONSTRAINT pk_handle PRIMARY KEY (handle_id);



-- Tweets Table (Run with Jupyter Upload)
CREATE TABLE tweets (tweet_id SERIAL PRIMARY KEY,
                     handle_id INTEGER,
					 about_covid BOOLEAN,
					 tweet_date VARCHAR(10),
					 tweet_handle TEXT,
					 is_retweet BOOLEAN);
ALTER TABLE tweets ADD CONSTRAINT fk_handle_id FOREIGN KEY (handle_id)
	REFERENCES governors_twitter(handle_id);

