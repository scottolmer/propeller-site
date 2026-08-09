import React from "react";
import {Audio} from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type {Crop, WalkthroughScene} from "./data";
import {DURATION_IN_FRAMES, FPS, scenes} from "./data";
import {Captions} from "./Captions";

export type WalkthroughProps = {
  showCaptions: boolean;
  accentColor: string;
  successColor: string;
};

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};

const lerpCrop = (from: Crop, to: Crop, progress: number): Crop => ({
  x: from.x + (to.x - from.x) * progress,
  y: from.y + (to.y - from.y) * progress,
  width: from.width + (to.width - from.width) * progress,
  height: from.height + (to.height - from.height) * progress,
});

const CropImage: React.FC<{
  asset: string;
  sourceWidth: number;
  sourceHeight: number;
  crop: Crop;
  cropTo?: Crop;
  viewportWidth: number;
  viewportHeight: number;
  durationInFrames: number;
  zoom?: number;
  focusX?: number;
  radius?: number;
}> = ({asset, sourceWidth, sourceHeight, crop, cropTo, viewportWidth, viewportHeight, durationInFrames, zoom = 1.11, focusX = 0.5, radius = 24}) => {
  const frame = useCurrentFrame();
  const zoomStart = Math.min(18, Math.max(8, Math.round(durationInFrames * 0.06)));
  const zoomEnd = Math.min(62, Math.max(zoomStart + 18, Math.round(durationInFrames * 0.2)));
  const progress = interpolate(frame, [zoomStart, zoomEnd], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const active = cropTo ? lerpCrop(crop, cropTo, progress) : crop;
  const pushIn = interpolate(
    frame,
    [0, zoomStart, zoomEnd, durationInFrames],
    [1, 1, zoom, Math.max(1, zoom - 0.012)],
    {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)},
  );
  const scale = Math.max(viewportWidth / active.width, viewportHeight / active.height) * pushIn;
  const left = viewportWidth / 2 - (active.x + active.width * focusX) * scale;
  const top = (viewportHeight - active.height * scale) / 2 - active.y * scale;

  return (
    <div
      style={{
        width: viewportWidth,
        height: viewportHeight,
        overflow: "hidden",
        borderRadius: radius,
        position: "relative",
        background: "#eef1f5",
      }}
    >
      <Img
        src={staticFile(`assets/${asset}`)}
        width={sourceWidth}
        height={sourceHeight}
        style={{
          position: "absolute",
          display: "block",
          width: sourceWidth,
          height: sourceHeight,
          maxWidth: "none",
          maxHeight: "none",
          left,
          top,
          scale,
          transformOrigin: "top left",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 0 1px rgba(17,24,39,0.12)",
          borderRadius: radius,
        }}
      />
    </div>
  );
};

