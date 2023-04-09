import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { PrismaClient, Author, Post, Prisma } from "@prisma/client";

import schema from './schema';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Prisma Client extensions で、独自のモデルメソッドを定義
const xprisma = prisma.$extends({
  model: {
    $allModels: {
      loadChildren<T, A>(
        this: T,
        models: { id: number }[],
        args: Prisma.Exact<A, Prisma.Args<T, "findMany">> & object
      ): Prisma.Result<T, A, "findMany"> {
        return (this as any).findMany({
          where: {
            id: { in: models.map((model) => model.id) },
          },
          ...args,
        });
      },
    },
  },
});

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const authors = await prisma.$queryRaw`select * from Author` as Array<Author>;

  const authorsWithChildren = await xprisma.author.loadChildren(authors, {
    include: {
      posts: true,
    }
  })

  // 問題1: 上記で返る型を下記と同じにしたい（あくまで例なので、loadChildren の入力は汎用的でないといけない）
  const authorsWithChildren2 = await prisma.author.findMany({
    include: {
      posts: true,
    }
  })

  // 問題2: (問題1の発展) 下記 3と4が同じ型になるようにしたい。
  const authorsWithChildren3 = await xprisma.author.loadChildren(authors, {
    include: {
      posts: {
        include: {
          children: true
        }
      },
    }
  })

  // TODO: 上記で返る型を下記と同じにしたい
  const authorsWithChildren4 = await prisma.author.findMany({
    include: {
      posts: {
        include: {
          children: true
        }
      },
    }
  })


  await prisma.post.findFirst({
    include: {
      children: true
    }
  })

  return formatJSONResponse({
    message: `Hello welcome to the exciting Serverless world!`,
    event,
  });
};


export const main = middyfy(hello);
