const hashString = window.location.hash
const urlParams = new URLSearchParams(hashString.replace('#', '?'))
const qvalue = urlParams.get('q')
const siteValue = urlParams.get('site')

function filterNews(content, keyword) {
  // Filter news content based on keyword
  if (!!keyword) {
    const kwList = keyword.toLowerCase().split(' ')
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
  '2021': 69000 * 1.05,
  '2022': 69000 * 1.05,
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

const allUnfilteredNews = []

function getYear(dateStr) {
  return dateStr.split('-')[0]
}

function stripYear(dateStr) {
  // The substring is used to remove the year from the date.
  // We know that the year is always 4-chars length
  return dateStr.substring(5)
}

function pushToNewsDict(newsDict, date, news, url) {
  const year = getYear(date)
  newsDict[year].push({
    content: stripYear(date) + ': ' + news,
    url: url
  })
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

function makeClickableText(url, content) {
  const contentLink = document.createElement('a')
  contentLink.href = url
  contentLink.target ='_blank'
  contentLink.innerHTML = content + ' '
  contentLink.style = 'color: black; text-decoration: none'
  return contentLink
}

function makeExternalLink(url) {
  // Used in crypto news list
  const link = document.createElement('a')
  link.href = url
  link.target ='_blank'
  link.innerHTML = '<i class="fa fa-external-link"></i>'
  return link
}

function renderNewsList(data) {
  const cryptoNewsList = document.getElementById('crypto-news-list')
  removeAllChildNodes(cryptoNewsList)

  for (const [year, entries] of Object.entries(data)) {
    if (entries.length === 0) continue
    const yearItem = document.createElement('li')
    const ul = document.createElement('ul')
    for (const entry of entries) {
      const dayItem = document.createElement('li')
      contentLink = makeClickableText(entry.url, entry.content)
      dayItem.appendChild(contentLink)
      // The external link is an icon that can be clicked to go to the news
      // url.
      const link = makeExternalLink(entry.url)
      dayItem.appendChild(link)
      ul.appendChild(dayItem)
    }
    yearItem.innerHTML = year
    yearItem.appendChild(ul)
    cryptoNewsList.appendChild(yearItem)
  }
}

function updateNewsNumber(searchText, newsItems) {
  // Display the number of news
  const n = newsItems.length
  const fromTo = n === 0 ? '' : ` from ${newsItems[0].x0} to ${newsItems[n - 1].x0}`
  const extraText = !!searchText ? ` for '${searchText}'${fromTo}` : ''
  document.getElementById('news-number').innerHTML = `${n} news items displayed${extraText}.`
}

function handleSearch() {
  const form = document.getElementById('cryptonews-form-search')
  const cryptoNewsPlot = document.getElementById('crypto-news-plot')
  form.addEventListener('submit', event => {
    event.preventDefault()
    if (allUnfilteredNews.length === 0) return
    const searchText = form.elements['cryptonews-form-search-content'].value
    window.location.hash = `q=${searchText}`
    const filteredNewsDict = {}
    for (let year in ATHs) {
      filteredNewsDict[year] = []
    }
    const update = {
      shapes: allUnfilteredNews.filter(e => {
        const isIncluded = filterNews(e.news, searchText) !== ''
        if (isIncluded) {
          pushToNewsDict(filteredNewsDict, e.x0, e.news, e.url)
        }
        return isIncluded
      })
    }
    updateNewsNumber(searchText, update.shapes)
    // Update vertical lines
    Plotly.relayout(cryptoNewsPlot, update)
    // Update hover texts
    const texts = Array(totalDays).fill('')
    for (let i = 0; i < update.shapes.length; i++) {
      const el = update.shapes[i]
      texts[el.idx] = el.news
    }
    Plotly.restyle(cryptoNewsPlot, {text: [texts]})
    // Update news list
    renderNewsList(filteredNewsDict)
  })
}

function processData(allRows) {
  // For crypto-news-plot
  const x = [], y = [], texts = []
  const verticalLines = []

  // For crypto-news-list
  const newsDict = {}
  // We obtain the years from the all time high hash table.
  for (let year in ATHs) {
    newsDict[year] = []
  }

  for (let i = 0; i < allRows.length; i++) {
    row = allRows[i]
    x.push(row.Date)
    y.push(row.Close)
    clickableUrls.push(row.url)

    let news = row.News
    const unfilteredNews = news
    news = filterNews(news, qvalue)

    if (!!siteValue) {
      if (row.url !== '' && row.url.toLowerCase().includes(siteValue)) {
      } else {
        news = ''
      }
    }

    texts.push(news)
    if (!!unfilteredNews) {
      const verticalLine = {
        type: 'line',
        x0: row.Date,
        y0: 0,
        y1: row.Close,
        x1: row.Date,
        line: {
          color: 'black',
          dash: 'dot',
          width: 1,
        },
        news: unfilteredNews,
        idx: i,
        url: row.url
      }
      allUnfilteredNews.push(verticalLine)
      if (!!news) {
        verticalLines.push(verticalLine)
        pushToNewsDict(newsDict, row.Date, news, row.url)
      }
    }
  }

  // Put in the vertical lines into layout
  layout.shapes = verticalLines

  // Display the number of news
  updateNewsNumber(qvalue, verticalLines)

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
    const rightYear = getYear(rightSide)
    Plotly.relayout(cryptoNewsPlot, 'yaxis.range', [0, ATHs[rightYear]])
  })

  renderNewsList(newsDict)
}

// Main steps
let totalDays = 0
d3.csv('data/btcusd_annotated.csv', function(data) {
  totalDays = data.length
  processData(data)
})
handleSearch()
