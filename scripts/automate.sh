#!/usr/bin/env bash

python scripts/generate_annotated_price_data.py
git add data/1year_btcusd_annotated.csv
git commit -m 'Update annotated data'
git push
