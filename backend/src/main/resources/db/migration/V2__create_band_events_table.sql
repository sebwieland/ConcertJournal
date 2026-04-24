-- Create band events table
CREATE TABLE IF NOT EXISTS band_events (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    band_name VARCHAR(255) NOT NULL,
    place VARCHAR(255),
    date DATE NOT NULL,
    comment TEXT,
    rating INT NOT NULL,
    users_id BIGINT NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_band_events_user FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_id ON band_events(users_id);
CREATE INDEX idx_date ON band_events(date);
CREATE INDEX idx_rating ON band_events(rating);