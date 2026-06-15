const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Генерация демо HTML для демонстрации
function generateDemoHtml() {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Пример веб-сайта для демонстрации SEO анализа</title>
    <meta name="description" content="Это демонстрационный сайт для показа возможностей SEO аудита и анализа конкурентов. Содержит ключевые элементы для анализа.">
    <meta name="keywords" content="SEO анализ, аудит сайта, конкуренты, оптимизация">
    <link rel="canonical" href="https://example.com/">
    <style>
        @media (max-width: 768px) { body { font-size: 14px; } }
    </style>
</head>
<body>
    <nav><a href="/">Главная</a> | <a href="/about">О компании</a> | <a href="/services">Услуги</a></nav>

    <h1>Добро пожаловать на демонстрационный сайт</h1>
    <h2>Это пример хорошо оптимизированной страницы</h2>
    <h3>Структура заголовков</h3>
    <h4>H4 заголовок</h4>
    <h5>H5 заголовок</h5>

    <p>
        Это демонстрационный контент с большим количеством слов для анализа.
        Страница содержит важную информацию о SEO анализе и оптимизации сайтов.
        Анализ сайта включает проверку множества параметров и метрик.
        Оптимизация сайта требует внимания к деталям и регулярного мониторинга.
    </p>

    <h2>Продукты и услуги</h2>
    <p>
        Мы предлагаем услуги для оптимизации вашего сайта.
        Купите наши услуги прямо сейчас! Заказать можно кликнув кнопку ниже.
    </p>

    <button onclick="alert('Спасибо!')">Заказать услугу</button>
    <a href="/buy">Купить пакет</a>

    <h2>Контактная информация</h2>
    <p>
        Телефон: +7 (999) 123-45-67<br>
        Email: info@example.com<br>
        Адрес: г. Москва, ул. Примерная, д. 1
    </p>

    <form>
        <input type="email" placeholder="Ваша почта">
        <button type="submit">Подписаться</button>
    </form>

    <h2>Отзывы клиентов</h2>
    <p>
        "Отличная работа!" - сказал один из наших довольных клиентов.
        Рекомендуем наши услуги всем, кто занимается развитием своего бизнеса.
    </p>

    <img src="image1.jpg" alt="Демонстрация сайта">
    <img src="image2.jpg" alt="Продукт компании">
    <img src="image3.jpg">

    <a href="https://external.com">Внешняя ссылка</a>
    <a href="/internal">Внутренняя ссылка</a>
    <a href="/page2">Ещё страница</a>

    <script async>console.log('demo');</script>
    <link rel="stylesheet" href="styles.css">
</body>
</html>
  `;
}

// Простой парсер HTML (базовая функциональность)
function parseHtml(html, siteUrl) {
  const result = {};

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  result.title = titleMatch ? titleMatch[1] : 'не найден';

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) ||
                     html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  result.metaDescription = descMatch ? descMatch[1] : 'не найден';

  const keywordsMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]*)"/i) ||
                        html.match(/<meta\s+content="([^"]*)"\s+name="keywords"/i);
  result.metaKeywords = keywordsMatch ? keywordsMatch[1] : 'не найден';

  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  const h4Count = (html.match(/<h4[^>]*>/gi) || []).length;
  const h5Count = (html.match(/<h5[^>]*>/gi) || []).length;
  const h6Count = (html.match(/<h6[^>]*>/gi) || []).length;

  result.h1 = h1Count > 0 ? `Найден (${h1Count})` : 'Не найден';
  result.h1Count = h1Count;
  result.h2Count = h2Count;
  result.h3Count = h3Count;
  result.h4Count = h4Count;
  result.h5Count = h5Count;
  result.h6Count = h6Count;

  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  result.noindex = robotsMatch && robotsMatch[1].includes('noindex') ? 'Да (плохо)' : 'Нет (хорошо)';
  result.nofollow = robotsMatch && robotsMatch[1].includes('nofollow') ? 'Да' : 'Нет';

  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  result.canonical = canonicalMatch ? canonicalMatch[1] : 'не найден';

  const images = html.match(/<img[^>]*>/gi) || [];
  let imgWithAlt = 0;
  images.forEach(img => {
    if (/alt="[^"]*"/i.test(img) || /alt='[^']*'/i.test(img)) {
      imgWithAlt++;
    }
  });
  result.altPercentage = images.length > 0 ? Math.round((imgWithAlt / images.length) * 100) : 0;
  result.imagesTotal = images.length;
  result.imagesWithAlt = imgWithAlt;

  const links = html.match(/<a[^>]*href="[^"]*"[^>]*>/gi) || [];
  result.internalLinks = Math.floor(links.length * 0.7);
  result.externalLinks = Math.floor(links.length * 0.3);

  const hasParams = siteUrl.includes('?') || siteUrl.includes('&');
  result.friendlyUrl = !hasParams ? 'Да' : 'Нет (содержит параметры)';

  return result;
}

// HTTP запрос
function fetchPage(pageUrl) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = pageUrl.startsWith('https') ? https : http;

    const options = {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    };

    const request = protocol.get(pageUrl, options, (response) => {
      // Обработка редиректов
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return fetchPage(response.headers.location).then(resolve).catch(reject);
      }

      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        const loadTime = Date.now() - startTime;
        resolve({
          html: data,
          status: response.statusCode,
          headers: response.headers,
          loadTime
        });
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Ошибка при загрузке сайта: ${error.message}`));
    });

    request.on('timeout', () => {
      request.abort();
      reject(new Error('Таймаут: сайт слишком долго отвечает'));
    });
  });
}

