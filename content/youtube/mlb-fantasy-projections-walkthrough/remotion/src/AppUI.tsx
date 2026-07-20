import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, type Player, players } from "./data";

export const Brand: React.FC<{ light?: boolean; compact?: boolean }> = ({ light = false, compact = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: compact ? 11 : 15 }}>
    <div style={{ position: "relative", width: compact ? 30 : 38, height: compact ? 30 : 38 }}>
      {[0, 120, 240].map((angle) => (
        <div
          key={angle}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: compact ? 7 : 9,
            height: compact ? 19 : 24,
            borderRadius: 8,
            background: colors.orange,
            transformOrigin: "50% 1px",
            translate: "-50% 0",
            rotate: `${angle}deg`,
          }}
        />
      ))}
    </div>
    <span
      style={{
        fontFamily: "Familjen Grotesk, sans-serif",
        fontSize: compact ? 26 : 34,
        lineHeight: 1,
        fontWeight: 700,
        color: light ? colors.paperBright : colors.ink,
      }}
    >
      Propeller
    </span>
  </div>
);

export const Kicker: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      color: dark ? colors.lime : colors.orange,
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: "0.13em",
      textTransform: "uppercase",
    }}
  >
    <span style={{ width: 34, height: 3, background: "currentColor" }} />
    {children}
  </div>
);

export const CaptureLabel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      right: 32,
      top: 28,
      zIndex: 8,
      padding: "9px 13px",
      borderRadius: 6,
      background: "rgba(16,19,17,0.86)",
      color: "white",
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 15,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}
  >
    {children ?? "Live board · captured Jul 18, 2026"}
  </div>
);

const Metric: React.FC<{ label: string; value: number; active?: boolean }> = ({ label, value, active }) => (
  <div style={{ minWidth: 104 }}>
    <div
      style={{
        color: colors.muted,
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.11em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div
      style={{
        marginTop: 7,
        color: active ? colors.orange : colors.ink,
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 32,
        fontWeight: 700,
      }}
    >
      {value.toFixed(1)}
    </div>
  </div>
);

const PlayerRow: React.FC<{ player: Player; rank: number; selected?: boolean; active: "floor" | "projection" | "ceiling" }> = ({
  player,
  rank,
  selected,
  active,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "54px 1fr 106px 126px 112px 52px",
      alignItems: "center",
      gap: 18,
      minHeight: 94,
      padding: "13px 22px",
      borderTop: `1px solid ${colors.line}`,
      background: selected ? "#fff0e9" : "white",
    }}
  >
    <span style={{ fontFamily: "IBM Plex Mono, monospace", color: colors.muted, fontSize: 20, fontWeight: 700 }}>{rank}</span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 22, fontWeight: 700, color: colors.ink }}>{player.name}</div>
      <div style={{ marginTop: 5, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 15, color: colors.muted }}>
        {player.team} · {player.inputs} market inputs
      </div>
    </div>
    {(["floor", "projection", "ceiling"] as const).map((key) => (
      <span
        key={key}
        style={{
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: key === "projection" ? 27 : 23,
          fontWeight: 700,
          color: active === key ? colors.orange : colors.ink,
        }}
      >
        {player[key].toFixed(1)}
      </span>
    ))}
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: 18,
        display: "grid",
        placeItems: "center",
        border: `2px solid ${selected ? colors.orange : colors.line}`,
        color: "white",
        background: selected ? colors.orange : "white",
        fontSize: 20,
        fontWeight: 900,
      }}
    >
      ✓
    </span>
  </div>
);

