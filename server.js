const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');
const HttpProxyAgent = require('http-proxy-agent');
const HttpsProxyAgent = require('https-proxy-agent');

const app = express();
const PORT = 5000;

// Получить прокси из переменных окружения
const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.PROXY;

const httpAgent = proxyUrl ? new HttpProxyAgent(proxyUrl) : undefined;
const httpsAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

if (proxyUrl) {
  console.log('🌐 Используется прокси:', proxyUrl);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

const STOP_WORDS = new Set([
  'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'а', 'то', 'все', 'она', 'так',
  'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее', 'мне',
  'было', 'вот', 'от', 'ему', 'еще', 'нет', 'из', 'ему', 'теперь', 'даже', 'ну', 'вдруг',
  'ли', 'если', 'уже', 'или', 'ни', 'быть', 'были', 'есть', 'отчего', 'чего', 'когда',
  'для', 'до', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'is',
  'be', 'are', 'am', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom',
  'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'some',
  'such', 'no', 'nor', 'not', 'only', 'same', 'so', 'than', 'too', 'very'
]);

async function fetchPage(url) {
  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 10000,
      httpAgent,
      httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9'
      }
    });
    const loadTime = Date.now() - startTime;
    return { html: response.data, status: response.status, headers: response.headers, loadTime };
  } catch (error) {
    throw new Error(`Ошибка при загрузке сайта: ${error.message}`);
  }
}

function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

function analyzeSeo(html, url) {
  const $ = cheerio.load(html);
  const result = {};

  result.title = $('title').text() || 'не найден';
  result.metaDescription = $('meta[name="description"]').attr('content') || 'не найден';
  result.metaKeywords = $('meta[name="keywords"]').attr('content') || 'не найден';

  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const h4Count = $('h4').length;
  const h5Count = $('h5').length;
  const h6Count = $('h6').length;

  result.h1 = h1Count > 0 ? `Найден (${h1Count})` : 'Не найден';
  result.h1Count = h1Count;
  result.h2Count = h2Count;
  result.h3Count = h3Count;
  result.h4Count = h4Count;
  result.h5Count = h5Count;
  result.h6Count = h6Count;

  result.noindex = $('meta[name="robots"]').attr('content')?.includes('noindex') ||
                   $('meta[name="googlebot"]').attr('content')?.includes('noindex') ? 'Да (плохо)' : 'Нет (хорошо)';
  result.nofollow = $('meta[name="robots"]').attr('content')?.includes('nofollow') ? 'Да' : 'Нет';
  result.canonical = $('link[rel="canonical"]').attr('href') || 'не найден';

  const images = $('img');
  let imgWithAlt = 0;
  images.each((i, img) => {
    if ($(img).attr('alt')) imgWithAlt++;
  });
  result.altPercentage = images.length > 0 ? Math.round((imgWithAlt / images.length) * 100) : 0;
  result.imagesTotal = images.length;
  result.imagesWithAlt = imgWithAlt;

  const allLinks = $('a[href]');
  const internalLinks = [];
  const externalLinks = [];
  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  allLinks.each((i, link) => {
    const href = $(link).attr('href');
    if (href && href.startsWith('http')) {
      const linkDomain = new URL(href).hostname;
      if (linkDomain === domain) {
        internalLinks.push(href);
      } else {
        externalLinks.push(href);
      }
    } else if (href && (href.startsWith('/') || href.startsWith('../') || !href.startsWith('#'))) {
      internalLinks.push(href);
    }
  });

  result.internalLinks = internalLinks.length;
  result.externalLinks = externalLinks.length;

  const urlParts = url.split('/').filter(p => p && p.length > 3);
  const isFriendly = !url.includes('?') || urlParts.some(p => !/^\d+$/.test(p));
  result.friendlyUrl = isFriendly ? 'Да' : 'Нет (содержит параметры)';

  return result;
}

function analyzeTechnical(html, headers, status, loadTime, url) {
  const $ = cheerio.load(html);
  const result = {};

  result.httpStatus = status;
  result.ssl = url.startsWith('https') ? 'Да' : 'Нет';

  const gzip = headers['content-encoding']?.includes('gzip') || false;
  result.gzip = gzip ? 'Да' : 'Нет';

  result.pageSize = html.length;
  result.pageSizeKB = (html.length / 1024).toFixed(2);

  const viewport = $('meta[name="viewport"]').attr('content');
  result.viewport = viewport ? 'Да (адаптивный)' : 'Нет (не адаптивный)';

  const mediaQueries = html.includes('@media') ? 'Да' : 'Нет';
  result.mediaQueries = mediaQueries;

  result.loadTime = loadTime;
  result.loadTimeSeconds = (loadTime / 1000).toFixed(2);

  const allScripts = html.match(/<script/gi) || [];
  const allStylesheets = html.match(/<link rel="stylesheet"/gi) || [];
  result.scriptsTags = allScripts.length;
  result.stylesheetsTags = allStylesheets.length;
  result.totalRequests = allScripts.length + allStylesheets.length;

  return result;
}