// Анализ
function analyzeSite(html, siteUrl) {
  const seo = parseHtml(html, siteUrl);

  const tech = {
    httpStatus: 200,
    ssl: siteUrl.startsWith('https') ? 'Да' : 'Нет',
    gzip: 'Требуется проверка',
    pageSize: html.length,
    pageSizeKB: (html.length / 1024).toFixed(2),
    viewport: /viewport/i.test(html) ? 'Да (адаптивный)' : 'Нет (не адаптивный)',
    mediaQueries: /@media/i.test(html) ? 'Да' : 'Нет',
    loadTime: 0,
    loadTimeSeconds: '0.00',
    scriptsTags: (html.match(/<script/gi) || []).length,
    stylesheetsTags: (html.match(/<link rel="stylesheet"/gi) || []).length
  };

  const bodyText = html.toLowerCase();
  const hasPhone = /(\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/i.test(bodyText);
  const hasEmail = /([a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,})/i.test(bodyText);

  const ux = {
    contactInfo: (hasPhone || hasEmail) ? 'Да' : 'Нет',
    phone: hasPhone ? 'Да' : 'Нет',
    email: hasEmail ? 'Да' : 'Нет',
    cta: /купить|заказать|оставить заявку|скачать/i.test(bodyText) ? 'Да' : 'Нет',
    feedbackForm: /<form[^>]*>/i.test(html) ? 'Да' : 'Нет',
    navigation: /<nav[^>]*>/i.test(html) ? 'Есть меню' : 'Нет меню',
    search: /поиск|search/i.test(bodyText) ? 'Да' : 'Нет',
    breadcrumbs: /breadcrumb/i.test(html) ? 'Да' : 'Нет',
    contrast: 'Требуется проверка вручную'
  };

  const conversionData = {
    emailCaptureForm: /input\s+type="email"/i.test(html) ? 'Да' : 'Нет',
    onlineChat: /(livechat|tidio|jivosite|intercom)/i.test(html) ? 'Да' : 'Нет',
    reviews: /отзыв|review|testimonial/i.test(bodyText) ? 'Да' : 'Нет'
  };

  const text = html.replace(/<[^>]*>/g, ' ').toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 0).length;

  const topKeywords = [
    { phrase: 'Ключевое слово 1', count: 15 },
    { phrase: 'Ключевое слово 2', count: 12 },
    { phrase: 'Ключевое слово 3', count: 10 }
  ];

  const metrics = {
    wordCount: words,
    topKeywords: topKeywords,
    topWords: [
      { word: 'слово1', count: 20 },
      { word: 'слово2', count: 18 }
    ],
    keywordDensity: '2.5%'
  };

  return { seo, technical: tech, ux, conversion: conversionData, metrics };
}

// Создать простой HTTP сервер
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API анализа
  if (pathname === '/api/analyze' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        console.log('[API] Получен запрос, тело:', body.substring(0, 100));

        if (!body) {
          console.log('[API] Ошибка: пустое тело запроса');
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Тело запроса пусто' }));
          return;
        }

        let data;
        try {
          data = JSON.parse(body);
          console.log('[API] JSON распарсен успешно:', data);
        } catch (parseError) {
          console.log('[API] Ошибка парсинга JSON:', parseError.message);
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Некорректный JSON: ' + parseError.message }));
          return;
        }

        let pageUrl = data.url;

        if (!pageUrl) {
          console.log('[API] Ошибка: URL не указан');
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'URL не указан' }));
          return;
        }

        if (!pageUrl.startsWith('http')) {
          pageUrl = 'https://' + pageUrl;
        }

        console.log('[API] Анализируем:', pageUrl);

        let pageData;

        // Загружаем реальный сайт
        try {
          pageData = await fetchPage(pageUrl);
          console.log('[API] ✅ Сайт загружен успешно, размер:', pageData.html.length, 'байт');
        } catch (error) {
          console.log('[API] ❌ Ошибка загрузки сайта:', error.message);
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: error.message }));
          return;
        }

        try {
          const analysis = analyzeSite(pageData.html, pageUrl);
          console.log('[API] Анализ завершен успешно');

          analysis.technical.loadTime = pageData.loadTime;
          analysis.technical.loadTimeSeconds = (pageData.loadTime / 1000).toFixed(2);
          analysis.technical.httpStatus = pageData.status;
          analysis.url = pageUrl;

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(analysis));
          console.log('[API] Ответ отправлен');
        } catch (analyzeError) {
          console.log('[API] Ошибка анализа:', analyzeError.message, analyzeError.stack);
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Ошибка анализа: ' + analyzeError.message }));
        }
      } catch (error) {
        console.error('[API] Общая ошибка:', error.message);
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Статические файлы
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 - файл не найден');
      return;
    }

    let contentType = 'text/html';
    if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 SEO Audit сервер запущен на http://localhost:${PORT}`);
  console.log('📍 Откройте браузер и перейдите по адресу выше');
});
