"use client";

import React, { useRef, useEffect, useMemo } from "react";
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Vector2,
  Vector3,
  Color,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  NormalBlending,
} from "three";
import { cn } from "@/lib/utils";

export interface RadialLiquidProps {
  width?: string | number;
  height?: string | number;
  speed?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  backgroundColor?: string;
  iterations?: number;
  position?: "top" | "bottom" | "left" | "right" | "center";
  overallOpacity?: number;
  waveSize?: number;
  edgeSoftness?: number;
  scale?: number;
  quality?: "low" | "medium" | "high";
  distortionType?: "plasma" | "satin" | "lava";
  distortionScale?: number;
  chromaShift?: number;
  enableCursorInteraction?: boolean;
  refractionStrength?: number;
  refractionEdgeWidth?: number;
  refractionWaveSpeed?: number;
  refractionWaveFrequency?: number;
  fresnelIntensity?: number;
  edgeHighlight?: number;
  className?: string;
  children?: React.ReactNode;
}

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uBackgroundColor;
  uniform int uIterations;
  uniform vec2 uOffset;
  uniform float uOverallOpacity;
  uniform float uWaveSize;
  uniform float uEdgeSoftness;
  uniform float uScale;
  uniform int uDistortionType;
  uniform float uDistortionScale;
  uniform float uChromaShift;
  uniform vec2 uMouse;
  uniform float uEnableCursor;
  uniform float uRefractionStrength;
  uniform float uRefractionEdgeWidth;
  uniform float uRefractionWaveSpeed;
  uniform float uRefractionWaveFrequency;
  uniform float uFresnelIntensity;
  uniform float uEdgeHighlight;

  #define PI 3.14159265359

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(23.43, 54.12))) * 43758.5453);
  }

  vec3 hash3D(vec3 value) {
    vec3 scaled = value * 34.0 + 1.0;
    return mod(scaled * value, 289.0);
  }

  float simplexNoise(vec2 coord) {
    const vec4 skewConstants = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );

    vec2 skewedCoord = coord + dot(coord, skewConstants.yy);
    vec2 cellOrigin = floor(skewedCoord);
    vec2 offset0 = coord - cellOrigin + dot(cellOrigin, skewConstants.xx);

    vec2 cornerOffset = (offset0.x > offset0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

    vec4 offsets = offset0.xyxy + skewConstants.xxzz;
    offsets.xy -= cornerOffset;

    cellOrigin = mod(cellOrigin, 289.0);

    vec3 gradientIdx = hash3D(
      hash3D(cellOrigin.y + vec3(0.0, cornerOffset.y, 1.0)) +
      cellOrigin.x + vec3(0.0, cornerOffset.x, 1.0)
    );

    vec3 weights = max(
      0.5 - vec3(
        dot(offset0, offset0),
        dot(offsets.xy, offsets.xy),
        dot(offsets.zw, offsets.zw)
      ),
      0.0
    );
    weights = weights * weights;
    weights = weights * weights;

    vec3 gradX = 2.0 * fract(gradientIdx * skewConstants.www) - 1.0;
    vec3 gradY = abs(gradX) - 0.5;
    vec3 roundedX = floor(gradX + 0.5);
    vec3 finalGradX = gradX - roundedX;

    weights *= 1.79284291400159 - 0.85373472095314 * (finalGradX * finalGradX + gradY * gradY);

    vec3 gradients;
    gradients.x = finalGradX.x * offset0.x + gradY.x * offset0.y;
    gradients.yz = finalGradX.yz * offsets.xz + gradY.yz * offsets.yw;

    return 130.0 * dot(weights, gradients);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float satinLiquid(vec2 coord, float direction, float ringIdx) {
    float n = 0.0;
    vec2 p = coord;
    float ringAngle = hash(vec2(ringIdx, 42.0)) * PI * 2.0;
    float t = iTime * 0.3 * direction;

    float cs = cos(ringAngle);
    float sn = sin(ringAngle);
    p = mat2(cs, -sn, sn, cs) * p;

    float n1 = noise(p * 1.5 + t * 0.2);
    p = p * 0.65 + vec2(n1 * 0.5);
    n += noise(p + t * 0.15) * 2.0;

    float n2 = noise(p * 1.2 + t * 0.15);
    p = p * 0.65 + vec2(n2 * 0.3, -n2 * 0.3);
    n += noise(p + t * 0.1) * 1.5;

    return n;
  }

  float plasma(vec2 coord, float direction, float ringIdx) {
    float ringAngle = hash(vec2(ringIdx, 123.0)) * PI * 2.0;
    float cs = cos(ringAngle);
    float sn = sin(ringAngle);
    coord = mat2(cs, -sn, sn, cs) * coord;

    float t = iTime * 0.3 * direction;
    vec2 scaledUV = coord * 0.5;

    float s1 = simplexNoise(scaledUV + t * 0.2);
    float s2 = simplexNoise(scaledUV * 1.5 + t * 0.15 + s1 * 0.15);

    float result = s1 + s2 * 0.7;
    return result * 1.4;
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 coord = 12.0 * (fragCoord.xy - iResolution.xy * 0.5) / min(iResolution.x, iResolution.y);
    coord = coord / uScale - uOffset * 6.0;

    float coordLen = length(coord);
    vec2 radialDir = coord / max(coordLen, 0.001);

    float adjustedFreq = 1.5 / max(0.1, uScale);
    float ringPhase = coordLen * adjustedFreq + PI;
    float circle = sin(ringPhase);

    float ringIdx = floor((ringPhase - PI) / PI);

    vec2 refractionOffset = vec2(0.0);
    float edgeGlow = 0.0;

    if (uRefractionStrength > 0.001) {
      float phaseInRing = mod(ringPhase, PI);

      float innerEdgeDist = phaseInRing / PI;
      float outerEdgeDist = 1.0 - innerEdgeDist;

      float edgeWidth = uRefractionEdgeWidth;

      if (innerEdgeDist < edgeWidth) {
        float t = 1.0 - innerEdgeDist / edgeWidth;
        float curve = t * t * t;
        float waveOffset = sin(coordLen * uRefractionWaveFrequency + iTime * uRefractionWaveSpeed) * 0.3;
        refractionOffset = -radialDir * curve * uRefractionStrength * 0.15 * (1.0 + waveOffset);
        edgeGlow = max(edgeGlow, curve);
      }

      if (outerEdgeDist < edgeWidth) {
        float t = 1.0 - outerEdgeDist / edgeWidth;
        float curve = t * t * t;
        float waveOffset = sin(coordLen * uRefractionWaveFrequency + iTime * uRefractionWaveSpeed + PI) * 0.3;
        refractionOffset = radialDir * curve * uRefractionStrength * 0.15 * (1.0 + waveOffset);
        edgeGlow = max(edgeGlow, curve);
      }
    }

    vec2 refractedCoord = coord + refractionOffset;
    float refractedLen = length(refractedCoord);

    float aaWidth = fwidth(ringPhase) * 0.5;
    float edgeRange = 0.1 + uEdgeSoftness * 0.3 + aaWidth;
    float edgeMin = 0.1 - aaWidth;
    float edgeMax = 0.1 + edgeRange;
    float circleMask = 1.0 - smoothstep(edgeMin, edgeMax, circle);
    float circleMask2 = smoothstep(edgeMin, edgeMax, circle);

    float maxPhase = (float(uIterations) + 1.0) * PI;
    float maxRadius = (maxPhase - PI) / adjustedFreq;
    float radiusAA = fwidth(coordLen) * 0.5;
    float distanceMask = 1.0 - smoothstep(maxRadius - 0.2 - radiusAA, maxRadius + radiusAA, coordLen);

    vec2 scaledCoord = refractedCoord * uDistortionScale;
    vec2 cursorOffset = vec2(0.0);
    if (uEnableCursor > 0.5) {
      cursorOffset = (uMouse - 0.5) * 2.0;
    }

    float dist1, dist2;

    if (uDistortionType == 0) {
      dist1 = satinLiquid(scaledCoord + cursorOffset, -1.0, ringIdx);
      dist2 = satinLiquid(scaledCoord + cursorOffset, 1.0, ringIdx);
    } else {
      dist1 = plasma(scaledCoord + cursorOffset, -1.0, ringIdx);
      dist2 = plasma(scaledCoord + cursorOffset, 1.0, ringIdx);
    }

    float fx = (dist1 * circleMask + dist2 * circleMask2) * uWaveSize;

    float fxX = dFdx(fx);
    float fxY = dFdy(fx);
    vec3 N = normalize(vec3(-fxX * 8.0, -fxY * 8.0, 0.3));
    vec3 L = normalize(vec3(0.4, 0.7, 1.0));
    vec3 V = normalize(vec3(0.6, 0.4, 1.0));
    vec3 H = normalize(L + V);

    float hn = max(dot(H, N), 0.0);
    float sheen = pow(hn, 12.0) * 0.6;
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5) * 0.3;
    float lighting = sheen + fresnel;

    float colorMix1 = sin(fx * 0.5 + refractedLen * 0.3) * 0.5 + 0.5;
    float colorMix2 = cos(fx * 0.3 - refractedLen * 0.2 + iTime * 0.2) * 0.5 + 0.5;

    vec3 color = mix(uColor1, uColor2, colorMix1);
    color = mix(color, uColor3, colorMix2 * 0.6);

    color = mix(color, vec3(1.0), lighting * 0.4);

    if (uChromaShift > 0.01) {
      float chromaOffset = uChromaShift * 0.3;
      float mixR = sin((fx + chromaOffset) * 0.5 + refractedLen * 0.3) * 0.5 + 0.5;
      float mixB = cos((fx - chromaOffset) * 0.3 - refractedLen * 0.2) * 0.5 + 0.5;

      color.r = mix(color.r, mix(uColor1.r, uColor2.r, mixR), uChromaShift * 0.5);
      color.b = mix(color.b, mix(uColor2.b, uColor3.b, mixB), uChromaShift * 0.5);
    }

    if (uFresnelIntensity > 0.001) {
      float fresnelGlow = edgeGlow * uFresnelIntensity;
      vec3 glowColor = mix(uColor1, uColor2, 0.5);
      color += glowColor * fresnelGlow * 0.5;
    }

    if (uEdgeHighlight > 0.001) {
      color += vec3(1.0) * edgeGlow * uEdgeHighlight;
    }

    float alpha = uOverallOpacity * distanceMask;

    fragColor = vec4(color, alpha);
  }

  void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
  }
