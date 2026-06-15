let currentAnalysis = null;
let competitors = [];

function showStatus(message, type = 'info') {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} mt-3`;
  errorDiv.classList.remove('d-none');
}

function hideStatus() {
  document.getElementById('errorMessage').classList.add('d-none');
}

function showLoading(show = true) {
  const bar = document.getElementById('loadingBar');
  const btn = document.getElementById('analyzeBtn');
  const spinner = document.getElementById('btnSpinner');

  if (show) {
    bar.classList.remove('d-none');
    btn.disabled = true;
    spinner.classList.remove('d-none');
  } else {
    bar.classList.add('d-none');
    btn.disabled = false;
    spinner.classList.add('d-none');
  }
}

function getBadgeClass(value) {
  if (typeof value === 'string') {
    if (value.includes('Да') || value.includes('хорошо') || value.includes('Найден')) {
      return 'bg-success';
    }
    if (value.includes('Нет') || value.includes('плохо') || value.includes('не')) {
      return 'bg-danger';
    }
  }
  if (typeof value === 'number') {
    if (value >= 75) return 'bg-success';
    if (value >= 50) return 'bg-warning text-dark';
    return 'bg-danger';
  }
  return 'bg-secondary';
}

function renderSeoReport(seo) {
  const headingStr = `H1: ${seo.h1Count}, H2: ${seo.h2Count}, H3: ${seo.h3Count}, H4: ${seo.h4Count}, H5: ${seo.h5Count}, H6: ${seo.h6Count}`;

  document.getElementById('seoTitle').textContent = seo.title;
  document.getElementById('seoDescription').textContent = seo.metaDescription;
  document.getElementById('seoKeywords').textContent = seo.metaKeywords;
  document.getElementById('seoH1').innerHTML = `<span class="badge ${getBadgeClass(seo.h1)}">${seo.h1}</span>`;
  document.getElementById('seoHeadings').innerHTML = `<span class="badge bg-secondary">${headingStr}</span>`;
  document.getElementById('seoNoindex').textContent = seo.noindex;
  document.getElementById('seoNoindex').className = `badge ${getBadgeClass(seo.noindex)}`;
  document.getElementById('seoRobots').textContent = 'Требуется проверка вручную';
  document.getElementById('seoCanonical').textContent = seo.canonical;
  document.getElementById('seoFriendly').textContent = seo.friendlyUrl;
  document.getElementById('seoFriendly').className = `badge ${getBadgeClass(seo.friendlyUrl)}`;

  const altPercentage = seo.altPercentage;
  document.getElementById('seoAlt').innerHTML = `<span class="badge bg-secondary">${seo.imagesWithAlt}/${seo.imagesTotal} (${altPercentage}%)</span>`;
  document.getElementById('seoAltBar').style.width = altPercentage + '%';
  document.getElementById('seoAltBar').className = `progress-bar ${altPercentage >= 75 ? 'bg-success' : altPercentage >= 50 ? 'bg-warning' : 'bg-danger'}`;

  document.getElementById('seoInternalLinks').textContent = seo.internalLinks;
  document.getElementById('seoExternalLinks').textContent = seo.externalLinks;
}

function renderTechnicalReport(tech) {
  const statusBadge = tech.httpStatus === 200 ? 'bg-success' : 'bg-warning';
  document.getElementById('techStatus').innerHTML = `<span class="badge ${statusBadge}">${tech.httpStatus}</span>`;

  document.getElementById('techSSL').innerHTML = `<span class="badge ${getBadgeClass(tech.ssl)}">${tech.ssl}</span>`;
  document.getElementById('techLoadTime').innerHTML = `<span class="badge bg-warning">${tech.loadTimeSeconds} сек</span> <small class="text-muted">(время ответа прокси)</small>`;
  document.getElementById('techPageSize').textContent = `${tech.pageSizeKB} KB`;
  document.getElementById('techGzip').innerHTML = `<span class="badge ${getBadgeClass(tech.gzip)}">${tech.gzip}</span>`;
  document.getElementById('techViewport').innerHTML = `<span class="badge ${getBadgeClass(tech.viewport)}">${tech.viewport}</span>`;
  document.getElementById('techMediaQueries').textContent = tech.mediaQueries;
  document.getElementById('techScripts').textContent = tech.scriptsTags;
  document.getElementById('techStyles').textContent = tech.stylesheetsTags;
  document.getElementById('techRequests').textContent = tech.totalRequests;
}

function renderUXReport(ux) {
  document.getElementById('uxContacts').innerHTML = `<span class="badge ${getBadgeClass(ux.contactInfo)}">${ux.contactInfo}</span>`;
  document.getElementById('uxPhone').textContent = ux.phone;
  document.getElementById('uxEmail').textContent = ux.email;
  document.getElementById('uxCTA').innerHTML = `<span class="badge ${getBadgeClass(ux.cta)}">${ux.cta}</span>`;
  document.getElementById('uxForm').innerHTML = `<span class="badge ${getBadgeClass(ux.feedbackForm)}">${ux.feedbackForm}</span>`;
  document.getElementById('uxNav').textContent = ux.navigation;
  document.getElementById('uxSearch').textContent = ux.search;
  document.getElementById('uxBreadcrumbs').textContent = ux.breadcrumbs;
  document.getElementById('uxContrast').textContent = ux.contrast;
}

function renderConversionReport(conv) {
  document.getElementById('convEmail').innerHTML = `<span class="badge ${getBadgeClass(conv.emailCaptureForm)}">${conv.emailCaptureForm}</span>`;
  document.getElementById('convChat').innerHTML = `<span class="badge ${getBadgeClass(conv.onlineChat)}">${conv.onlineChat}</span>`;
  document.getElementById('convReviews').innerHTML = `<span class="badge ${getBadgeClass(conv.reviews)}">${conv.reviews}</span>`;
}

function renderMetricsReport(metrics) {
  document.getElementById('metricsWordCount').textContent = metrics.wordCount + ' слов';

  const topKeywords = metrics.topKeywords;
  const keywordsHtml = topKeywords.map((kw, i) => {
    return `<span class="badge bg-secondary me-2 mb-2">${i + 1}. "${kw.phrase}" (${kw.count})</span>`;
  }).join('');
  document.getElementById('metricsTopKeywords').innerHTML = keywordsHtml || '<span class="text-muted">Недостаточно данных</span>';

  const topWords = metrics.topWords;
  const wordsHtml = topWords.map((w, i) => {
    return `<span class="badge bg-info me-2 mb-2">${i + 1}. "${w.word}" (${w.count})</span>`;
  }).join('');
  document.getElementById('metricsTopWords').innerHTML = wordsHtml || '<span class="text-muted">Недостаточно данных</span>';

  document.getElementById('metricsKeywordDensity').textContent = metrics.keywordDensity;
}

function showReportSection() {
  document.getElementById('mainForm').classList.add('d-none');
  document.getElementById('reportSection').classList.remove('d-none');
  document.getElementById('exportSection').classList.remove('d-none');
  document.getElementById('competitorsForm').classList.remove('d-none');
}

function renderCompetitorsInputs(keywords) {
  const container = document.getElementById('competitorsInputs');
  container.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    const div = document.createElement('div');
    div.className = 'input-group mb-3';
    div.innerHTML = `
      <span class="input-group-text">Конкурент ${i + 1}</span>
      <input type="url" class="form-control competitor-url" placeholder="https://example.com"
             data-index="${i}">
      <button class="btn btn-outline-danger" type="button" onclick="removeCompetitor(${i})">Удалить</button>
    `;
    container.appendChild(div);
  }
}

function renderKeywordsList(keywords) {
  const container = document.getElementById('keywordsList');
  const keywordsHtml = keywords.map((kw, i) => {
    return `<span class="badge bg-primary me-2 mb-2">${i + 1}. ${kw.phrase}</span>`;
  }).join('');
  container.innerHTML = keywordsHtml || '<span class="text-muted">Ключевые слова не найдены</span>';
}

async function analyzeUrl(url) {
  showLoading(true);
  hideStatus();

  try {
    console.log('Отправка запроса на анализ:', url);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    console.log('Статус ответа:', response.status);

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error || `Ошибка сервера: ${response.status}`);
      } catch (e) {
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();

    if (!data.seo || !data.technical) {
      throw new Error('Некорректный ответ от сервера');
    }

    currentAnalysis = data;

    document.getElementById('reportUrl').textContent = data.url;

    renderSeoReport(data.seo);
    renderTechnicalReport(data.technical);
    renderUXReport(data.ux);
    renderConversionReport(data.conversion);
    renderMetricsReport(data.metrics);

    const keywords = data.metrics.topKeywords || [];
    renderKeywordsList(keywords);
    renderCompetitorsInputs(keywords);

    showReportSection();
    showStatus('✅ Анализ завершен успешно!', 'success');

    saveToLocalStorage('lastAnalysis', currentAnalysis);

  } catch (error) {
    console.error('Ошибка:', error);
    showStatus('❌ ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

function removeCompetitor(index) {
  const inputs = document.querySelectorAll('.competitor-url');
  if (inputs[index]) {
    inputs[index].value = '';
  }
}

async function analyzeCompetitors() {
  const inputs = document.querySelectorAll('.competitor-url');
  const urls = [];

  inputs.forEach(input => {
    if (input.value.trim()) {
      urls.push(input.value.trim());
    }
  });

  if (urls.length === 0) {
    showStatus('⚠️ Пожалуйста, добавьте хотя бы одного конкурента', 'warning');
    return;
  }

  const btn = document.getElementById('analyzeCompetitorsBtn');
  const spinner = document.getElementById('compBtnSpinner');
  btn.disabled = true;
  spinner.classList.remove('d-none');

  try {
    competitors = [];

    for (let url of urls) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!response.ok) {
          console.error(`Ошибка анализа ${url}`);
          continue;
        }

        const data = await response.json();
        competitors.push(data);
      } catch (error) {
        console.error(`Не удалось проанализировать ${url}: ${error.message}`);
      }
    }

    if (competitors.length === 0) {
      showStatus('❌ Не удалось проанализировать ни одного конкурента', 'error');
      return;
    }

    renderComparisonTable();
    document.getElementById('comparisonSection').classList.remove('d-none');
    showStatus('✅ Конкуренты проанализированы!', 'success');

    saveToLocalStorage('competitors', competitors);

  } finally {
    btn.disabled = false;
    spinner.classList.add('d-none');
  }
}

function renderComparisonTable() {
  const table = document.getElementById('comparisonTable');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  thead.innerHTML = `
    <tr>
      <th>Параметр</th>
      <th>Мой сайт</th>
      ${competitors.map((_, i) => `<th>Конкурент ${i + 1}</th>`).join('')}
    </tr>
  `;

  const params = [
    { name: 'Title', key: 'seo', field: 'title' },
    { name: 'H1', key: 'seo', field: 'h1' },
    { name: 'Адаптивный дизайн', key: 'technical', field: 'viewport' },
    { name: 'SSL', key: 'technical', field: 'ssl' },
    { name: 'Скорость (сек)', key: 'technical', field: 'loadTimeSeconds' },
    { name: 'Alt-теги (%)', key: 'seo', field: 'altPercentage' },
    { name: 'Есть CTA', key: 'ux', field: 'cta' },
    { name: 'Контакты', key: 'ux', field: 'contactInfo' },
    { name: 'Слов на странице', key: 'metrics', field: 'wordCount' }
  ];

  tbody.innerHTML = '';

  params.forEach(param => {
    const row = document.createElement('tr');
    let myValue = getValue(currentAnalysis, param.key, param.field);

    row.innerHTML = `<td><strong>${param.name}</strong></td><td>${truncate(myValue, 50)}</td>`;

    competitors.forEach(comp => {
      const compValue = getValue(comp, param.key, param.field);
      row.innerHTML += `<td>${truncate(compValue, 50)}</td>`;
    });

    tbody.appendChild(row);
  });

  renderConclusions();
}

function getValue(data, key, field) {
  const value = data[key]?.[field];
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value || '—';
}

function truncate(str, length) {
  const s = String(str);
  return s.length > length ? s.substring(0, length) + '...' : s;
}

function renderConclusions() {
  const conclusionsDiv = document.getElementById('conclusions');
  let html = '<ul>';

  const competitors2 = competitors.slice(0, 2);
  const myAlt = currentAnalysis.seo.altPercentage;
  const compAlt = competitors2.map(c => c.seo.altPercentage);

  if (compAlt.length > 0 && Math.max(...compAlt) > myAlt) {
    html += '<li>🖼️ <strong>Alt-теги:</strong> У конкурентов лучше заполнены alt-теги. Рекомендуем заполнить все изображения.</li>';
  }

  if (competitors2.some(c => c.technical?.viewport && !currentAnalysis.technical?.viewport)) {
    html += '<li>📱 <strong>Адаптивность:</strong> Все конкуренты имеют адаптивный дизайн. Срочно добавьте viewport meta-тег!</li>';
  }

  if (competitors2.some(c => c.ux?.onlineChat === 'Да' && currentAnalysis.ux?.onlineChat === 'Нет')) {
    html += '<li>💬 <strong>Online чат:</strong> У конкурентов есть чат для общения с клиентами. Рассмотрите добавление.</li>';
  }

  if (competitors2.some(c => c.ux?.feedbackForm === 'Да' && currentAnalysis.ux?.feedbackForm === 'Нет')) {
    html += '<li>📝 <strong>Форма обратной связи:</strong> Все конкуренты имеют форму. Добавьте на вашу страницу.</li>';
  }

  if (currentAnalysis.ux?.contactInfo === 'Да' && competitors2.some(c => c.ux?.contactInfo === 'Нет')) {
    html += '<li>✅ <strong>Контакты:</strong> У вас отличная информация о контактах! Ваше преимущество.</li>';
  }

  const myWords = currentAnalysis.metrics.wordCount;
  const compWords = competitors2.map(c => c.metrics.wordCount);

  if (compWords.length > 0) {
    const avgWords = Math.round(compWords.reduce((a, b) => a + b, 0) / compWords.length);
    if (myWords < avgWords * 0.7) {
      html += `<li>📄 <strong>Объём контента:</strong> У вас ${myWords} слов, у конкурентов в среднем ${avgWords}. Добавьте больше качественного контента.</li>`;
    }
  }

  html += '</ul>';
  conclusionsDiv.innerHTML = html;
}

function exportToJSON() {
  const data = {
    myAnalysis: currentAnalysis,
    competitors: competitors,
    exportedAt: new Date().toISOString()
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, 'seo-audit-report.json', 'application/json');
}

function exportToCSV() {
  const headers = ['Параметр', 'Мой сайт', ...competitors.map((_, i) => `Конкурент ${i + 1}`)];
  const rows = [headers];

  const params = [
    { name: 'URL', key: 'url' },
    { name: 'Title', key: 'seo', field: 'title' },
    { name: 'H1', key: 'seo', field: 'h1' },
    { name: 'HTTP Status', key: 'technical', field: 'httpStatus' },
    { name: 'SSL', key: 'technical', field: 'ssl' },
    { name: 'Load Time', key: 'technical', field: 'loadTimeSeconds' },
    { name: 'Page Size (KB)', key: 'technical', field: 'pageSizeKB' },
    { name: 'Adaptive', key: 'technical', field: 'viewport' },
    { name: 'Word Count', key: 'metrics', field: 'wordCount' },
    { name: 'Alt Tags %', key: 'seo', field: 'altPercentage' }
  ];

  params.forEach(param => {
    const row = [param.name];

    if (param.key === 'url') {
      row.push(currentAnalysis.url);
      competitors.forEach(c => row.push(c.url));
    } else {
      row.push(getValue(currentAnalysis, param.key, param.field));
      competitors.forEach(c => row.push(getValue(c, param.key, param.field)));
    }

    rows.push(row);
  });

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadFile(csv, 'seo-audit-report.csv', 'text/csv');
}

function downloadFile(content, filename, type) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:' + type + ';charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log('LocalStorage error:', error);
  }
}

function copyResultLink() {
  const link = window.location.href;
  navigator.clipboard.writeText(link).then(() => {
    showStatus('✅ Ссылка скопирована в буфер обмена!', 'success');
  }).catch(() => {
    showStatus('❌ Не удалось скопировать ссылку', 'error');
  });
}

document.getElementById('analyzeBtn').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) {
    showStatus('⚠️ Пожалуйста, введите URL сайта', 'warning');
    return;
  }
  analyzeUrl(url);
});

document.getElementById('addCompetitorsBtn').addEventListener('click', () => {
  document.getElementById('reportSection').classList.add('d-none');
  document.getElementById('competitorsForm').classList.remove('d-none');
});

document.getElementById('analyzeCompetitorsBtn').addEventListener('click', analyzeCompetitors);

document.getElementById('skipCompetitorsBtn').addEventListener('click', () => {
  showStatus('✅ Анализ завершен. Вы можете экспортировать отчет.', 'success');
});

document.getElementById('exportJsonBtn').addEventListener('click', exportToJSON);
document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
document.getElementById('copyLinkBtn').addEventListener('click', copyResultLink);

document.getElementById('urlInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('analyzeBtn').click();
  }
});
