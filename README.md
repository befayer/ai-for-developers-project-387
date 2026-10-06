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
| `npm test` | Запускает интеграционные тесты API |
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

Агент работает в GitHub Actions через GitHub App `opencode-agent`. Ключ модели лежит в секрете `OPENCODE_API_KEY`,
адрес приложения для регулярной проверки — в переменной репозитория `APP_URL`. Правила проекта агент берёт из `AGENTS.md`.

| Workflow | Событие | Модель | Назначение | Права на запись | Прогоны |
| --- | --- | --- | --- | --- | --- |
| `opencode.yml` | `issue_comment`, `pull_request_review_comment` (`created`) с `/oc` | `opencode/big-pickle` | `/oc explain` — разбор, `/oc fix` — PR, `/oc` в PR — правки по замечаниям | нет: ветки и PR агент создаёт правами GitHub App, выданными при установке | [Actions](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/opencode.yml) |
| `opencode-triage.yml` | `issues` (`opened`) | `opencode/big-pickle` | метки из `docs/agents/triage-labels.md` и разбор новой задачи | `issues` — для меток | [Actions](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/opencode-triage.yml) |
| `opencode-review.yml` | `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`) | `opencode/big-pickle` | первое ревью PR от людей; не аппрувит и не мержит | `pull-requests` — замечания токеном раннера (`use_github_token`) | [Actions](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/opencode-review.yml) |
| `opencode-weekly.yml` | `schedule` (пн 03:00 UTC), `workflow_dispatch` | `opencode/big-pickle` | Lighthouse по `APP_URL`, отчёт — артефакт `lighthouse-report`, выводы — issue | `contents`, `pull-requests`, `issues` | [Actions](https://github.com/befayer/ai-for-developers-project-387/actions/workflows/opencode-weekly.yml) |

### Принятые решения

- **Модель.** Везде бесплатная `opencode/big-pickle`: задачи учебные, расходы нулевые. Разбор и `/oc fix` она делает хорошо,
  а точные инструкции (метки триажа) выполняет хуже. Если качество станет узким местом, первой на более сильную модель
  переводится ревью — это одна строка `model:`.
- **Команда вызова.** `mentions: /oc` задан явно: одна короткая команда вместо набора по умолчанию `/opencode,/oc`.
- **Кто может звать агента.** Репозиторий открытый, поэтому все workflow агента работают только для `OWNER`, `MEMBER`
  и `COLLABORATOR` (`author_association`). Чужие комментарии, issue и PR агента не запускают и токены не тратят.
- **Защита от петель.** Комментарии, issue и PR от ботов, включая ответы самого агента, отсекаются условием `if`.
- **Регулярная проверка.** Еженедельный аудит измеряет опубликованное приложение через Lighthouse, а не перечитывает код:
  у кода уже есть CI и ревью на каждый PR, а скорость и доступность страницы иначе никто не проверяет.
  Issue создаётся, только если есть что исправлять. Версия Lighthouse закреплена, чтобы отчёты были сравнимы.
- **Публикация сессий.** `share: false` во всех workflow: по умолчанию в открытом репозитории сессия агента публикуется
  по ссылке вместе с контекстом. Ход работы и так виден в issue, PR и логах Actions, отдельная публичная копия не нужна.
- **Права.** Выдаются в каждом workflow отдельно: `id-token: write` везде, запись — только там, где агент ставит метки,
  пишет замечания в PR или создаёт задачи и PR. Ревью сначала запускалось с правами только на чтение, как в примере курса,
  но публикация замечаний токеном раннера падала с `Resource not accessible by integration`, поэтому ему выдано
  `pull-requests: write` — и только оно.

## Проверяемые сценарии

Интеграционные тесты подтверждают запуск и health endpoint, получение типов и слотов, бронирование, появление встречи у организатора, серверный HTTP 409 при повторной записи через другой тип встречи и создание нового типа встречи.

Учебный проект программы [«AI для разработчиков»](https://ru.hexlet.io/programs/ai-for-developers).