export const ComparisonPlayer: React.FC<{ player: Player; recommended: boolean }> = ({ player, recommended }) => (
  <div
    style={{
      flex: 1,
      padding: 28,
      borderRadius: 12,
      border: `2px solid ${recommended ? colors.orange : colors.line}`,
      background: recommended ? "#fff0e9" : "#f7f5f0",
      boxShadow: recommended ? "9px 9px 0 rgba(255,96,56,0.15)" : "none",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span
        style={{
          padding: "7px 13px",
          borderRadius: 20,
          background: recommended ? colors.orange : "white",
          border: recommended ? "none" : `1px solid ${colors.line}`,
          color: recommended ? "white" : colors.muted,
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.1em",
        }}
      >
        {recommended ? "START" : "SIT"}
      </span>
      <span style={{ fontFamily: "IBM Plex Mono, monospace", color: colors.muted, fontSize: 17, fontWeight: 700 }}>{player.team}</span>
    </div>
    <div style={{ marginTop: 22, color: colors.ink, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 34, fontWeight: 700 }}>
      {player.name}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 28 }}>
      <Metric label="Floor" value={player.floor} />
      <Metric label="Proj" value={player.projection} active />
      <Metric label="Ceiling" value={player.ceiling} />
    </div>
    <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${colors.line}`, color: colors.muted, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 17 }}>
      <strong style={{ fontFamily: "IBM Plex Mono, monospace", color: colors.ink }}>{player.inputs}</strong> market inputs ·{" "}
      <strong style={{ fontFamily: "IBM Plex Mono, monospace", color: colors.ink }}>{player.games}</strong> recent games
    </div>
  </div>
);

export const DesktopApp: React.FC<{
  selected?: boolean;
  comparison?: boolean;
  active?: "floor" | "projection" | "ceiling";
}> = ({ selected = false, comparison = false, active = "projection" }) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [7, 20], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div
      style={{
        width: 1540,
        height: 830,
        overflow: "hidden",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.18)",
        background: colors.paperBright,
        boxShadow: "0 40px 100px rgba(0,0,0,0.38)",
        scale: reveal,
      }}
    >
      <div style={{ height: 76, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: colors.ink }}>
        <Brand light compact />
        <div style={{ display: "flex", gap: 26, color: "#cbd1cc", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 17 }}>
          <span>Discover</span><span>Props</span><strong style={{ color: "white" }}>Fantasy</strong><span>Tracker</span>
        </div>
      </div>
      <div style={{ padding: "28px 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 15, fontWeight: 700, color: colors.orange, letterSpacing: "0.13em" }}>FANTASY</div>
            <div style={{ marginTop: 5, fontFamily: "Familjen Grotesk, sans-serif", fontSize: 38, fontWeight: 700, color: colors.ink }}>Propeller MLB projections</div>
            <div style={{ marginTop: 7, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 18, color: colors.muted }}>Compare player-specific downside, expected scoring, and upside from today’s markets.</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ padding: "10px 14px", background: "#e9f5ee", color: colors.green, borderRadius: 7, fontFamily: "IBM Plex Mono, monospace", fontSize: 15, fontWeight: 700 }}>● LIVE · JUL 18</span>
            <span style={{ padding: "10px 14px", border: `1px solid ${colors.line}`, borderRadius: 7, fontFamily: "IBM Plex Mono, monospace", fontSize: 15, color: colors.ink }}>↻ Refresh</span>
          </div>
        </div>

        {comparison ? (
          <div style={{ marginTop: 27 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "Familjen Grotesk, sans-serif", fontSize: 27, fontWeight: 700, color: colors.ink }}>Sit / Start comparison</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 18, fontWeight: 700, color: colors.orange }}>+1.4 PTS</div>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <ComparisonPlayer player={players[0]} recommended />
              <ComparisonPlayer player={players[1]} recommended={false} />
            </div>
            <div style={{ marginTop: 18, padding: "16px 18px", borderRadius: 8, background: "#edf0ed", color: colors.muted, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 18 }}>
              Floor and ceiling show a likely range from recent scoring variation centered on today’s projection—not guaranteed limits.
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "Familjen Grotesk, sans-serif", fontSize: 26, fontWeight: 700 }}>Slate rankings <span style={{ color: colors.muted, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 17, fontWeight: 400 }}>· Select two hitters to compare</span></div>
              <div style={{ display: "flex", gap: 9 }}>
                {(["floor", "projection", "ceiling"] as const).map((key) => (
                  <span key={key} style={{ padding: "10px 15px", borderRadius: 7, border: `1px solid ${active === key ? colors.orange : colors.line}`, background: active === key ? "#fff0e9" : "white", color: active === key ? colors.orange : colors.muted, fontFamily: "IBM Plex Mono, monospace", fontSize: 15, fontWeight: 700, textTransform: "capitalize" }}>{key === "projection" ? "Projected" : key}</span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 14, border: `1px solid ${colors.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "54px 1fr 106px 126px 112px 52px", gap: 18, padding: "12px 22px", background: "#efede7", color: colors.muted, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <span>#</span><span>Hitter</span><span>Floor</span><span>Projected</span><span>Ceiling</span><span />
              </div>
              {players.map((player, index) => <PlayerRow key={player.name} player={player} rank={index + 1} selected={selected && index < 2} active={active} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const MobileApp: React.FC<{ comparison?: boolean; active?: "floor" | "projection" | "ceiling" }> = ({ comparison = false, active = "projection" }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width: 500,
        height: 900,
        borderRadius: 56,
        border: "12px solid #0a0d0b",
        overflow: "hidden",
        background: "#f5f3ee",
        boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
        scale: interpolate(frame, [0, 18], [0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
      }}
    >
      <div style={{ height: 36, display: "flex", justifyContent: "center", alignItems: "flex-start", background: "#0a0d0b" }}>
        <div style={{ width: 148, height: 24, borderRadius: "0 0 16px 16px", background: "#000" }} />
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${colors.line}`, background: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "Familjen Grotesk, sans-serif", fontSize: 31, fontWeight: 700, color: colors.ink }}>Fantasy</div>
            <div style={{ padding: "5px 9px", borderRadius: 5, background: "#edf5ef", color: colors.green, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 700 }}>● LIVE</div>
          </div>
          <div style={{ marginTop: 5, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 14, fontWeight: 700, color: colors.muted, textTransform: "uppercase" }}>Propeller MLB projections</div>
          <div style={{ marginTop: 6, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: colors.muted }}>◷ Jul 18</div>
        </div>

        <div style={{ marginTop: 15, display: "flex", justifyContent: "space-between", alignItems: "end" }}>
          <div><div style={{ fontFamily: "Familjen Grotesk, sans-serif", fontSize: 23, fontWeight: 700 }}>Slate rankings</div><div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: colors.muted }}>Select two hitters to compare</div></div>
          <span style={{ color: colors.orange, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, fontWeight: 700 }}>{comparison ? "Clear" : ""}</span>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 12 }}>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: colors.muted, textTransform: "uppercase" }}>Sort</span>
          {(["floor", "projection", "ceiling"] as const).map((key) => (
            <span key={key} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 7, border: `1px solid ${active === key ? colors.orange : colors.line}`, background: active === key ? "#fff0e9" : "white", color: active === key ? colors.orange : colors.muted, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 700 }}>{key === "projection" ? "Projected" : key[0].toUpperCase() + key.slice(1)}</span>
          ))}
        </div>

        {comparison ? (
          <div style={{ marginTop: 15, padding: 15, borderRadius: 10, background: "white", border: `2px solid ${colors.orange}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong style={{ fontFamily: "Familjen Grotesk, sans-serif", fontSize: 21 }}>⇄ Sit / Start</strong><span style={{ color: colors.orange, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 700 }}>+1.4 PTS</span></div>
            {[players[0], players[1]].map((player, index) => (
              <div key={player.name} style={{ marginTop: 12, padding: 13, borderRadius: 8, background: index === 0 ? "#fff0e9" : "#f4f3ef", border: `1px solid ${index === 0 ? colors.orange : colors.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: index === 0 ? colors.orange : colors.muted, fontFamily: "IBM Plex Mono, monospace", fontSize: 11, fontWeight: 700 }}>{index === 0 ? "START" : "SIT"}</span><span style={{ color: colors.muted, fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}>{player.team}</span></div>
                <div style={{ marginTop: 6, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 17, fontWeight: 700 }}>{player.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", marginTop: 10 }}>
                  {[['FLOOR', player.floor], ['PROJ', player.projection], ['CEILING', player.ceiling]].map(([label, value]) => <div key={String(label)}><div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: colors.muted }}>{label}</div><div style={{ marginTop: 3, fontFamily: "IBM Plex Mono, monospace", fontSize: 18, color: label === 'PROJ' ? colors.orange : colors.ink, fontWeight: 700 }}>{Number(value).toFixed(1)}</div></div>)}
                </div>
                <div style={{ marginTop: 8, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: colors.muted }}>{player.inputs} market inputs · {player.games} games</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 14, borderRadius: 10, overflow: "hidden", border: `1px solid ${colors.line}` }}>
            {players.map((player, index) => (
              <div key={player.name} style={{ display: "grid", gridTemplateColumns: "34px 1fr 78px 25px", gap: 9, alignItems: "center", padding: "12px 10px", background: "white", borderTop: index ? `1px solid ${colors.line}` : "none" }}>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: colors.muted, fontWeight: 700 }}>{index + 1}</span>
                <div><div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 14, fontWeight: 700 }}>{player.name}</div><div style={{ marginTop: 2, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: colors.muted }}>{player.team}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ color: colors.orange, fontFamily: "IBM Plex Mono, monospace", fontSize: 18, fontWeight: 700 }}>{player[active].toFixed(1)}</div><div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: colors.muted }}>{active === "projection" ? "projected" : active}</div></div>
                <span style={{ color: colors.orange, fontSize: 22 }}>⊕</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
