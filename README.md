# Cryptonews
This is a project that collects significant, Bitcoin price effecting news items. 

See demonstration at https://dykstranet.github.io/cryptonews/

News item suggestions are welcome through pull requests and are based on following criteria:

- URL is from an established, reputable source (Use your discretion)
- News item is likely to have an effect on Bitcoin price
- Date represents the event occurance, not publishing date. 

Please contribute news items in file `./data/news.csv`

To update the annotated data and automatically push to origin, do
`./scripts/automate.sh`.

## Usage
- To filter news content by keyword(s), do e.g. https://dykstranet.github.io/cryptonews/?q=cbdc%20china 
- To filter new url by website, do e.g. https://dykstranet.github.io/cryptonews/?site=coindesk
- To open the URL associated with a news item, click on the vertical dashed line

## Setup
Install with `pip install -r requirements.txt`.

Then run `python -m http.server`.
