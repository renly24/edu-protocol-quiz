// ---------- モデル（出題の内容） ----------

export type Side = "sender" | "receiver";
export type Layer = "app" | "transport" | "internet" | "link";

export const LAYERS: {
  id: Layer;
  name: string;
  role: string;
  protocols: string;
  color: string;
}[] = [
  {
    id: "app",
    name: "アプリケーション層",
    role: "各アプリケーションに固有のプロトコルを用いる。",
    protocols: "HTTP、HTTPS（Webページのやり取り）、SMTP、POP、IMAP（電子メールのやり取り）",
    color: "#1e88e5",
  },
  {
    id: "transport",
    name: "トランスポート層",
    role: "アプリケーションを識別し、通信の信頼性を決める。",
    protocols: "TCP、UDP",
    color: "#43a047",
  },
  {
    id: "internet",
    name: "インターネット層",
    role: "宛先までデータを届ける。",
    protocols: "IP",
    color: "#fb8c00",
  },
  {
    id: "link",
    name: "ネットワークインタフェース層",
    role: "物理的な通信手段の仕様を決める。",
    protocols: "（イーサネット、無線LAN など）",
    color: "#8e24aa",
  },
];

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map((l) => [l.id, l])) as Record<
  Layer,
  (typeof LAYERS)[number]
>;

export const SIDE = {
  sender: { label: "送信側", name: "Webブラウザ", icon: "💻", task: "SNSで画像データのアップロードの操作を行う。", color: "#d81b60", bg: "#fce4ec" },
  receiver: { label: "受信側", name: "Webサーバ", icon: "🖥️", task: "SNSに画像データを表示する。", color: "#1e88e5", bg: "#e3f2fd" },
} as const;

/** 出題するプロトコル。間違えて選んだときに、そのプロトコルが何をするかを伝える */
export const PROTOCOLS = {
  HTTP: { layer: "app", does: "Webページのやり取りに使うプロトコルです。ただし通信は暗号化されません。" },
  HTTPS: { layer: "app", does: "HTTPの通信を暗号化して、Webページのやり取りを安全に行うプロトコルです。" },
  SMTP: { layer: "app", does: "電子メールを送信するときに使うプロトコルです。" },
  POP: { layer: "app", does: "電子メールをメールサーバから受信する（端末に取り込む）ときに使うプロトコルです。" },
  IMAP: { layer: "app", does: "電子メールをメールサーバ上に置いたまま読んだり管理したりするときに使うプロトコルです。" },
  TCP: { layer: "transport", does: "パケットに番号を付け、受信側で並べ替えたり、届かなかった分を再送したりして通信の信頼性を確保するプロトコルです。" },
  UDP: { layer: "transport", does: "番号の確認や再送を行わず、速さを優先するトランスポート層のプロトコルです。" },
  IP: { layer: "internet", does: "IPアドレスをもとに、宛先までパケットを届けるプロトコルです。" },
} as const satisfies Record<string, { layer: Layer; does: string }>;

export type Protocol = keyof typeof PROTOCOLS;
export const PROTOCOL_NAMES = Object.keys(PROTOCOLS) as Protocol[];

/** 図の各段で表示するパケットの姿 */
export type PacketView =
  | "photo" // 分割前の画像
  | "split" // 番号付きのパケット（TCPヘッダ）
  | "ip" // TCPヘッダ ＋ IPヘッダ
  | "wire" // 信号として送出
  | "shuffled" // 順番がばらばらに届いたパケット（IPヘッダ付き）
  | "sorted"; // 並べ替えて復元

export interface FlowStep {
  side: Side;
  layer: Layer;
  /** 図の説明文 */
  action: string;
  /** 補足（ヘッダに何を書く・外すか） */
  detail: string;
  packet: PacketView;
  question: string;
  options: string[];
  answer: string;
  /** プロトコル名を問う段（タグに表示する） */
  protocol?: Protocol;
  /** 正解したときの解説 */
  explain: string;
  /** プロトコル以外の選択肢を選んだときの説明 */
  wrong?: Record<string, string>;
}

