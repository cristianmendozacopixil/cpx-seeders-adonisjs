import fs from 'node:fs'
import path from 'node:path'

import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { Database } from '@adonisjs/lucid/database'

export default class CpxSeederRunCommand extends BaseCommand {
  static commandName = 'cpx-seeder:run'
  static description = 'Seed database by running pending seeders'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  async run() {
    this.logger.info(`Running seeders`)
    const db = (await this.app.container.make('lucid.db')) as Database
    const hasTable = await db.connection().schema.hasTable('cpx_seeders')

    if (!hasTable) {
      this.logger.error('Table "cpx_seeders" does not exist yet.')
      this.exitCode = 1
      return
    }

    let executedCount = 0

    //Get all seeders files
    const dir = this.app.makePath('database', 'cpx_seeders')
    if (!fs.existsSync(dir)) {
      this.logger.success(`No seeders found.`)
      return
    }
    const files = fs.readdirSync(dir).filter(file => !file.endsWith('.map'))

    //Get seeders already executed
    const rows = await db.from('cpx_seeders').select('name')
    const dbSeeders = rows.map((row: any) => row.name)

    for (const file of files) {
      //Skip if seeder was already executed
      if (dbSeeders.includes(file) || file.includes('.js.map')) {
        continue
      }

      //Execute seeder
      const seeder = await import(path.join(dir, file))
      const seederClass = seeder.default
      await new seederClass(db).run()

      //Register seeder in database
      await db.table('cpx_seeders').insert({
        name: file,
        batch: 1,
        migration_time: new Date(),
      })

      executedCount++
      this.logger.success(`Seeder ${file} executed successfully.`)
    }

    //Show message if no seeders were executed
    if (executedCount === 0) {
      this.logger.success(`Already up to date.`)
    }
  }
}
