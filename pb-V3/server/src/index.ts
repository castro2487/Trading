import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'
import { accountResolvers } from './accountManagementResolvers'
import { merge } from 'lodash'

export interface Context {
  prisma: PrismaClient;
  activeAccountPlatformId: number;
}

async function startApolloServer() {
  const prisma = new PrismaClient()

  const server = new ApolloServer({
    typeDefs,
    resolvers: merge(resolvers, accountResolvers),
    context: ({ req }) => {
      const activeAccountPlatformId = req.headers.accountid as string;
      return {
        activeAccountPlatformId: parseInt(activeAccountPlatformId),
        prisma
      };
    },
  });

  await server.start();

  const app = express();

  // TODO: remove
  app.use(cors())
  server.applyMiddleware({ app });

  const port = process.env.PORT || 4001
  app.listen({ port })
  console.log(`🚀 Server ready :${port}${server.graphqlPath}`);
  return { server, app };
}


startApolloServer()