export const FLOW: FlowStep[] = [
  {
    side: "sender",
    layer: "app",
    action: "画像データをトランスポート層へ送る。",
    detail: "ブラウザのアドレス欄は「https://sns.example/upload」。鍵マークが付いた、暗号化された通信でアップロードします。",
    packet: "photo",
    question: "Webブラウザが画像データをアップロードするとき、アプリケーション層で使われるプロトコルは？",
    options: ["HTTP", "HTTPS", "SMTP", "TCP"],
    answer: "HTTPS",
    protocol: "HTTPS",
    explain: "アドレスが「https://」で始まるので、HTTPを暗号化したHTTPSでやり取りします。HTTPSはアプリケーション層のプロトコルです。",
    wrong: {
      HTTP: "HTTPもWebページのやり取りに使いますが、暗号化されません。アドレス欄が「https://」で始まっていることに注目しよう。",
      TCP: "TCPはトランスポート層のプロトコルです。いま処理しているのはアプリケーション層です。",
    },
  },
  {
    side: "sender",
    layer: "transport",
    action: "データを受け取り、パケットに分割する。",
    detail: "分割したパケットのヘッダに番号を記録し、インターネット層へ送ります。",
    packet: "split",
    question: "パケットに分割し、ヘッダにパケットの番号を記録するプロトコルは？",
    options: ["UDP", "IP", "TCP", "HTTPS"],
    answer: "TCP",
    protocol: "TCP",
    explain: "TCPはパケットに番号を付けて送り、受信側で並べ替えられるようにします。これが通信の信頼性を確保するしくみです。",
    wrong: {
      UDP: "UDPもトランスポート層のプロトコルですが、番号による並べ替えや再送を行いません。画像を元どおりに届けるには信頼性が必要です。",
    },
  },
  {
    side: "sender",
    layer: "internet",
    action: "パケットを受け取り、宛先情報などをつける。",
    detail: "送信先と送信元のIPアドレスをヘッダに記録し、ネットワークインタフェース層へ送ります。",
    packet: "ip",
    question: "送信先と送信元のIPアドレスをヘッダに記録するプロトコルは？",
    options: ["TCP", "IP", "HTTP", "POP"],
    answer: "IP",
    protocol: "IP",
    explain: "IPは、ヘッダに記録したIPアドレスをもとに宛先までパケットを届けるプロトコルです。",
  },
  {
    side: "sender",
    layer: "link",
    action: "ネットワークへパケットを送出する。",
    detail: "パケットを電気信号や電波に変えて、ケーブルや無線LANで送り出します。",
    packet: "wire",
    question: "パケットを物理的な通信手段（ケーブルや電波）で送り出す、この層の名前は？",
    options: ["アプリケーション層", "トランスポート層", "インターネット層", "ネットワークインタフェース層"],
    answer: "ネットワークインタフェース層",
    explain: "ネットワークインタフェース層は、物理的な通信手段の仕様を決める層です。有線ならイーサネット、無線なら無線LAN（Wi-Fi）などが使われます。",
    wrong: {
      インターネット層: "インターネット層は、IPアドレスをもとに宛先までデータを届ける層です。",
      トランスポート層: "トランスポート層は、アプリケーションを識別し、通信の信頼性を決める層です。",
      アプリケーション層: "アプリケーション層は、HTTPSやSMTPなど、アプリケーションごとのプロトコルを使う層です。",
    },
  },
  {
    side: "receiver",
    layer: "link",
    action: "ネットワーク上のパケットを監視する。",
    detail: "ケーブルや電波で届いた信号を受け取り、パケットに戻してインターネット層へ渡します。",
    packet: "wire",
    question: "ネットワークインタフェース層が決めているのはどれ？",
    options: ["宛先までデータを届ける方法", "物理的な通信手段の仕様", "通信の信頼性", "電子メールのやり取りの方法"],
    answer: "物理的な通信手段の仕様",
    explain: "ネットワークインタフェース層は、ケーブルの種類や電波の使い方など、物理的な通信手段の仕様を決めています。",
    wrong: {
      宛先までデータを届ける方法: "それはインターネット層（IP）の役割です。",
      通信の信頼性: "それはトランスポート層（TCP）の役割です。",
      電子メールのやり取りの方法: "それはアプリケーション層（SMTP、POP、IMAP）の役割です。",
    },
  },
  {
    side: "receiver",
    layer: "internet",
    action: "IPヘッダを取り除き、トランスポート層へ送る。",
    detail: "自分宛てのパケットを次々に受信し、ヘッダのIPアドレスを確かめてから取り除きます。",
    packet: "shuffled",
    question: "自分宛てのパケットかどうかを確かめ、そのヘッダを取り除くプロトコルは？",
    options: ["UDP", "IMAP", "IP", "TCP"],
    answer: "IP",
    protocol: "IP",
    explain: "送信側のIPが付けたヘッダを、受信側のIPが確かめて取り除きます。同じ層どうしが対応しているのがポイントです。",
  },
  {
    side: "receiver",
    layer: "transport",
    action: "復元したデータをアプリケーション層へ送る。",
    detail: "受け取ったパケットを、ヘッダの番号をもとに並べ替えます。また、ヘッダを取り除きます。",
    packet: "sorted",
    question: "ばらばらの順番で届いたパケットを、ヘッダの番号をもとに並べ替えるプロトコルは？",
    options: ["TCP", "SMTP", "IP", "UDP"],
    answer: "TCP",
    protocol: "TCP",
    explain: "送信側のTCPが付けた番号を使って、受信側のTCPが元の順番に並べ替えます。IPはパケットを届けるだけなので、届く順番はばらばらになることがあります。",
    wrong: {
      UDP: "UDPは番号による並べ替えを行いません。ここでは届いた順番がばらばらなので、並べ替えが必要です。",
    },
  },
  {
    side: "receiver",
    layer: "app",
    action: "画像データを受け取る。",
    detail: "Webサーバは受け取った画像を保存し、SNSに表示します。",
    packet: "photo",
    question: "Webサーバが画像データを受け取るとき、アプリケーション層で使われるプロトコルは？",
    options: ["POP", "IMAP", "HTTPS", "HTTP"],
    answer: "HTTPS",
    protocol: "HTTPS",
    explain: "送信側と同じHTTPSで受け取ります。送信側と受信側では、同じ層で同じプロトコルが働いています。",
    wrong: {
      HTTP: "送信側のブラウザは暗号化されたHTTPSで送っていました。受信側も同じプロトコルで受け取ります。",
    },
  },
];

