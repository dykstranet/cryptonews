#!/usr/bin/env bash

set -e

echo "Getting latest news..."
git pull
echo "Sorting news..."
./scripts/sort_news.py
echo "Generating graph..."
./scripts/generate_annotated_price_data.py
echo "Pushing to git..."
git add data/1year_btcusd_annotated.csv
git add data/news.csv
git commit -m 'Update annotated price data'
git push
echo "Success!"