const Browser: React.FC<{
  scene: WalkthroughScene;
  width: number;
  height: number;
  durationInFrames: number;
}> = ({scene, width, height, durationInFrames}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        background: "#121821",
        padding: "54px 12px 12px",
        position: "relative",
        boxShadow: "0 36px 90px rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.18)",
        translate: interpolate(frame, [0, 16], ["30px 0px", "0px 0px"], {
          ...clamp,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <div style={{position: "absolute", top: 18, left: 22, display: "flex", gap: 11}}>
        {["#ff675f", "#f7c84b", "#42ca78"].map((color) => (
          <div key={color} style={{width: 13, height: 13, borderRadius: 99, background: color}} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 13,
          left: 160,
          right: 28,
          height: 28,
          borderRadius: 14,
          background: "#222c39",
          color: "#98a7b8",
          fontFamily: "SFMono-Regular, monospace",
          fontSize: 14,
          padding: "5px 18px",
        }}
      >
        app.propellerpicks.com
      </div>
      <CropImage
        asset={scene.asset!}
        sourceWidth={scene.sourceWidth!}
        sourceHeight={scene.sourceHeight!}
        crop={scene.crop!}
        cropTo={scene.cropTo}
        viewportWidth={width - 24}
        viewportHeight={height - 66}
        durationInFrames={durationInFrames}
        zoom={scene.zoom}
        focusX={scene.focusX}
        radius={18}
      />
    </div>
  );
};

const Device: React.FC<{
  asset: string;
  sourceWidth: number;
  sourceHeight: number;
  crop: Crop;
  cropTo?: Crop;
  zoom?: number;
  durationInFrames: number;
  width: number;
  height: number;
}> = ({asset, sourceWidth, sourceHeight, crop, cropTo, zoom, durationInFrames, width, height}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 58,
        background: "#050609",
        padding: 16,
        border: "4px solid #606b78",
        boxShadow: "0 36px 90px rgba(0,0,0,0.6)",
        translate: interpolate(frame, [0, 16], ["0px 34px", "0px 0px"], {
          ...clamp,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <CropImage
        asset={asset}
        sourceWidth={sourceWidth}
        sourceHeight={sourceHeight}
        crop={crop}
        cropTo={cropTo}
        viewportWidth={width - 32}
        viewportHeight={height - 32}
        durationInFrames={durationInFrames}
        zoom={zoom}
        radius={42}
      />
    </div>
  );
};

const Brand: React.FC<{platform: string; accent: string}> = ({platform, accent}) => (
  <div style={{height: 84, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
    <div style={{display: "flex", alignItems: "center", gap: 18}}>
      <svg width="54" height="54" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r="6" fill={accent} />
        <path d="M27 27V5M27 27L7 40M27 27L47 40" stroke={accent} strokeWidth="8" strokeLinecap="round" />
      </svg>
      <div>
        <div style={{fontFamily: "Avenir Next, sans-serif", fontSize: 28, fontWeight: 800, color: "#f4f7fb"}}>PROPELLER</div>
        <div style={{fontFamily: "SFMono-Regular, monospace", fontSize: 12, letterSpacing: 7, color: accent}}>PICKS</div>
      </div>
    </div>
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 999,
        background: "rgba(18,24,33,0.86)",
        padding: "12px 22px",
        color: "#a8b5c4",
        fontFamily: "SFMono-Regular, monospace",
        fontSize: 16,
        textTransform: "uppercase",
        letterSpacing: 1.5,
      }}
    >
      {platform}
    </div>
  </div>
);

const Callout: React.FC<{scene: WalkthroughScene; accent: string; durationInFrames: number}> = ({scene, accent, durationInFrames}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 26, maxWidth: 540}}>
      <Interactive.Div
        name="Scene callout"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 18,
          opacity: interpolate(frame, [6, 18], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)}),
          translate: interpolate(frame, [6, 18], ["-24px 0px", "0px 0px"], clamp),
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            marginTop: 11,
            flex: "0 0 auto",
            borderRadius: 99,
            background: accent,
            boxShadow: `0 0 ${interpolate(frame, [0, 18, 36], [8, 28, 8], clamp)}px ${accent}`,
          }}
        />
        <div style={{fontFamily: "Avenir Next, sans-serif", fontSize: 34, lineHeight: 1.2, fontWeight: 700, color: "#f4f7fb"}}>
          {scene.callout}
        </div>
      </Interactive.Div>
      {scene.points?.map((point, index) => {
        const start = 20 + index * Math.min(22, Math.max(9, Math.floor(durationInFrames / 9)));
        return (
          <div
            key={point}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: interpolate(frame, [start, start + 12], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)}),
              translate: interpolate(frame, [start, start + 12], ["-18px 0px", "0px 0px"], clamp),
              color: "#a8b5c4",
              fontFamily: "Avenir Next, sans-serif",
              fontSize: 25,
              fontWeight: 600,
            }}
          >
            <div style={{width: 32, height: 2, background: index === 1 ? "#10b981" : accent}} />
            {point}
          </div>
        );
      })}
    </div>
  );
};