/** 仕分け問題で使うプロトコル */
export const SORT_ITEMS: Protocol[] = ["SMTP", "TCP", "IP", "HTTPS", "UDP", "POP", "HTTP", "IMAP"];

export interface SceneQuestion {
  scene: string;
  options: Protocol[];
  answer: Protocol;
  explain: string;
}

/** 場面問題：場面に合うプロトコルを選ぶ */
export const SCENES: SceneQuestion[] = [
  {
    scene: "友だちに電子メールを送信する。",
    options: ["POP", "SMTP", "HTTP", "IMAP"],
    answer: "SMTP",
    explain: "電子メールの送信にはSMTPを使います。",
  },
  {
    scene: "メールサーバに届いた電子メールを、スマホに取り込んで読む。",
    options: ["SMTP", "HTTPS", "POP", "UDP"],
    answer: "POP",
    explain: "メールサーバから電子メールを受信して端末に取り込むときはPOPを使います。サーバ上に置いたまま読むときはIMAPです。",
  },
  {
    scene: "ネットショップで、住所やカード番号を入力して注文する。",
    options: ["HTTP", "HTTPS", "SMTP", "IP"],
    answer: "HTTPS",
    explain: "個人情報を送るときは、通信を暗号化するHTTPSを使います。",
  },
  {
    scene: "多少データが欠けてもよいので、遅れなく音声や映像を届けたい（ビデオ通話）。",
    options: ["TCP", "UDP", "IMAP", "HTTPS"],
    answer: "UDP",
    explain: "UDPは再送や並べ替えをしないぶん速いので、遅れが問題になるビデオ通話などに向いています。",
  },
  {
    scene: "どのネットワークにつながっていても、IPアドレスをもとに宛先のコンピュータまでパケットを届ける。",
    options: ["TCP", "HTTP", "IP", "POP"],
    answer: "IP",
    explain: "宛先までパケットを届けるのは、インターネット層のIPの役割です。",
  },
];
