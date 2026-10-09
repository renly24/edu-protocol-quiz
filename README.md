# プロトコルを答えよう（教育用）

SNS に画像をアップロードするとき、Web ブラウザ（送信側）から Web サーバ（受信側）へデータが届くまでの流れの中で、TCP/IP の 4 つの層それぞれで働くプロトコルの名前を答える教育用の Web アプリです。

公開ページ: http://e.gmobb.jp/omaesensei/digital/edu-protocol-quiz/

[ネットワーク通信シミュレータ](https://github.com/renly24/edu-network-simulator) で通信の流れを学んだあとの確認用に使う想定です。

## 内容

1. **通信の流れ（8問）**：教科書の図と同じ配置（左：送信側、中央：4つの層、右：受信側）で、1段ずつ「この処理を担当するプロトコルは？」に答えます。正解するとタグにプロトコル名（HTTPS・TCP・IP）が入ります。間違えると、選んだプロトコルが何をするものかが表示され、正解するまで選び直せます
2. **仕分け問題**：HTTP・HTTPS・SMTP・POP・IMAP・TCP・UDP・IP を、使われる層に仕分けます
3. **場面問題（5問）**：メールの送受信、ネットショップ、ビデオ通話などの場面に合うプロトコルを選びます（1回だけ）
4. **結果**：出席番号・名前を入力し、結果の画面をスクリーンショットで提出する想定です（結果はサーバに保存されません）

採点は「1回目で正解したか」で数えます（通信の流れ 8 ＋ 仕分け 8 ＋ 場面 5 ＝ 21点）。

画面下の「前へ」「次へ」ボタン（← → キーでも操作できます）で進みます。問題に答えるまで次へは進めません。

## 開発

```bash
npm ci
npm run dev    # http://localhost:3000
npm run build  # out/ に静的ファイルを出力
```

出題内容（説明文・選択肢・解説）はすべて `src/components/model.ts` にまとまっています。

## 公開

`main` ブランチにプッシュすると、共通ワークフロー [renly24/edu-deploy-workflows](https://github.com/renly24/edu-deploy-workflows) でビルドし、FTP サーバーの `digital/edu-protocol-quiz/` にアップロードします。リポジトリの Secrets に `FTP_HOST`・`FTP_USER`・`FTP_PASS` が必要です。
