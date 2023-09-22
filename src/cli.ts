#!/usr/bin/env node

import { Command, Option } from 'commander'

import migrateCommand from './commands/migrate'
import generateCommand from './commands/generate'
import setupCommand from './commands/setup'

import {
  type CommandFn,
  type CliOption,
  type DebugLog,
  type GenerateFn,
  type GenerateOption,
  type MigrateFn,
  type MigrateOption,
  type SetupFn,
  type SetupOption
} from './types'

const debugLog = (verbose: boolean): DebugLog => (...args) => { verbose && console.log(...args) }

function handleCommand<C extends CommandFn, O extends CliOption> (command: C): (options: O) => Promise<void> {
  return async (...args) => {
    args.pop()
    const options = args.pop() as O

    // @ts-expect-error TS2322
    args = [...(args as any[]), { ...options, debug: debugLog(options.verbose) }]

    try {
      await command(...args)
    } catch (error) {
      console.log('Error: ', (error as { message: string }).message)
      process.exit(1)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const prog = new Command('appwrite-db').version(require('../package.json').version)

prog
  .command('setup')
  .description('Setup appwrite-db-migration')
  .action(handleCommand<SetupFn, SetupOption>(setupCommand))

prog
  .command('generate <name>')
  .description('Generate a new migration file')
  .addOption(new Option('--type <type>', 'Type of migration file').default('js').choices(['ts', 'js']))
  .action(handleCommand<GenerateFn, GenerateOption>(generateCommand))

prog
  .command('migrate')
  .description('Migrate schema to the latest version')
  .action(handleCommand<MigrateFn, MigrateOption>(migrateCommand))

prog.commands.forEach((cmd: Command) => {
  if (['setup', 'migrate'].includes(cmd.name())) {
    cmd
      .addOption(
        new Option('--endpoint <url>', 'Appwrite API Endpoint')
          .default('https://cloud.appwrite.io/v1')
          .env('APPWRITE_URL')
          .makeOptionMandatory()
      )
      .addOption(new Option('--projectId <id>', 'Appwrite project ID').env('APPWRITE_PROJECT_ID').makeOptionMandatory())
      .addOption(
        new Option('--databaseId <id>', 'Appwrite Database ID').env('APPWRITE_DATABASE_ID').makeOptionMandatory()
      )
      .addOption(new Option('--token <srting>', 'Appwrite Database ID').env('APPWRITE_TOKEN').makeOptionMandatory())
  }

  cmd
    .addOption(new Option('--path <dir>', 'Path to migration files').default('./migrations').makeOptionMandatory())
    .addOption(new Option('--verbose', 'Show console debug logging within appwrite migrate').default(false))
})

prog.parse(process.argv)