function analyzeUX(html, url) {
  const $ = cheerio.load(html);
  const result = {};

  const bodyText = $('body').text().toLowerCase();

  const hasPhone = /(\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}|tel:[\d\-+]+)/i.test(bodyText);
  const hasEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.test(bodyText);

  result.contactInfo = (hasPhone || hasEmail) ? 'Да' : 'Нет';
  result.phone = hasPhone ? 'Да' : 'Нет';
  result.email = hasEmail ? 'Да' : 'Нет';

  const ctaKeywords = ['купить', 'заказать', 'оставить заявку', 'позвонить', 'скачать', 'подробнее', 'начать'];
  const hasCTA = ctaKeywords.some(word => bodyText.includes(word));
  result.cta = hasCTA ? 'Да' : 'Нет';

  const hasForm = $('form').length > 0;
  const hasInput = $('input[type="email"], input[type="text"]').length > 0;
  result.feedbackForm = (hasForm && hasInput) ? 'Да' : 'Нет';

  const hasMenu = $('nav').length > 0 || $('[role="navigation"]').length > 0;
  const hasSearch = bodyText.includes('поиск') || bodyText.includes('search') || $('input[type="search"]').length > 0;
  const hasBreadcrumbs = $('[class*="breadcrumb"], [role="navigation"] li').length > 0;

  result.navigation = hasMenu ? 'Есть меню' : 'Нет меню';
  result.search = hasSearch ? 'Да' : 'Нет';
  result.breadcrumbs = hasBreadcrumbs ? 'Да' : 'Нет';

  const inlineStyles = html.match(/style="[^"]*color:\s*([^;"]+)/gi) || [];
  let goodContrast = true;
  if (inlineStyles.length > 0) {
    goodContrast = inlineStyles.length > 3;
  }
  result.contrast = goodContrast ? 'Приемлемый' : 'Требует проверки';

  return result;
}

function analyzeConversion(html) {
  const $ = cheerio.load(html);
  const result = {};
  const bodyText = html.toLowerCase();

  const emailForms = $('input[type="email"]').length > 0;
  result.emailCaptureForm = emailForms ? 'Да' : 'Нет';

  const chatScripts = bodyText.includes('livechat') || bodyText.includes('tidio') ||
                      bodyText.includes('jivosite') || bodyText.includes('intercom');
  result.onlineChat = chatScripts ? 'Да' : 'Нет';

  const reviewKeywords = ['отзыв', 'рекомендуемый', 'кейс', 'история успеха', 'review', 'testimonial'];
  const hasReviews = reviewKeywords.some(word => bodyText.includes(word));
  result.reviews = hasReviews ? 'Да' : 'Нет';

  return result;
}

function analyzeMetrics(html, url) {
  const $ = cheerio.load(html);
  const result = {};

  const text = $('body').text();
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  result.wordCount = words.length;

  const phrases = [];
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = [words[i], words[i + 1], words[i + 2]].join(' ');
    if (!phrase.split(' ').some(w => STOP_WORDS.has(w))) {
      phrases.push(phrase);
    }
  }

  const phraseFreq = {};
  phrases.forEach(phrase => {
    phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
  });

  const topPhrases = Object.entries(phraseFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase, count]) => ({ phrase, count }));

  result.topKeywords = topPhrases.length > 0 ? topPhrases : [];

  const allWords = words.filter(w => !STOP_WORDS.has(w));
  const wordFreq = {};
  allWords.forEach(word => {
    if (word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  result.topWords = topWords;

  const mainKeyword = topPhrases.length > 0 ? topPhrases[0].phrase : (topWords.length > 0 ? topWords[0].word : '');
  const density = mainKeyword ? ((phraseFreq[mainKeyword] || 0) / phrases.length * 100).toFixed(2) : 0;
  result.keywordDensity = density + '%';

  return result;
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL не указан' });
    }

    const normalizedUrl = normalizeUrl(url);

    let pageData;
    try {
      pageData = await fetchPage(normalizedUrl);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const seoData = analyzeSeo(pageData.html, normalizedUrl);
    const technicalData = analyzeTechnical(pageData.html, pageData.headers, pageData.status, pageData.loadTime, normalizedUrl);
    const uxData = analyzeUX(pageData.html, normalizedUrl);
    const conversionData = analyzeConversion(pageData.html);
    const metricsData = analyzeMetrics(pageData.html, normalizedUrl);

    res.json({
      url: normalizedUrl,
      seo: seoData,
      technical: technicalData,
      ux: uxData,
      conversion: conversionData,
      metrics: metricsData
    });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка анализа: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SEO Audit сервер запущен на http://localhost:${PORT}`);
});