const Scene: React.FC<{scene: WalkthroughScene; durationInFrames: number; accentColor: string; successColor: string}> = ({
  scene,
  durationInFrames,
  accentColor,
  successColor,
}) => {
  const frame = useCurrentFrame();
  const accent = scene.accent === "green" ? successColor : accentColor;
  const fade = interpolate(frame, [0, 10], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});

  if (scene.layout === "statement") {
    return (
      <AbsoluteFill style={{background: "#06080d", opacity: fade, padding: "58px 80px 42px"}}>
        <Brand platform={scene.platform} accent={accent} />
        <div style={{display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: 34}}>
          <div style={{fontFamily: "SFMono-Regular, monospace", color: accent, fontSize: 22, letterSpacing: 2}}>{scene.eyebrow.toUpperCase()}</div>
          <Interactive.Div name="Statement title" style={{fontFamily: "Avenir Next, sans-serif", color: "#f4f7fb", fontSize: 92, fontWeight: 800, lineHeight: 1.03, maxWidth: 1450}}>
            {scene.title}
          </Interactive.Div>
          <div style={{fontFamily: "SFMono-Regular, monospace", color: accent, fontSize: 82, marginTop: 20}}>{scene.callout}</div>
          <div style={{display: "flex", gap: 28, marginTop: 16}}>
            {scene.points?.map((point, index) => (
              <div key={point} style={{fontFamily: "Avenir Next, sans-serif", fontSize: 28, color: "#a8b5c4", borderLeft: `3px solid ${index === 1 ? successColor : accent}`, paddingLeft: 18}}>{point}</div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        opacity: fade,
        padding: "44px 70px 112px",
        background:
          "radial-gradient(circle at 82% 8%, rgba(92,31,12,0.42), transparent 38%), linear-gradient(135deg, #05070b 0%, #070a10 58%, #130b09 100%)",
        overflow: "hidden",
      }}
    >
      <div style={{position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "repeating-linear-gradient(135deg, transparent 0 112px, rgba(255,255,255,0.12) 113px, transparent 114px)"}} />
      <div style={{position: "relative", zIndex: 1}}>
        <Brand platform={scene.platform} accent={accent} />
        <div style={{marginTop: 24, fontFamily: "SFMono-Regular, monospace", fontSize: 21, letterSpacing: 2, color: accent, textTransform: "uppercase"}}>{scene.eyebrow}</div>
        <Interactive.Div
          name="Scene title"
          style={{
            marginTop: 14,
            fontFamily: "Avenir Next, sans-serif",
            fontSize: scene.title.length > 48 ? 70 : 82,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: -2.6,
            color: "#f4f7fb",
            maxWidth: 1720,
            opacity: interpolate(frame, [0, 14], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)}),
            translate: interpolate(frame, [0, 14], ["0px 18px", "0px 0px"], clamp),
          }}
        >
          {scene.title}
        </Interactive.Div>
      </div>

      {scene.layout === "desktop" && (
        <div style={{position: "relative", zIndex: 1, flex: 1, display: "grid", gridTemplateColumns: "500px 1fr", alignItems: "center", gap: 45, marginTop: 18}}>
          <Callout scene={scene} accent={accent} durationInFrames={durationInFrames} />
          <Browser scene={scene} width={1255} height={675} durationInFrames={durationInFrames} />
        </div>
      )}

      {scene.layout === "mobile" && (
        <div style={{position: "relative", zIndex: 1, flex: 1, display: "grid", gridTemplateColumns: "1fr 720px", alignItems: "center", gap: 70, marginTop: 12}}>
          <Callout scene={scene} accent={accent} durationInFrames={durationInFrames} />
          <div style={{display: "flex", justifyContent: "center"}}>
            <Device
              asset={scene.asset!}
              sourceWidth={scene.sourceWidth!}
              sourceHeight={scene.sourceHeight!}
              crop={scene.crop!}
              cropTo={scene.cropTo}
              zoom={scene.zoom}
              durationInFrames={durationInFrames}
              width={660}
              height={720}
            />
          </div>
        </div>
      )}

      {scene.layout === "dual" && (
        <div style={{position: "relative", zIndex: 1, flex: 1, display: "grid", gridTemplateColumns: "1fr 520px", alignItems: "center", gap: 42, marginTop: 10}}>
          <div style={{display: "flex", flexDirection: "column", gap: 20}}>
            <Browser scene={scene} width={1280} height={650} durationInFrames={durationInFrames} />
            <div style={{fontFamily: "Avenir Next, sans-serif", fontSize: 28, fontWeight: 700, color: accent, paddingLeft: 12}}>{scene.callout}</div>
          </div>
          <Device
            asset={scene.mobileAsset!}
            sourceWidth={scene.mobileSourceWidth!}
            sourceHeight={scene.mobileSourceHeight!}
            crop={scene.mobileCrop!}
            zoom={scene.mobileZoom}
            durationInFrames={durationInFrames}
            width={500}
            height={720}
          />
        </div>
      )}

      <div style={{position: "absolute", zIndex: 2, left: 0, top: 0, width: interpolate(frame, [0, durationInFrames], [0, 1920], clamp), height: 5, background: accent}} />
    </AbsoluteFill>
  );
};

export const Walkthrough: React.FC<WalkthroughProps> = ({showCaptions, accentColor, successColor}) => {
  return (
    <AbsoluteFill style={{background: "#06080d"}}>
      <Audio src={staticFile("assets/narration.mp3")} />
      {scenes.map((scene, index) => {
        const startFrame = Math.round(scene.start * FPS);
        const endFrame = Math.round(scene.end * FPS);
        const durationInFrames = endFrame - startFrame;
        return (
          <Sequence
            key={`${scene.start}-${scene.title}`}
            name={`${index + 1}. ${scene.eyebrow}`}
            from={startFrame}
            durationInFrames={Math.min(durationInFrames, DURATION_IN_FRAMES - startFrame)}
          >
            <Scene
              scene={scene}
              durationInFrames={durationInFrames}
              accentColor={accentColor}
              successColor={successColor}
            />
          </Sequence>
        );
      })}
      {showCaptions ? <Captions /> : null}
    </AbsoluteFill>
  );
};
