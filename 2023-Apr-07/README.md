# The Hack チャレンジ 2023年4月 問題

```
/src/functions/hello/handler.ts
に記載されているコメントを見ながら、
loadChildren, loadChildrenWithCustomizedFetch の型を定義しつつ、関数の実装までを行ってください。
```

# DBの準備

```
MySQLのインストールとパスワードなしのrootユーザ作成
DATABASE_URL="mysql://root:@localhost:3306/the-hack-challenge-2023-apr"
でアクセスできるような環境を作る。

# 下記でDBのマイグレーション実施
pnpm migrate dev
```


# インストール

```
pnpm install
```

# 起動
```
pnpm dev
```

# 起動後のアクセス
```
http://localhost:3000/api/hello
```

