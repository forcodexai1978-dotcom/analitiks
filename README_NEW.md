# SEO Audit Pro - Анализ сайтов и конкурентов

Бесплатный инструмент для анализа SEO, технических характеристик и конкурентного анализа веб-сайтов.

## 🚀 Возможности

- **SEO Анализ**: Проверка title, meta-tags, заголовков, alt-тегов, canonical URL
- **Технический анализ**: HTTP статус, SSL сертификат, время загрузки, размер страницы
- **UX и дизайн**: Проверка навигации, форм, контактной информации
- **Конверсия**: Анализ элементов, способствующих конверсии
- **Ключевые метрики**: Количество слов, ключевые фразы, плотность ключевых слов
- **Анализ конкурентов**: Сравнение вашего сайта с конкурентами
- **Экспорт**: Скачивание отчетов в JSON и CSV

## 📋 Требования

- Node.js v14+
- npm или yarn

## 🔧 Установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/seo-audit-pro.git
cd seo-audit-pro

# Установить зависимости
npm install

# Запустить приложение
npm start
```

Приложение будет доступно на **http://localhost:5000**

## 🌐 Использование с VPN/Прокси

### PowerShell
```powershell
$env:HTTP_PROXY="http://proxy-ip:port"
$env:HTTPS_PROXY="http://proxy-ip:port"
npm start
```

### Git Bash
```bash
export HTTP_PROXY="http://proxy-ip:port"
export HTTPS_PROXY="http://proxy-ip:port"
npm start
```

## 📁 Структура проекта

```
├── server.js              # Express сервер (основной)
├── server-standalone.js   # Standalone сервер (без npm)
├── client.js              # Клиентский JavaScript
├── index.html             # Основной HTML
├── style.css              # Стили
├── package.json           # Зависимости
└── README.md              # Этот файл
```

## 🛠️ Разработка

```bash
# Разработка
npm run dev

# Запуск
npm start
```

## 📊 API Endpoints

### POST /api/analyze
Анализирует указанный сайт.

**Запрос:**
```json
{
  "url": "https://example.com"
}
```

**Ответ:**
```json
{
  "url": "https://example.com",
  "seo": {...},
  "technical": {...},
  "ux": {...},
  "conversion": {...},
  "metrics": {...}
}
```

## 🔒 Безопасность

- Используется express.json() для безопасной обработки JSON
- CORS включены
- User-Agent установлен для корректной загрузки сайтов
- Таймауты установлены на 10 секунд

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Разработано как инструмент для SEO анализа.

## 🤝 Вклад

Pull requests приветствуются. Для больших изменений сначала откройте Issue.

## 📞 Поддержка

Если у вас есть вопросы или проблемы, откройте Issue в репозитории.
