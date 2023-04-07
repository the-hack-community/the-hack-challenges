import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { PrismaClient, Author, Post } from "@prisma/client";

import schema from './schema';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  const authors = await prisma.$queryRaw`select * from Author` as Array<Author>;

  const authorsWithChildren: Array<Author & { posts: Post[] }> = loadChildren(authors)

  // 問題1: 上記で返る型を下記と同じにしたい（あくまで例なので、loadChildren の入力は汎用的でないといけない）
  const authorsWithChildren2 = await prisma.author.findMany({
    include: {
      posts: true,
    }
  })

  // 問題2: (問題1の発展) 下記 3と4が同じ型になるようにしたい。
  const authorsWithChildren3: Array<Author & { posts: Post[] }> = loadChildrenWithCustomizedFetch(authors)

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

// 下記関数の引数から考えてください。今は仮で Array<any> の target 変数を入れています。
function loadChildren(target: Array<any>) {
  // TODO: 任意の子供を付与して、子供の配列をパラメータとして追加された型を返す
  // targetの入力は、任意のPrismaのモデルの配列となるようにして、汎用性をもたせる
}

function loadChildrenWithCustomizedFetch(target: Array<any>) {
  // TODO: 任意の子供とそれに追加で OptionのObjectを指定する（ただし、型を他の入力から解決する必要あり）ことで、孫などを含めてロード可能にする
  // 例えば
  // loadChildrenWithCustomizedFetch(authors, 'posts', { include: { children: true } });
  // のような入力で、 Array<Author & { posts: Array<Post & { children: PostChild[] }> }>
  // のような型が返るようにする。（関数の引数の型定義はあくまで例なので自由に考えてください）
  // targetの入力は、任意のPrismaのモデルの配列となるようにして、汎用性をもたせる
}


export const main = middyfy(hello);
