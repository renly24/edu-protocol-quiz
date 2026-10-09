"use client";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ReplayIcon from "@mui/icons-material/Replay";
import { FlowDiagram } from "./Diagram";
import {
  FLOW,
  LAYERS,
  LAYER_BY_ID,
  PROTOCOLS,
  SCENES,
  SIDE,
  SORT_ITEMS,
  type Layer,
  type Protocol,
} from "./model";

type Slide =
  | { kind: "intro" }
  | { kind: "flow"; i: number }
  | { kind: "sort" }
  | { kind: "scene"; i: number }
  | { kind: "result" };

const SLIDES: Slide[] = [
  { kind: "intro" },
  ...FLOW.map((_, i) => ({ kind: "flow" as const, i })),
  { kind: "sort" },
  ...SCENES.map((_, i) => ({ kind: "scene" as const, i })),
  { kind: "result" },
];

const QUIZ_COLOR = "#7e57c2";

// ---------- 共通部品 ----------

function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderLeft: 4,
        borderColor: ok ? "success.main" : "error.main",
        bgcolor: ok ? "#f1f8e9" : "#ffebee",
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
      }}
    >
      {ok ? <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.25 }} /> : <CancelIcon color="error" fontSize="small" sx={{ mt: 0.25 }} />}
      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
        {children}
      </Typography>
    </Paper>
  );
}

function OptionButton({ label, state, onClick, disabled }: { label: string; state?: "ok" | "ng"; onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      variant="outlined"
      color={state === "ok" ? "success" : state === "ng" ? "error" : "primary"}
      onClick={onClick}
      disabled={disabled && !state}
      sx={{
        justifyContent: "center",
        textTransform: "none",
        fontWeight: 700,
        fontSize: "1rem",
        borderWidth: 2,
        "&:hover": { borderWidth: 2 },
        bgcolor: state === "ok" ? "#e8f5e9" : state === "ng" ? "#ffebee" : "#fff",
        pointerEvents: disabled || state ? "none" : undefined,
      }}
    >
      {state === "ok" ? "⭕ " : state === "ng" ? "❌ " : ""}
      {label}
    </Button>
  );
}

function QuizLabel({ children }: { children: ReactNode }) {
  return <Chip label={children} size="small" sx={{ bgcolor: QUIZ_COLOR, color: "#fff", fontWeight: 700 }} />;
}

function wrongMessage(option: string, custom?: string) {
  if (custom) return custom;
  if (option in PROTOCOLS) {
    const p = PROTOCOLS[option as Protocol];
    return `${option}は${LAYER_BY_ID[p.layer].name}のプロトコルで、${p.does} この場面には合いません。`;
  }
  return "この場面には合いません。";
}

// ---------- スライド：はじめに ----------

