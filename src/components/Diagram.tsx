import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/material/styles";
import { FLOW, LAYERS, LAYER_BY_ID, SIDE, type FlowStep, type Layer, type PacketView, type Side } from "./model";

// ---------- いちごの画像 ----------

const PHOTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" preserveAspectRatio="none">
<rect width="300" height="200" fill="#f1f8e9"/>
<ellipse cx="150" cy="190" rx="120" ry="16" fill="#c5e1a5"/>
<path d="M150 182 C95 160 70 110 82 82 C92 60 122 56 150 64 C178 56 208 60 218 82 C230 110 205 160 150 182 Z" fill="#e53935"/>
<path d="M150 182 C120 165 102 130 104 100" stroke="#c62828" stroke-width="6" fill="none" opacity="0.5"/>
<g fill="#ffeb3b">
<ellipse cx="110" cy="92" rx="3" ry="5"/><ellipse cx="135" cy="84" rx="3" ry="5"/><ellipse cx="165" cy="84" rx="3" ry="5"/>
<ellipse cx="190" cy="92" rx="3" ry="5"/><ellipse cx="120" cy="118" rx="3" ry="5"/><ellipse cx="150" cy="110" rx="3" ry="5"/>
<ellipse cx="180" cy="118" rx="3" ry="5"/><ellipse cx="132" cy="144" rx="3" ry="5"/><ellipse cx="168" cy="144" rx="3" ry="5"/>
<ellipse cx="150" cy="164" rx="3" ry="5"/></g>
<path d="M150 70 L118 46 L140 58 L132 30 L150 54 L168 30 L160 58 L182 46 Z" fill="#43a047"/>
<rect x="146" y="16" width="8" height="34" rx="4" fill="#2e7d32"/>
</svg>`;
const PHOTO_URL = `url("data:image/svg+xml,${encodeURIComponent(PHOTO_SVG)}")`;

/** 画像を縦に3つに分けた n 番目（1〜3）の切れ端 */
function photoSlice(n: number) {
  return {
    backgroundImage: PHOTO_URL,
    backgroundRepeat: "no-repeat",
    backgroundSize: "300% 100%",
    backgroundPosition: `${(n - 1) * 50}% 0`,
  };
}

const TCP_COLOR = LAYER_BY_ID.transport.color;
const IP_COLOR = LAYER_BY_ID.internet.color;

function Header({ label, color, dashed }: { label: string; color: string; dashed?: boolean }) {
  return (
    <Box
      sx={{
        px: 0.4,
        minWidth: 18,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: dashed ? "transparent" : color,
        color: dashed ? color : "#fff",
        border: dashed ? `2px dashed ${color}` : "none",
        fontSize: "0.62rem",
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}

function Packet({ n, ip, ipRemoved }: { n: number; ip?: boolean; ipRemoved?: boolean }) {
  return (
    <Stack direction="row" sx={{ border: "1px solid #b0bec5", bgcolor: "#fff", boxShadow: 1 }}>
      {ip && <Header label="IP" color={IP_COLOR} dashed={ipRemoved} />}
      <Header label={String(n)} color={TCP_COLOR} />
      <Box sx={{ width: 22, height: 26, ...photoSlice(n) }} />
    </Stack>
  );
}

function Wire() {
  return (
    <Box component="svg" viewBox="0 0 120 24" sx={{ width: "100%", maxWidth: 160, height: 24, display: "block" }}>
      <path d="M0 18 H15 V6 H35 V18 H50 V6 H58 V18 H80 V6 H100 V18 H120" fill="none" stroke={LAYER_BY_ID.link.color} strokeWidth="2.5" />
    </Box>
  );
}

const ORDER: Record<PacketView, number[]> = {
  photo: [],
  split: [1, 2, 3],
  ip: [1, 2, 3],
  wire: [],
  shuffled: [3, 1, 2],
  sorted: [1, 2, 3],
};

export function PacketVisual({ view }: { view: PacketView }) {
  if (view === "photo") {
    return <Box sx={{ width: 84, aspectRatio: "3 / 2", borderRadius: 1, boxShadow: 1, backgroundImage: PHOTO_URL, backgroundSize: "100% 100%" }} />;
  }
  if (view === "wire") return <Wire />;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap rowGap={0.5} alignItems="center">
      {ORDER[view].map((n) => (
        <Packet key={n} n={n} ip={view === "ip" || view === "shuffled"} ipRemoved={view === "shuffled"} />
      ))}
      <Typography component="span" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
        …
      </Typography>
    </Stack>
  );
}

// ---------- 図 ----------

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(255, 193, 7, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
`;

