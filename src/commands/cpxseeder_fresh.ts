import fs from 'node:fs'
import path from 'node:path'

import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { Database } from '@adonisjs/lucid/database'


export default class CpxSeederFreshCommand extends BaseCommand {
  static commandName = 'cpx-seeder:fresh'
  static description = 'Truncate all tables and run seeders'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  @flags.boolean({ description: 'Force truncate tables', alias: 'force' })
  declare force: boolean

  async run() {
    const db = (await this.app.container.make('lucid.db')) as Database

    //Get all seeders files
    const dir = this.app.makePath('database', 'cpx_seeders')
    if (!fs.existsSync(dir)) {
      this.logger.info('No seeders found to run.')
      return
    }
    const files = fs.readdirSync(dir).filter(file => !file.endsWith('.map'))

    if (this.force) {
      //Get all tables
      const tables = await db.connection().getAllTables()

      this.logger.info(`Truncating tables`)
      for (const table of tables) {
        if (table.includes('adonis_')) {
          continue
        }
        await db.connection().truncate(table, true)
        this.logger.success(`Table ${table} truncated successfully.`)
      }
    }

    this.logger.info(`Running seeders`)
    for (const file of files) {
      const seeder = await import(path.join(dir, file))
      const seederClass = seeder.default
      await new seederClass(db).run()

      await db.table('cpx_seeders').insert({
        name: file,
        batch: 1,
        migration_time: new Date(),
      })

      this.logger.success(`Seeder ${file} executed successfully.`)
    }
  }
}
