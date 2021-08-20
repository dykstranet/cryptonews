const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const qvalue = urlParams.get('q')
const siteValue = urlParams.get('site')

function filter(content, keyword) {
  if (!!keyword) {
    const kwList = keyword.split(' ')
    const contentLower = content.toLowerCase()
    if (content !== '' && kwList.some(k => contentLower.includes(k))) {
      return content
    } else {
      return ''
    }
  }
  return content
}

// Mapping to rescale maximum of yaxis by year
const ATHs = {
  '2010': 0.4 * 1.05,
  '2011': 29.6 * 1.05,
  '2012': 29.6 * 1.05,
  '2013': 1237.6 * 1.05,
  '2014': 1237.6 * 1.05,
  '2015': 1237.6 * 1.05,
  '2016': 1237.6 * 1.05,
  '2017': 19345.5 * 1.05,
  '2018': 19345.5 * 1.05,
  '2019': 19345.5 * 1.05,
  '2020': 28949.4 * 1.05,
  '2021': 70000,
}

// TODO UGH can't select a default button yet
// https://github.com/plotly/plotly.js/issues/4709
const selectorOptions = {
    buttons: [{
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m',
        active: true
    }, {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y'
    }, {
        step: 'all',
    }],
}

let layout = {
  title: 'Annotated BTC price plot',
  xaxis: {
    rangeselector: selectorOptions,
    rangeslider: {}
  },
  yaxis: {
    fixedrange: false,
  },
  hovermode: 'x',
  height: 600,
  hoverlabel: {font: {size: 16}},
}

let clickableUrls = []

function processData(allRows) {
  const x = [], y = [], texts = []
  const verticalLines = []
  for (var i=0; i < allRows.length; i++) {
    row = allRows[i]
    x.push(row.Date)
    y.push(row.Close)
    clickableUrls.push(row.url)

    let news = row.News
    news = filter(news, qvalue)

    if (!!siteValue) {
      if (row.url !== '' && row.url.toLowerCase().includes(siteValue)) {
      } else {
        news = ''
      }
    }

    texts.push(news)
    if (!!news) {
      verticalLines.push({
        type: 'line',
        x0: row.Date,
        y0: 0,
        y1: row.Close,
        x1: row.Date,
        line: {
          color: 'rgb(105, 105, 105)',
          dash: 'dot',
          width: 1,
        }
      })
    }
  }

  // Put in the vertical lines into layout
  layout.shapes = verticalLines

  // Manually set the range to be the last 6 months.
  // See the GH issue just before the selectorOptions
  // declaration.
  const lastDate = x[x.length - 1]
  const sixMonthAgo = new Date(lastDate)
  sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
  layout.xaxis.range = [sixMonthAgo, lastDate]

  let trace = {
    x: x,
    y: y,
    text: texts,
    mode: 'lines',
    fill: 'tozeroy',
    line: {shape: 'spline'},
    //name: 'BTC'
  }
  let data = [ trace ]
  Plotly.newPlot('crypto-news-plot', data, layout, {displayModeBar: true})

  // Register click events and open the news article in a new tab.
  const cryptoNewsPlot = document.getElementById('crypto-news-plot')
  cryptoNewsPlot.on('plotly_click', function(data) {
    if (!!data.points) {
      const url = clickableUrls[data.points[0].pointIndex]
      if (!!url) {
        window.open(url)
      }
    }
  })

  // There is no an easy way to auto-rescale the y axis upon x axis sliding:
  // https://github.com/plotly/plotly.js/issues/1876
  // So this event handler is a hack as first described in
  // https://community.plotly.com/t/y-axis-autoscaling-with-x-range-sliders/10245/7
  cryptoNewsPlot.on('plotly_relayout', function(update) {
    if (!update['xaxis.range']) {
      return
    }
    const rightSide = update['xaxis.range'][1]
    const rightYear = rightSide.split('-')[0]
    Plotly.relayout(cryptoNewsPlot, 'yaxis.range', [0, ATHs[rightYear]])
  })
}

d3.csv('data/btcusd_annotated.csv', function(data) {
  processData(data)
})
