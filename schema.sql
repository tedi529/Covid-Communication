CREATE TABLE governors_twitter (governor_id INTEGER PRIMARY KEY,
							   handle_id INTEGER,
							   twitter_handle TEXT,
							   gov_official_handle BOOLEAN);

ALTER TABLE governors_twitter ADD CONSTRAINT fk_governor_id FOREIGN KEY (governor_id)
REFERENCES governors(governor_id);