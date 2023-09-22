import { type Databases } from 'node-appwrite'

export type DebugLog = (args: any | any[]) => void

export interface CliOption {
  endpoint: string
  projectId: string
  databaseId: string
  token: string
  path: string
  verbose: boolean
  debug: DebugLog
}

export interface SetupOption extends CliOption {}
export interface MigrateOption extends CliOption {}
export interface GenerateOption extends CliOption {
  name: string
  type: 'ts' | 'js'
}

export interface DBConnectionOption {
  endpoint: string
  projectId: string
  token: string
  databaseId: string
  setSelfSigned?: boolean
}

export type CommandFn = (...args: any[]) => Promise<void>
export type GenerateFn = (name: string, options: GenerateOption) => Promise<void>
export type MigrateFn = (options: MigrateOption) => Promise<void>
export type SetupFn = (options: SetupOption) => Promise<void>
export type DBConnectionFn = (options: DBConnectionOption) => Databases
