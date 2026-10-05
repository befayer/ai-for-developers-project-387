# Календарь звонков

[![hexlet-check](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/hexlet-check.yml)
[![CI](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/ci.yml/badge.svg)](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/ci.yml)

Сервис онлайн-записи на звонок. Гость выбирает тип встречи и свободный слот ближайших 14 дней, оставляет контакты и получает подтверждение. Организатор создаёт типы встреч и видит все предстоящие бронирования в одном списке.

**Опубликованное приложение:** появится после развёртывания Render Blueprint `befayer-call-calendar-387` (версия из проекта 386: [befayer-call-calendar.onrender.com](https://befayer-call-calendar.onrender.com)).

Приложение развёрнуто на бесплатном тарифе Render, поэтому после периода бездействия первый запуск может занять до минуты.

## Возможности

- два стартовых типа встреч и создание новых организатором;
- свободные слоты по будням с шагом 30 минут;
- окно записи не более 14 дней;
- сквозное бронирование без регистрации;
- общий список встреч организатора;
- серверная защита от пересекающихся броней, в том числе между разными типами встреч;
- TypeSpec → OpenAPI → сгенерированный SDK фронтенда и серверные типы;
- SQLite, Docker, CI и release-please.

## Стек

- React 18, TypeScript, Vite;
- Fastify 5, SQLite (`better-sqlite3`), Zod;
- TypeSpec, OpenAPI, TypeSpec HTTP Client;
- Vitest, ESLint;
- Docker и GitHub Actions.

## Требования

- Node.js 22 или 24;
- npm 10+;
- Docker — только для контейнерной проверки.

## Быстрый старт

```bash
git clone https://github.com/befayer/ai-for-developers-project-387.git
cd ai-for-developers-project-387
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Интерфейс разработки откроется на `http://localhost:5173`, API — на `http://localhost:3000`.

## Production-запуск

```bash
npm run build
PORT=4100 DATABASE_PATH=./data/calendar.db npm start
```

Приложение будет доступно на `http://localhost:4100`. Сервер всегда слушает значение переменной `PORT`.

## Docker

```bash
docker build -t call-calendar .
docker run --rm -p 4100:4100 -e PORT=4100 -e DATABASE_PATH=/app/data/calendar.db call-calendar
```

Проверка: `curl http://localhost:4100/api/v1/health`.

## Переменные окружения

| Переменная | По умолчанию | Назначение |
|---|---:|---|
| `PORT` | `3000` | Порт HTTP-сервера |
| `DATABASE_PATH` | `./data/calendar.db` | Путь к SQLite-файлу; для тестов используется `:memory:` |

Секреты приложению не требуются.

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Запускает фронтенд и API с автообновлением |
| `npm run api:generate` | Генерирует OpenAPI, SDK и серверные типы из TypeSpec |
| `npm run lint` | Проверяет стиль и потенциальные ошибки |
| `npm run typecheck` | Проверяет типы фронтенда и сервера |
| `npm test` | Запускает интеграционные тесты API и компонентные тесты интерфейса |
| `npm run build` | Создаёт production-сборку |
| `npm start` | Запускает собранное приложение |

## Контракт API

Исходник контракта: [`api/main.tsp`](api/main.tsp). Команда `npm run api:generate` создаёт:

- [`docs/openapi/openapi.yaml`](docs/openapi/openapi.yaml) — OpenAPI;
- `src/api/generated/` — клиентский SDK, используемый React-приложением;
- `server/generated/api-types.ts` — типы для серверной реализации.

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/api/v1/health` | Проверка запуска |
| `GET`, `POST` | `/api/v1/event-types` | Просмотр и создание типов встреч |
| `GET` | `/api/v1/event-types/:id/slots?days=14` | Свободные слоты |
| `GET`, `POST` | `/api/v1/bookings` | Список и создание броней |

## Архитектура и процесс

- [Спецификация](docs/spec.md)
- [Словарь предметной области](CONTEXT.md)
- [Архитектурные решения](docs/adr/README.md)
- [Инструкции агентам](AGENTS.md)
- [MCP-конфигурация](docs/mcp.md)
- [План развития](docs/roadmap.md)
- [Контекст курса: рабочий процесс на GitHub](docs/course-context.md)

Проект разработан с ИИ-агентом. Решения, спецификация, вертикальные задачи и зависимости фиксируются в GitHub Issues. Коммиты следуют Conventional Commits и ссылаются на задачи.

## Агент OpenCode

Агент работает в GitHub Actions на модели `opencode/big-pickle`, ключ хранится в секрете `OPENCODE_API_KEY`.

| Workflow | Когда запускается | Что делает |
| --- | --- | --- |
| `opencode.yml` | комментарий с `/oc` в issue или PR | `/oc explain` разбирает задачу, `/oc fix` открывает PR |
| `opencode-triage.yml` | новое issue | ставит метки из `docs/agents/triage-labels.md` и оставляет разбор |
| `opencode-review.yml` | PR от человека | предварительное ревью; решение о мерже за человеком |
| `opencode-weekly.yml` | по понедельникам и вручную | аудит репозитория, итог — issue «Еженедельный аудит» |

## Проверяемые сценарии

Интеграционные тесты подтверждают запуск и health endpoint, получение типов и слотов, бронирование, появление встречи у организатора, серверный HTTP 409 при повторной записи через другой тип встречи и создание нового типа встречи.

Учебный проект программы [«AI для разработчиков»](https://ru.hexlet.io/programs/ai-for-developers).
