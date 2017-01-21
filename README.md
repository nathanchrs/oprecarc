# oprecarc

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Web pendukung open recruitment dan training ARC ITB

## Setup for development

1. Clone the Git repository
2. `npm install`
3. `npm install knex -g`
4. `npm install bower -g`
5. `bower install`
6. Create an empty MySQL/MariaDB database
7. Edit configurations in `config` to match local environment and DB
8. `knex migrate:latest` to make DB tables
9. `knex seed:run` to seed DB with sample data (optional, recommended for development and testing only)
10. `npm run build`
11. `npm start` to run

## Application structure

- `server.js`: main file/entry point. Loads config, components and routes, then starts the web server.
- `app/components`: setup library/third-party components for use.
- `app/routes`: most of the application logic are contained here.
- `app/views`: contains custom styles (in Sass), mixins (reusable Pug components), layouts (Pug page templates), and the Pug template files themselves (to be rendered into HTML).
- `bower_components`: third-party front-end components; treated as static assets (`/assets`). Managed by Bower.
- `config`: directory containing configuration files (e.g. DB connection settings, keys).
- `migrations`: contains database table schemas.
- `node_modules`: third-party node modules/components. Managed by NPM.
- `public`: location to place static assets for the web server (CSS, images, fonts etc., `/public`).
- `seeds`: contains database sample data.

## Useful scripts

- `npm run build` or `npm run build-css` to compile Sass files from `app/views/styles` to `public/style.min.css`.
- `npm run lint` to run the [Javascript Semi-Standard Style](https://github.com/Flet/semistandard) linter/style checker.
- `knex migrate:latest` to update database according to schema in `migrations`.
- `knex migrate:rollback` to rollback most recent migration.
- `knex migrate:make <migration_name>` to create new migration.
- `knex seed:make <seed_name>`
- `knex seed:run`

## Todo

- Posts
  - post table view (/posts?view=table)
  - post user-friendly view (/posts)
  - CRUD

- Events
  - events table view (/events?view=table)
  - events user-friendly view (/events)
    * include whether the current user has registered and/or attended the event

- Tasks
  - tasks table view (/tasks?view=table), admin only
  - tasks user-friendly view (/tasks)
  * include the current user's submissions for each task
  - CRUD

- Submissions
  - submissions table view (/submissions), admin only
  - submission uploader
  - CRUD

- Users
  - users table view (/users), admin only

- Attendances
  - attendances global table view (/attendances), admin only
  * can filter per user or per event
  - attendance form (client-side temporary storage)

- Registrations (for events, like attendances)
  - global table view (/registrations), admin only
  * can filter per user or per event
  - create/delete

- Static asset/media uploader and link

- Deploy script
