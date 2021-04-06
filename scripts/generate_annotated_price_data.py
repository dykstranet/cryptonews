import csv
import datetime

import investpy

today = datetime.datetime.today()
today_str = today.strftime('%d/%m/%Y')
a_year_ago = today - datetime.timedelta(days=365)
a_year_ago_str = a_year_ago.strftime('%d/%m/%Y')

data = investpy.get_crypto_historical_data(
    crypto='bitcoin',
    from_date=a_year_ago_str,
    to_date=today_str)

data.to_csv('data/1year_btcusd.csv')

with open('data/1year_btcusd_annotated.csv', 'w') as f1:
    annotated = csv.writer(f1)
    f2 = open('data/1year_btcusd.csv', 'r')
    btcusd = csv.reader(f2)

    head = next(btcusd)
    annotated.writerow(head + ['News'])

    news = {}

    def populate_news(fname):
        with open(fname, 'r') as f3:
            csv_news = csv.reader(f3)
            for row in csv_news:
                news[row[0]] = row[2]
    populate_news('data/2020_news.csv')
    populate_news('data/2021_news.csv')

    for row in btcusd:
        annotated_row = row + [news.get(row[0], "")]
        annotated.writerow(annotated_row)
    f2.close()