function IntroSlide() {
  return (
    <Stack spacing={1.5}>
      <Typography fontWeight={700} fontSize="1.1rem">
        SNSに画像をアップロードするとき、それぞれの層ではどのプロトコルが働いているでしょう？
      </Typography>
      <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
        {SIDE.sender.icon} {SIDE.sender.name}（送信側）から {SIDE.receiver.icon} {SIDE.receiver.name}（受信側）へ、いちごの画像が届くまでの流れを1段ずつ進めます。
        それぞれの段で「この処理を担当するプロトコルは？」に答えると、図の
        <Box component="span" sx={{ mx: 0.5, px: 0.75, border: `2px solid ${QUIZ_COLOR}`, borderRadius: 4, color: QUIZ_COLOR, fontWeight: 700 }}>
          ？
        </Box>
        にプロトコル名が入ります。
      </Typography>
      <Paper variant="outlined" sx={{ p: 1.25 }}>
        <Typography fontWeight={700} mb={0.75}>
          この教材の流れ
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">① 通信の流れ（8問）：送信側は上の層から下の層へ、受信側は下の層から上の層へ</Typography>
          <Typography variant="body2">② 仕分け問題：プロトコルをどの層で使うかに分ける</Typography>
          <Typography variant="body2">③ 場面問題（{SCENES.length}問）：場面に合うプロトコルを選ぶ</Typography>
          <Typography variant="body2">④ 結果：名前を入れて、結果の画面をスクリーンショットで提出</Typography>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.25 }}>
        <Typography fontWeight={700} mb={0.75}>
          4つの層と代表的なプロトコル
        </Typography>
        <Stack spacing={0.75}>
          {LAYERS.map((l) => (
            <Box key={l.id} sx={{ borderLeft: `4px solid ${l.color}`, pl: 1 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: l.color }}>
                {l.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {l.role}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
      <Typography variant="caption" color="text.secondary">
        画面下の「次へ」ボタン（または → キー）で進みます。問題に正解するまで次へは進めません。
      </Typography>
    </Stack>
  );
}

// ---------- スライド：通信の流れ ----------

function FlowSlide({ i, picks, onPick }: { i: number; picks: string[]; onPick: (o: string) => void }) {
  const step = FLOW[i];
  const solved = picks.includes(step.answer);
  const last = picks[picks.length - 1];
  const layer = LAYER_BY_ID[step.layer];
  return (
    <Stack spacing={1.5}>
      <FlowDiagram current={i} solved={(n) => n < i || (n === i && solved)} />
      <Paper variant="outlined" sx={{ p: 1.5, borderTop: `4px solid ${layer.color}` }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap" useFlexGap>
          <QuizLabel>問題 {i + 1} / {FLOW.length}</QuizLabel>
          <Chip size="small" label={`${SIDE[step.side].label}・${layer.name}`} sx={{ bgcolor: `${layer.color}22`, color: layer.color, fontWeight: 700 }} />
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={1} sx={{ lineHeight: 1.7 }}>
          {step.detail}
        </Typography>
        <Typography fontWeight={700} mb={1.25}>
          Q. {step.question}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1 }}>
          {step.options.map((o) => (
            <OptionButton
              key={o}
              label={o}
              state={o === step.answer && solved ? "ok" : picks.includes(o) ? "ng" : undefined}
              disabled={solved}
              onClick={() => onPick(o)}
            />
          ))}
        </Box>
        <Box mt={1.25}>
          {solved ? (
            <Feedback ok>{step.explain}</Feedback>
          ) : (
            last !== undefined && <Feedback ok={false}>{wrongMessage(last, step.wrong?.[last])}もう一度選ぼう。</Feedback>
          )}
        </Box>
      </Paper>
    </Stack>
  );
}

// ---------- スライド：仕分け ----------

function SortSlide({
  placed,
  missed,
  onPlace,
}: {
  placed: Partial<Record<Protocol, Layer>>;
  missed: Protocol[];
  onPlace: (p: Protocol, l: Layer) => boolean;
}) {
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const rest = SORT_ITEMS.filter((p) => !placed[p]);

  const drop = (l: Layer) => {
    if (!selected) return;
    const ok = onPlace(selected, l);
    const p = PROTOCOLS[selected];
    setMessage(
      ok
        ? { ok: true, text: `正解！ ${selected}は${LAYER_BY_ID[l].name}のプロトコルです。` }
        : { ok: false, text: `${selected}は${LAYER_BY_ID[l].name}ではありません。ヒント：${p.does}` },
    );
    if (ok) setSelected(null);
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <QuizLabel>仕分け問題</QuizLabel>
      </Stack>
      <Typography fontWeight={700}>Q. それぞれのプロトコルは、どの層で使われるでしょう？</Typography>
      <Typography variant="body2" color="text.secondary">
        プロトコルを1つ選んでから、入れる層をタップしよう。
      </Typography>
      <Paper variant="outlined" sx={{ p: 1.25, minHeight: 56 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap rowGap={1}>
          {rest.length === 0 ? (
            <Typography color="success.main" fontWeight={700}>
              すべて仕分けできました！
            </Typography>
          ) : (
            rest.map((p) => (
              <Chip
                key={p}
                label={p}
                onClick={() => {
                  setSelected(p);
                  setMessage(null);
                }}
                color={selected === p ? "secondary" : "default"}
                variant={selected === p ? "filled" : "outlined"}
                sx={{ fontWeight: 700, fontSize: "0.95rem", height: 36, px: 0.5, borderWidth: 2 }}
              />
            ))
          )}
        </Stack>
      </Paper>
      {message && <Feedback ok={message.ok}>{message.text}</Feedback>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
        {LAYERS.map((l) => {
          const items = SORT_ITEMS.filter((p) => placed[p] === l.id);
          return (
            <Paper
              key={l.id}
              variant="outlined"
              onClick={() => drop(l.id)}
              sx={{
                p: 1.25,
                minHeight: 84,
                cursor: selected ? "pointer" : "default",
                borderWidth: 2,
                borderColor: selected ? l.color : "divider",
                bgcolor: selected ? `${l.color}12` : "#fff",
                transition: "all 0.2s",
              }}
            >
              <Typography fontWeight={700} sx={{ color: l.color }}>
                {l.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
                {l.role}
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap rowGap={0.75}>
                {items.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    size="small"
                    icon={missed.includes(p) ? undefined : <CheckCircleIcon />}
                    sx={{ bgcolor: l.color, color: "#fff", fontWeight: 700, "& .MuiChip-icon": { color: "#fff" } }}
                  />
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Stack>
  );
}

// ---------- スライド：場面問題 ----------

function SceneSlide({ i, pick, onPick }: { i: number; pick: Protocol | undefined; onPick: (p: Protocol) => void }) {
  const q = SCENES[i];
  const answered = pick !== undefined;
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <QuizLabel>
          場面問題 {i + 1} / {SCENES.length}
        </QuizLabel>
        <Typography variant="caption" color="text.secondary">
          （答えは1回だけ選べます）
        </Typography>
      </Stack>
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fffde7" }}>
        <Typography fontWeight={700} sx={{ lineHeight: 1.8 }}>
          🎬 {q.scene}
        </Typography>
      </Paper>
      <Typography fontWeight={700}>Q. この場面で使われるプロトコルは？</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1 }}>
        {q.options.map((o) => (
          <OptionButton
            key={o}
            label={o}
            disabled={answered}
            state={answered ? (o === q.answer ? "ok" : o === pick ? "ng" : undefined) : undefined}
            onClick={() => onPick(o)}
          />
        ))}
      </Box>
      {answered && (
        <Feedback ok={pick === q.answer}>
          {pick === q.answer ? "正解！ " : `正解は ${q.answer} です。`}
          {q.explain}
        </Feedback>
      )}
    </Stack>
  );
}

// ---------- スライド：結果 ----------

function ResultSlide({
  flowFirst,
  sortFirst,
  scenesOk,
  name,
  onName,
  onRestart,
}: {
  flowFirst: boolean[];
  sortFirst: boolean[];
  scenesOk: boolean[];
  name: string;
  onName: (v: string) => void;
  onRestart: () => void;
}) {
  const [finishedAt] = useState(() => new Date());
  const count = (a: boolean[]) => a.filter(Boolean).length;
  const rows = [
    { label: "① 通信の流れ（1回目で正解）", got: count(flowFirst), of: flowFirst.length, marks: flowFirst },
    { label: "② 仕分け（1回目で正解）", got: count(sortFirst), of: sortFirst.length, marks: sortFirst },
    { label: "③ 場面問題", got: count(scenesOk), of: scenesOk.length, marks: scenesOk },
  ];
  const got = rows.reduce((s, r) => s + r.got, 0);
  const of = rows.reduce((s, r) => s + r.of, 0);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <QuizLabel>結果</QuizLabel>
        <Typography variant="caption" color="text.secondary">
          この画面をスクリーンショットして提出しよう（結果はどこにも保存されません）
        </Typography>
      </Stack>
      <Box>
        <Typography component="label" htmlFor="student-name" variant="body2" fontWeight={700} display="block" mb={0.5}>
          出席番号・名前
        </Typography>
        <TextField
          id="student-name"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="例：1年1組 1番 情報 太郎"
          size="small"
          fullWidth
        />
      </Box>
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderWidth: 2, borderColor: QUIZ_COLOR }}>
        <Typography variant="body2" color="text.secondary">
          {name || "（名前未入力）"}　{finishedAt.toLocaleString("ja-JP")}
        </Typography>
        <Typography sx={{ fontSize: "2.4rem", fontWeight: 700, color: QUIZ_COLOR, lineHeight: 1.3 }}>
          {got} / {of}
        </Typography>
        <LinearProgress variant="determinate" value={(got / of) * 100} sx={{ height: 10, borderRadius: 5, mt: 0.5 }} />
      </Paper>
      <Stack spacing={1}>
        {rows.map((r) => (
          <Paper key={r.label} variant="outlined" sx={{ p: 1.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="body2" fontWeight={700}>
                {r.label}
              </Typography>
              <Typography fontWeight={700}>
                {r.got} / {r.of}
              </Typography>
            </Stack>
            <Typography sx={{ letterSpacing: 2 }}>{r.marks.map((m) => (m ? "⭕" : "❌")).join("")}</Typography>
          </Paper>
        ))}
      </Stack>
      <Paper variant="outlined" sx={{ p: 1.25 }}>
        <Typography fontWeight={700} mb={0.75}>
          ふりかえり：今回の流れで働いたプロトコル
        </Typography>
        {LAYERS.map((l) => {
          const used = [...new Set(FLOW.filter((s) => s.layer === l.id && s.protocol).map((s) => s.protocol))];
          return (
            <Typography key={l.id} variant="body2" sx={{ borderLeft: `4px solid ${l.color}`, pl: 1, mb: 0.5 }}>
              <b style={{ color: l.color }}>{l.name}</b>：{used.length ? used.join("、") : "物理的な通信手段（イーサネット・無線LAN など）"}
            </Typography>
          );
        })}
      </Paper>
      <Box textAlign="center">
        <Button startIcon={<ReplayIcon />} onClick={onRestart}>
          最初からやり直す
        </Button>
      </Box>
    </Stack>
  );
}

// ---------- 本体 ----------

export default function ProtocolQuiz() {
  const [index, setIndex] = useState(0);
  const [flowPicks, setFlowPicks] = useState<string[][]>(() => FLOW.map(() => []));
  const [placed, setPlaced] = useState<Partial<Record<Protocol, Layer>>>({});
  const [missed, setMissed] = useState<Protocol[]>([]);
  const [scenePicks, setScenePicks] = useState<(Protocol | undefined)[]>(() => SCENES.map(() => undefined));
  const [name, setName] = useState("");

  const slide = SLIDES[index];
  const canNext = (() => {
    if (index >= SLIDES.length - 1) return false;
    if (slide.kind === "flow") return flowPicks[slide.i].includes(FLOW[slide.i].answer);
    if (slide.kind === "sort") return SORT_ITEMS.every((p) => placed[p]);
    if (slide.kind === "scene") return scenePicks[slide.i] !== undefined;
    return true;
  })();

  const go = useCallback((d: number) => setIndex((i) => Math.min(Math.max(i + d, 0), SLIDES.length - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight" && canNext) go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, canNext]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  const restart = () => {
    setFlowPicks(FLOW.map(() => []));
    setPlaced({});
    setMissed([]);
    setScenePicks(SCENES.map(() => undefined));
    setIndex(0);
  };

  const pickFlow = (i: number, o: string) =>
    setFlowPicks((all) => all.map((p, n) => (n === i && !p.includes(o) ? [...p, o] : p)));

  const place = (p: Protocol, l: Layer) => {
    if (PROTOCOLS[p].layer === l) {
      setPlaced((all) => ({ ...all, [p]: l }));
      return true;
    }
    setMissed((all) => (all.includes(p) ? all : [...all, p]));
    return false;
  };

  const section =
    slide.kind === "intro"
      ? "はじめに"
      : slide.kind === "flow"
        ? `① 通信の流れ ${slide.i + 1} / ${FLOW.length}`
        : slide.kind === "sort"
          ? "② 仕分け問題"
          : slide.kind === "scene"
            ? `③ 場面問題 ${slide.i + 1} / ${SCENES.length}`
            : "④ 結果";

  return (
    <Paper elevation={2} sx={{ p: { xs: 1.25, sm: 2 }, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography fontWeight={700} color="text.secondary" fontSize="0.9rem">
          {section}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {index + 1} / {SLIDES.length}
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={(index / (SLIDES.length - 1)) * 100} sx={{ mb: 2, height: 6, borderRadius: 3 }} />

      <Box key={index}>
        {slide.kind === "intro" && <IntroSlide />}
        {slide.kind === "flow" && <FlowSlide i={slide.i} picks={flowPicks[slide.i]} onPick={(o) => pickFlow(slide.i, o)} />}
        {slide.kind === "sort" && <SortSlide placed={placed} missed={missed} onPlace={place} />}
        {slide.kind === "scene" && (
          <SceneSlide
            i={slide.i}
            pick={scenePicks[slide.i]}
            onPick={(p) => setScenePicks((all) => all.map((v, n) => (n === slide.i && v === undefined ? p : v)))}
          />
        )}
        {slide.kind === "result" && (
          <ResultSlide
            flowFirst={flowPicks.map((p, i) => p[0] === FLOW[i].answer)}
            sortFirst={SORT_ITEMS.map((p) => !missed.includes(p))}
            scenesOk={scenePicks.map((p, i) => p === SCENES[i].answer)}
            name={name}
            onName={setName}
            onRestart={restart}
          />
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2.5}>
        <Button variant="outlined" startIcon={<NavigateBeforeIcon />} onClick={() => go(-1)} disabled={index === 0}>
          前へ
        </Button>
        {!canNext && index < SLIDES.length - 1 && (
          <Typography variant="caption" color="text.secondary" textAlign="center" mx={1}>
            問題に答えると進めます
          </Typography>
        )}
        <Button variant="contained" endIcon={<NavigateNextIcon />} onClick={() => go(1)} disabled={!canNext}>
          次へ
        </Button>
      </Stack>
    </Paper>
  );
}
