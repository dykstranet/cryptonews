#!/usr/bin/env python3
import csv
import datetime
import os

import investpy
import pandas as pd

today = datetime.datetime.today()
if today.day == 1 and today.month == 1:
    print("Don't run this script (generate_annotated_price_data.py) during new year!"
          " It's a corner case not yet implemented.")
    exit(1)

unused_columns = ['Open', 'High', 'Low', 'Currency']
last_year = today.year - 1
csv_early_filename = 'data/btcusd_early.csv'

def load_early_data():
    ed = investpy.get_crypto_historical_data(
        crypto='bitcoin',
        from_date='01/01/2010',
        to_date=f'31/12/{last_year}')
    ed = ed.drop(columns=unused_columns)
    ed.to_csv(csv_early_filename)
    ed = ed.reset_index(level=0)
    ed.Date = ed.Date.dt.strftime('%Y-%m-%d')
    return ed

if os.path.isfile(csv_early_filename):
    early_data = pd.read_csv(csv_early_filename)
    most_recent_year = int(max(early_data.Date).split('-')[0])
    if most_recent_year < last_year:
        early_data = load_early_data()
else:
    early_data = load_early_data()

today_str = today.strftime('%d/%m/%Y')
jan1_this_year = f'01/01/{today.year}'

# Get data for this year
data = investpy.get_crypto_historical_data(
    crypto='bitcoin',
    from_date=jan1_this_year,
    to_date=today_str)
data = data.drop(columns=unused_columns)
data = data.reset_index(level=0)
data.Date = data.Date.dt.strftime('%Y-%m-%d')

data = pd.concat([early_data, data], ignore_index=True)

with open('data/btcusd_annotated.csv', 'w') as f1:
    annotated = csv.writer(f1)

    annotated.writerow(['Date', 'Close', 'News', 'url'])

    news = {}
    urls = {}

    def populate_news_and_urls(fname):
        with open(fname, 'r') as f3:
            csv_news = csv.reader(f3)
            for row in csv_news:
                date = row[0]
                urls[date] = row[1]
                news[date] = row[2]
    populate_news_and_urls('data/news.csv')

    for index, row in data.iterrows():
        date = row.Date
        annotated_row = [date, row.Close, news.get(date, ""), urls.get(date, "")]
        annotated.writerow(annotated_row)