function stepAt(side: Side, layer: Layer) {
  const i = FLOW.findIndex((s) => s.side === side && s.layer === layer);
  return { index: i, step: FLOW[i] };
}

function ProtocolTag({ step, revealed }: { step: FlowStep; revealed: boolean }) {
  if (!step.protocol) return null;
  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 4,
        fontSize: "0.72rem",
        fontWeight: 700,
        bgcolor: revealed ? "#7e57c2" : "#fff",
        color: revealed ? "#fff" : "#7e57c2",
        border: "2px solid #7e57c2",
        minWidth: 52,
        textAlign: "center",
      }}
    >
      {revealed ? step.protocol : "？"}
    </Box>
  );
}

function SideCell({
  side,
  layer,
  current,
  solved,
}: {
  side: Side;
  layer: Layer;
  current: number;
  solved: (i: number) => boolean;
}) {
  const { index, step } = stepAt(side, layer);
  const active = index === current;
  const reached = index <= current;
  const color = SIDE[side].color;
  return (
    <Box
      sx={{
        p: 0.75,
        height: "100%",
        borderRadius: 1.5,
        bgcolor: active ? "#fffde7" : "#fff",
        border: active ? "3px solid #ffc107" : "1px solid #e0e0e0",
        opacity: reached ? 1 : 0.55,
        animation: active ? `${pulse} 1.6s infinite` : "none",
        transition: "all 0.3s",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={0.5} mb={0.5}>
        <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem" }, fontWeight: 700, lineHeight: 1.4 }}>
          <Box component="span" sx={{ color, mr: 0.5 }}>
            {index + 1}
          </Box>
          {step.action}
        </Typography>
        <ProtocolTag step={step} revealed={solved(index)} />
      </Stack>
      {reached && <PacketVisual view={step.packet} />}
    </Box>
  );
}

function LayerCell({ layer, highlight }: { layer: Layer; highlight: boolean }) {
  const l = LAYER_BY_ID[layer];
  return (
    <Box
      sx={{
        p: 0.75,
        height: "100%",
        borderRadius: 1.5,
        bgcolor: highlight ? `${l.color}1f` : "#fafafa",
        border: `2px solid ${highlight ? l.color : "transparent"}`,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography sx={{ fontWeight: 700, color: l.color, fontSize: { xs: "0.72rem", sm: "0.85rem" }, lineHeight: 1.3 }}>{l.name}</Typography>
      <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.7rem", color: "text.secondary", mt: 0.25 }}>{l.role}</Typography>
    </Box>
  );
}

function ColumnHead({ side }: { side: Side }) {
  const s = SIDE[side];
  return (
    <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: s.bg, border: `2px solid ${s.color}`, textAlign: "center" }}>
      <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.95rem" } }}>
        <Box component="span" sx={{ bgcolor: s.color, color: "#fff", borderRadius: 3, px: 0.75, mr: 0.75, fontSize: "0.75em" }}>
          {s.label}
        </Box>
        {s.icon} {s.name}
      </Typography>
      <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", display: { xs: "none", sm: "block" } }}>{s.task}</Typography>
    </Box>
  );
}

/**
 * 教科書の図と同じ配置（左：送信側、中央：層、右：受信側）。
 * スマホの幅では、いま処理している側の列だけを表示する。
 */
export function FlowDiagram({ current, solved }: { current: number; solved: (i: number) => boolean }) {
  const now = FLOW[current];
  const cols = { xs: "minmax(84px, 0.8fr) 2fr", md: "1.6fr 1fr 1.6fr" };
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: cols, gap: 0.75 }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <ColumnHead side="sender" />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 700 }}>
          {now.side === "sender" ? "⬇ 上から下へ" : "⬆ 下から上へ"}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <ColumnHead side={now.side} />
      </Box>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <ColumnHead side="receiver" />
      </Box>
      {LAYERS.map((l) => (
        <Box key={l.id} sx={{ display: "contents" }}>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <SideCell side="sender" layer={l.id} current={current} solved={solved} />
          </Box>
          <LayerCell layer={l.id} highlight={now.layer === l.id} />
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <SideCell side={now.side} layer={l.id} current={current} solved={solved} />
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <SideCell side="receiver" layer={l.id} current={current} solved={solved} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
