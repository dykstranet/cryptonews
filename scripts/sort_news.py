#!/usr/bin/env python3
import csv, datetime

rows = []

with open('data/news.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        rows.append(row)

def get_row_key(row):
	return datetime.datetime.strptime(row[0],"%Y-%m-%d")

rows.sort(key=get_row_key)

with open('data/news.csv', 'w') as f:
    writer = csv.writer(f)
    for row in rows:
        writer.writerow(row)
