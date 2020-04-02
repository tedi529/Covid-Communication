CREATE TABLE governors (governor_id SERIAL PRIMARY KEY,
                        governor VARCHAR(50),
						state VARCHAR(20),
						party VARCHAR(20),
						inauguration VARCHAR(50),
						term_begin INTEGER,
						term_end INTEGER
						term_limit VARCHAR(10));


CREATE TABLE cases (update_id SERIAL PRIMARY KEY,
                    governor_id INTEGER,
					cases INTEGER,
					deaths INTEGER);
ALTER TABLE cases ADD CONSTRAINT fk_governor_id FOREIGN KEY (governor_id)
REFERENCES governors(governor_id);


CREATE TABLE governors_twitter (governor_id INTEGER PRIMARY KEY,
							   handle_id INTEGER,
							   twitter_handle TEXT,
							   gov_official_handle BOOLEAN);

ALTER TABLE governors_twitter ADD CONSTRAINT fk_governor_id FOREIGN KEY (governor_id)
REFERENCES governors(governor_id);