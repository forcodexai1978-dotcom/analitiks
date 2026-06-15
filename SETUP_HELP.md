# ИНСТРУКЦИЯ: Решение проблемы с npm install

## 🚨 Проблема
Ошибка при установке зависимостей npm:
```
npm error network request to https://registry.npmjs.org failed
npm error network getaddrinfo ENOTFOUND
```

## ✅ Решение

### Способ 1: Проверить и обновить npm конфиг

```bash
# Сбросить npm конфиг
npm config set registry https://registry.npmjs.org/

# Очистить npm кэш
npm cache clean --force

# Попробовать снова
cd "e:\Aiprojects\CRM 2026"
npm install
```

### Способ 2: Если вы за корпоративным прокси

```bash
# Установить прокси (замените на ваши данные)
npm config set proxy http://proxy.yourcompany.com:8080
npm config set https-proxy http://proxy.yourcompany.com:8080

# Отключить проверку SSL (только для тестирования!)
npm config set strict-ssl false

# Установить зависимости
npm install
```

### Способ 3: Использовать yarn вместо npm (если установлен)

```bash
cd "e:\Aiprojects\CRM 2026"
yarn install
```

### Способ 4: Установить пакеты вручную

Если все остальное не работает, скачайте пакеты с GitHub:

```bash
cd "e:\Aiprojects\CRM 2026"

# Скачать архивы с GitHub
# express: https://github.com/expressjs/express
# axios: https://github.com/axios/axios
# cheerio: https://github.com/cheeriojs/cheerio
# cors: https://github.com/expressjs/cors

# Распаковать в node_modules/ и запустить
```

## 📋 Проверка после установки

После успешной установки зависимостей проверьте наличие папки:
```bash
ls "e:\Aiprojects\CRM 2026\node_modules"
```

Должны быть папки: express, axios, cheerio, cors

## 🚀 После решения проблемы

Когда npm install завершится успешно, запустите:

```bash
cd "e:\Aiprojects\CRM 2026"
npm start
```

Приложение будет доступно по адресу: **http://localhost:5000**

---

## 📝 Статус проекта

✅ **Все файлы приложения созданы:**
- server.js — бэкенд Express
- index.html — главная страница
- client.js — фронтенд логика
- style.css — стили
- package.json — зависимости
- README.md — документация

⏳ **Осталось:** только установить npm зависимости

---

## 🔧 Дополнительная помощь

Если ничего не помогает:

1. **Проверьте интернет:**
   ```bash
   ping google.com
   ```

2. **Проверьте версию Node.js:**
   ```bash
   node -v
   npm -v
   ```
   Должны быть версии выше:
   - Node.js: v14.0.0+
   - npm: v6.0.0+

3. **Обновите npm:**
   ```bash
   npm install -g npm@latest
   ```

4. **Проверьте наличие прокси:**
   ```bash
   npm config get proxy
   npm config get https-proxy
   ```

---

Если у вас есть доступ к интернету и все еще возникают ошибки, обратитесь к администратору IT (может быть настроен корпоративный прокси).
