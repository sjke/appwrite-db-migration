import { Client, Databases, type Models } from 'node-appwrite'

import { colored } from './utils'

import { type DBConnectionFn, type DebugLog } from './types'

const DBConnection: DBConnectionFn = ({ endpoint, projectId, token, setSelfSigned }) => {
  const appwriteClient = new Client()
  appwriteClient.setEndpoint(endpoint).setProject(projectId).setKey(token)

  if (setSelfSigned) {
    appwriteClient.setSelfSigned()
  }

  return new Databases(appwriteClient)
}

export const setupMigrationSchema = async (db: Databases, databaseId: string, debug: DebugLog): Promise<void> => {
  const safeCall = async (
    callback: () => Promise<Models.Database | Models.AttributeString | Models.Index>,
    opts?: { infoMessage?: string, successMessage?: string, handleError?: (error: any) => void }
  ): Promise<void> => {
    try {
      opts?.infoMessage && debug(opts.infoMessage)
      await callback()
      opts?.successMessage && console.log(colored.green(opts.successMessage))
    } catch (e) {
      opts?.handleError && opts.handleError(e)
    }
  }

  await safeCall(async () => await db.create(databaseId, databaseId, true), {
    infoMessage: 'Checking database...',
    handleError: (e) => {
      if (e.type !== 'database_already_exists') console.log(colored.red('Database creation failed     '), e.message)
    }
  })

  await safeCall(
    async () => {
      return await db.createCollection(databaseId, 'schema_migrations', 'schema_migrations')
    },
    {
      infoMessage: 'Checking schema migrations...',
      successMessage: 'Schema migrations successfully created',
      handleError: (e) => {
        if (e.type !== 'collection_already_exists') {
          console.log(colored.red('Schema migrations creation failed     '), e.message)
        } else {
          console.log(colored.yellow('Schema migrations already exists'))
        }
      }
    }
  )

  await safeCall(async () => await db.createStringAttribute(databaseId, 'schema_migrations', 'description', 256, true))
  await safeCall(
    async () => await db.createIndex('test', 'schema_migrations', 'uniq_version', 'unique', ['$id'], ['asc'])
  )
}

export default DBConnection
