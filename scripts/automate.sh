#!/usr/bin/env bash

git pull
python scripts/generate_annotated_price_data.py
git add data/1year_btcusd_annotated.csv
git commit -m 'Update annotated price data'
git push
