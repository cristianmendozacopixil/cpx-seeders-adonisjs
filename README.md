# @cpxproject/seeders-adonisjs

Run your database seeders like migrations in [AdonisJS v6 and v7](https://adonisjs.com/). Once, safely, and tracked.

## Features
- **One-time execution**: Just like migrations, seeders are tracked in a database table.
- **Environment safe**: Avoid running the same seeder twice by mistake.
- **Status tracking**: Easily see which seeders have been executed.

## Installation

```bash
npm install @cpxproject/seeders-adonisjs
```

After installation, configure the package:

```bash
node ace configure @cpxproject/seeders-adonisjs
```

Then, run the install command to create the tracking table:

```bash
node ace cpx-seeder:install
node ace migration:run
```

## Usage

### Create a new seeder
```bash
node ace make:cpx-seeder user_role_seeder
```
This will create a new file in `database/cpx_seeders`.

### Run pending seeders
```bash
node ace cpx-seeder:run
```

### Check status
```bash
node ace cpx-seeder:status
```

### Fresh start (truncate tables and re-run all seeders)
```bash
node ace cpx-seeder:fresh --force
```

## License
MIT
