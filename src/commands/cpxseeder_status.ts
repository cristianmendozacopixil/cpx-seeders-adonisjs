import fs from 'node:fs'

import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { Database } from '@adonisjs/lucid/database'


export default class CpxSeederStatusCommand extends BaseCommand {
  static commandName = 'cpx-seeder:status'
  static description = 'View seeders status'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
  }

  async run() {
    this.logger.info(`Listing seeders`)
    const db = (await this.app.container.make('lucid.db')) as Database

    //Get all seeders files
    const dir = this.app.makePath('database', 'cpx_seeders')
    if (!fs.existsSync(dir)) {
      this.logger.info('No seeders found.')
      return
    }
    const files = fs.readdirSync(dir)

    //Get seeders already executed
    const rows = await db.from('cpx_seeders').select('name')
    const dbSeeders = rows.map((row: any) => row.name)

    const table = this.ui.table()
    table.head(['Seeder File', 'Status'])

    for (const file of files) {
      const status = dbSeeders.includes(file)
      table.row([
        file,
        status ? this.colors.green('Ran') : this.colors.yellow('Pending')
      ])
    }
    
    table.render()
  }
}
