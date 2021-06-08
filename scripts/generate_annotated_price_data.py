import csv
import datetime

import investpy

today = datetime.datetime.today()
today_str = today.strftime('%d/%m/%Y')
n_months_ago = today - datetime.timedelta(days=182)
n_months_ago_str = n_months_ago.strftime('%d/%m/%Y')

data = investpy.get_crypto_historical_data(
    crypto='bitcoin',
    from_date=n_months_ago_str,
    to_date=today_str)

data.to_csv('data/1year_btcusd.csv')

with open('data/1year_btcusd_annotated.csv', 'w') as f1:
    annotated = csv.writer(f1)
    f2 = open('data/1year_btcusd.csv', 'r')
    btcusd = csv.reader(f2)

    head = next(btcusd)
    annotated.writerow(head + ['News', 'url'])

    news = {}
    urls = {}

    def populate_news_and_urls(fname):
        with open(fname, 'r') as f3:
            csv_news = csv.reader(f3)
            for row in csv_news:
                news[row[0]] = row[2]
                urls[row[0]] = row[1]
    populate_news_and_urls('data/news.csv')

    for row in btcusd:
        annotated_row = row + [news.get(row[0], ""), urls.get(row[0], "")]
        annotated.writerow(annotated_row)
    f2.close()
