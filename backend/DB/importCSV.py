import csv
from datetime import datetime

# Assuming CSV content is saved in a file named 'events.csv'
with open('Bands.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        band_name = row['Band'].strip('()').strip()
        place = row['Wo'].strip()
        date = row['Wann'].strip()
        # Specific mappings
        if place == "Nürnberg":
            place = "Rock im Park"
        elif place == "Neuhausen ob Eck":
            place = "Southside Festival"
        elif place == "Karlsruhe":
            place = "Das Fest"
        elif place == "Straubenhardt":
            place = "Happiness Festival"

        if band_name and place and date:
            if len(date.split('.')) == 2:
                date = f"01.{date}"
            parsed_date = datetime.strptime(date, '%d.%m.%Y')
            sql_date = parsed_date.strftime('%Y-%m-%d')

            # Generate SQL INSERT statement
            sql = f"INSERT INTO band_events (band_name, place, date, users_id, rating) VALUES ('{band_name}', '{place}', '{sql_date}', 2, 5);"
            print(sql)