`;

export const RadialLiquid: React.FC<RadialLiquidProps> = ({
  width = "100%",
  height = "100%",
  speed = 0.7,
  color1 = "#ffffff",
  color2 = "#000000",
  color3 = "#000000",
  backgroundColor = "transparent",
  iterations = 4,
  position = "bottom",
  overallOpacity = 1.0,
  waveSize = 5.0,
  edgeSoftness = 0.0,
  scale = 1.1,
  quality = "high",
  distortionType = "plasma",
  distortionScale = 0.2,
  chromaShift = 0.0,
  enableCursorInteraction = true,
  refractionStrength = 25.0,
  refractionEdgeWidth = 0.5,
  refractionWaveSpeed = 1.5,
  refractionWaveFrequency = 10.0,
  fresnelIntensity = 0.5,
  edgeHighlight = 0.5,
  className,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const propsRef = useRef({
    speed,
    color1,
    color2,
    color3,
    backgroundColor,
    iterations,
    position,
    overallOpacity,
    waveSize,
    edgeSoftness,
    scale,
    quality,
    distortionType,
    distortionScale,
    chromaShift,
    enableCursorInteraction,
    refractionStrength,
    refractionEdgeWidth,
    refractionWaveSpeed,
    refractionWaveFrequency,
    fresnelIntensity,
    edgeHighlight,
  });

  useEffect(() => {
    propsRef.current = {
      speed,
      color1,
      color2,
      color3,
      backgroundColor,
      iterations,
      position,
      overallOpacity,
      waveSize,
      edgeSoftness,
      scale,
      quality,
      distortionType,
      distortionScale,
      chromaShift,
      enableCursorInteraction,
      refractionStrength,
      refractionEdgeWidth,
      refractionWaveSpeed,
      refractionWaveFrequency,
      fresnelIntensity,
      edgeHighlight,
    };
  }, [
    speed,
    color1,
    color2,
    color3,
    backgroundColor,
    iterations,
    position,
    overallOpacity,
    waveSize,
    edgeSoftness,
    scale,
    quality,
    distortionType,
    distortionScale,
    chromaShift,
    enableCursorInteraction,
    refractionStrength,
    refractionEdgeWidth,
    refractionWaveSpeed,
    refractionWaveFrequency,
    fresnelIntensity,
    edgeHighlight,
  ]);

  useEffect(() => {
    let animId: number;
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!propsRef.current.enableCursorInteraction) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0.5;
      mouseRef.current.targetY = 0.5;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0, 0);
    } catch (err) {
      console.warn("[RadialLiquid] WebGL initialization skipped or failed:", err);
      return;
    }

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      uColor1: { value: new Color(color1) },
      uColor2: { value: new Color(color2) },
      uColor3: { value: new Color(color3) },
      uBackgroundColor: { value: new Color(backgroundColor === "transparent" ? "#000000" : backgroundColor) },
      uIterations: { value: iterations },
      uOffset: { value: new Vector2(0, 0) },
      uOverallOpacity: { value: overallOpacity },
      uWaveSize: { value: waveSize },
      uEdgeSoftness: { value: edgeSoftness },
      uScale: { value: scale },
      uDistortionType: { value: distortionType === "plasma" ? 1 : 0 },
      uDistortionScale: { value: distortionScale },
      uChromaShift: { value: chromaShift },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uEnableCursor: { value: enableCursorInteraction ? 1.0 : 0.0 },
      uRefractionStrength: { value: refractionStrength },
      uRefractionEdgeWidth: { value: refractionEdgeWidth },
      uRefractionWaveSpeed: { value: refractionWaveSpeed },
      uRefractionWaveFrequency: { value: refractionWaveFrequency },
      uFresnelIntensity: { value: fresnelIntensity },
      uEdgeHighlight: { value: edgeHighlight },
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: NormalBlending,
      depthWrite: false,
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      if (!container || !canvas) return;
      const { width: w, height: h } = container.getBoundingClientRect();
      if (w === 0 || h === 0) return;

      const { quality: q, position: pos } = propsRef.current;
      let qualityMultiplier = 1.0;
      if (q === "low") qualityMultiplier = 0.5;
      else if (q === "medium") qualityMultiplier = 0.75;

      const dpr = Math.min(window.devicePixelRatio * qualityMultiplier, 2);
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(dpr);
      uniforms.iResolution.value.set(w * dpr, h * dpr, 1);

      let offsetX = 0;
      let offsetY = 0;
      if (pos === "top") offsetY = Math.max(1, h / w);
      else if (pos === "bottom") offsetY = -Math.max(1, h / w);
      else if (pos === "left") offsetX = -Math.max(1, w / h);
      else if (pos === "right") offsetX = Math.max(1, w / h);

      uniforms.uOffset.value.set(offsetX, offsetY);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    const startTime = performance.now();
    let lastTime = startTime;

    const renderLoop = (time: number) => {
      if (time - lastTime < 16) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }
      lastTime = time;

      const p = propsRef.current;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      uniforms.iTime.value = (time - startTime) * 0.001 * p.speed;
      uniforms.uColor1.value.set(p.color1);
      uniforms.uColor2.value.set(p.color2);
      uniforms.uColor3.value.set(p.color3);
      uniforms.uBackgroundColor.value.set(p.backgroundColor === "transparent" ? "#000000" : p.backgroundColor);
      uniforms.uIterations.value = p.iterations;
      uniforms.uOverallOpacity.value = p.overallOpacity;
      uniforms.uWaveSize.value = p.waveSize;
      uniforms.uEdgeSoftness.value = p.edgeSoftness;
      uniforms.uScale.value = p.scale;
      uniforms.uDistortionType.value = p.distortionType === "lava" ? 0 : 1;
      uniforms.uDistortionScale.value = p.distortionScale;
      uniforms.uChromaShift.value = p.chromaShift;
      uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      uniforms.uEnableCursor.value = p.enableCursorInteraction ? 1.0 : 0.0;
      uniforms.uRefractionStrength.value = p.refractionStrength;
      uniforms.uRefractionEdgeWidth.value = p.refractionEdgeWidth;
      uniforms.uRefractionWaveSpeed.value = p.refractionWaveSpeed;
      uniforms.uRefractionWaveFrequency.value = p.refractionWaveFrequency;
      uniforms.uFresnelIntensity.value = p.fresnelIntensity;
      uniforms.uEdgeHighlight.value = p.edgeHighlight;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [quality]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {children && (
        <div className="relative z-10 w-full h-full pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default RadialLiquid;
