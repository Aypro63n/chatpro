import React, { useEffect, useRef, useMemo } from 'react';
import './GradientASCII.css';

interface GradientASCIIProps {
  colors?: string[];
  shape?: 'horizon' | 'radial' | 'diagonal' | 'spiral';
  characters?: string;
  cellSize?: number;
  density?: number;
  glyphOpacity?: number;
  gradientOpacity?: number;
  glow?: number;
  flicker?: number;
  softness?: number;
  flow?: number;
  speed?: number;
  grain?: number;
  mouseInteraction?: boolean;
  clickEffect?: 'wave' | 'burst' | 'none';
  intro?: boolean;
  className?: string;
}

export const GradientASCII: React.FC<GradientASCIIProps> = ({
  colors = ['#163B70', '#2563EB', '#67E8F9', '#E0F2FE'],
  shape = 'horizon',
  characters = ' .:-=+*#%@',
  cellSize = 16,
  density = 0.65,
  glyphOpacity = 0.7,
  gradientOpacity = 0.55,
  glow = 0.16,
  flicker = 0.08,
  softness = 0.65,
  flow = 0.25,
  speed = 0.3,
  grain = 0.025,
  mouseInteraction = true,
  clickEffect = 'wave',
  intro = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const clicksRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const vertexShaderSource = `#version 300 es
    in vec2 a_position;
    out vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_position * 0.5 + 0.5;
    }
  `;

  const fragmentShaderSource = useMemo(() => `#version 300 es
    precision highp float;

    in vec2 v_texCoord;
    out vec4 fragColor;

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_cellSize;
    uniform float u_density;
    uniform float u_glyphOpacity;
    uniform float u_gradientOpacity;
    uniform float u_glow;
    uniform float u_flicker;
    uniform float u_softness;
    uniform float u_flow;
    uniform float u_speed;
    uniform float u_grain;
    uniform int u_shape;
    uniform int u_clickCount;
    uniform vec3 u_clicks[10];
    uniform vec3 u_colors[4];
    uniform float u_intro;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    vec3 getGradientColor(vec2 uv, vec2 mouse) {
      float t = u_time * u_speed * 0.1;
      vec2 flowUV = uv + vec2(
        noise(uv * 2.0 + t) * u_flow,
        noise(uv * 2.0 - t * 0.7) * u_flow
      );

      float dist = 0.0;
      if (u_shape == 0) { // horizon
        dist = flowUV.y + sin(flowUV.x * 3.14159 + t) * 0.1;
      } else if (u_shape == 1) { // radial
        vec2 center = mix(vec2(0.5), mouse, 0.3);
        dist = length(flowUV - center);
      } else if (u_shape == 2) { // diagonal
        dist = (flowUV.x + flowUV.y) * 0.5;
      } else { // spiral
        vec2 center = vec2(0.5);
        float angle = atan(flowUV.y - center.y, flowUV.x - center.x);
        float radius = length(flowUV - center);
        dist = fract(radius * 3.0 - angle / 6.28318 + t);
      }

      dist = smoothstep(0.0, 1.0, dist);
      vec3 color = mix(
        mix(u_colors[0], u_colors[1], smoothstep(0.0, 0.4, dist)),
        mix(u_colors[2], u_colors[3], smoothstep(0.6, 1.0, dist)),
        smoothstep(0.3, 0.7, dist)
      );

      if (u_clickCount > 0) {
        for (int i = 0; i < 10; i++) {
          if (i >= u_clickCount) break;
          vec2 clickPos = u_clicks[i].xy;
          float clickTime = u_clicks[i].z;
          float elapsed = u_time - clickTime;
          float wave = sin(length(uv - clickPos) * 20.0 - elapsed * 10.0) * 0.5 + 0.5;
          float intensity = exp(-elapsed * 2.0) * wave * 0.3;
          color += u_colors[1] * intensity;
        }
      }

      float mouseDist = length(uv - mouse);
      float mouseGlow = exp(-mouseDist * 3.0) * 0.2;
      color += u_colors[1] * mouseGlow;

      return color;
    }

    void main() {
      vec2 uv = v_texCoord;
      vec2 pixelUV = gl_FragCoord.xy / u_resolution;

      float introFade = u_intro > 0.0 ? smoothstep(0.0, 2.0, u_time * 0.5) : 1.0;

      vec2 cellUV = floor(pixelUV * u_resolution / u_cellSize);
      vec2 cellCenter = (cellUV + 0.5) * u_cellSize / u_resolution;

      vec3 gradientColor = getGradientColor(cellCenter, u_mouse);
      float brightness = (gradientColor.r + gradientColor.g + gradientColor.b) / 3.0;

      float flickerNoise = noise(cellUV * 0.1 + u_time * 2.0) * u_flicker;
      float cellValue = hash(cellUV * 0.01) + brightness + flickerNoise;

      float shouldShow = step(1.0 - u_density, fract(cellValue * 10.0));
      float charIntensity = smoothstep(0.3, 0.7, brightness) * shouldShow;

      vec3 glyphColor = gradientColor * charIntensity * u_glyphOpacity;
      vec3 bgGradient = gradientColor * u_gradientOpacity;

      if (u_glow > 0.0) {
        float glowRadius = u_cellSize * 2.0;
        float glowAmount = 0.0;
        for (float dx = -1.0; dx <= 1.0; dx += 1.0) {
          for (float dy = -1.0; dy <= 1.0; dy += 1.0) {
            vec2 offset = vec2(dx, dy) * u_cellSize / u_resolution;
            vec3 nearColor = getGradientColor(cellCenter + offset, u_mouse);
            float nearBrightness = (nearColor.r + nearColor.g + nearColor.b) / 3.0;
            glowAmount += nearBrightness;
          }
        }
        glowAmount /= 9.0;
        bgGradient += gradientColor * glowAmount * u_glow;
      }

      vec3 finalColor = bgGradient + glyphColor;

      if (u_grain > 0.0) {
        float grainNoise = (hash(pixelUV * 1000.0 + u_time) - 0.5) * u_grain;
        finalColor += vec3(grainNoise);
      }

      finalColor = pow(finalColor, vec3(1.0 / (1.0 + u_softness)));
      finalColor *= introFade;

      fragColor = vec4(finalColor, 1.0);
    }
  `, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL2 not supported');
      return;
    }

    glRef.current = gl;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();

    resizeObserverRef.current = new ResizeObserver(resizeCanvas);
    resizeObserverRef.current.observe(canvas.parentElement!);

    const render = () => {
      if (!gl || !program) return;

      const currentTime = (Date.now() - startTimeRef.current) / 1000;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      clicksRef.current = clicksRef.current.filter(
        (click) => currentTime - click.time < 2.0
      );

      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), currentTime);
      gl.uniform2f(
        gl.getUniformLocation(program, 'u_resolution'),
        canvas.width,
        canvas.height
      );
      gl.uniform2f(
        gl.getUniformLocation(program, 'u_mouse'),
        mouseRef.current.x,
        mouseRef.current.y
      );
      gl.uniform1f(gl.getUniformLocation(program, 'u_cellSize'), cellSize);
      gl.uniform1f(gl.getUniformLocation(program, 'u_density'), density);
      gl.uniform1f(gl.getUniformLocation(program, 'u_glyphOpacity'), glyphOpacity);
      gl.uniform1f(gl.getUniformLocation(program, 'u_gradientOpacity'), gradientOpacity);
      gl.uniform1f(gl.getUniformLocation(program, 'u_glow'), glow);
      gl.uniform1f(gl.getUniformLocation(program, 'u_flicker'), flicker);
      gl.uniform1f(gl.getUniformLocation(program, 'u_softness'), softness);
      gl.uniform1f(gl.getUniformLocation(program, 'u_flow'), flow);
      gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), speed);
      gl.uniform1f(gl.getUniformLocation(program, 'u_grain'), grain);
      gl.uniform1f(gl.getUniformLocation(program, 'u_intro'), intro ? 1.0 : 0.0);

      const shapeMap = { horizon: 0, radial: 1, diagonal: 2, spiral: 3 };
      gl.uniform1i(gl.getUniformLocation(program, 'u_shape'), shapeMap[shape]);

      colors.forEach((color, i) => {
        const rgb = color.match(/\w\w/g)?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];
        gl.uniform3fv(gl.getUniformLocation(program, `u_colors[${i}]`), rgb);
      });

      gl.uniform1i(
        gl.getUniformLocation(program, 'u_clickCount'),
        Math.min(clicksRef.current.length, 10)
      );

      clicksRef.current.slice(0, 10).forEach((click, i) => {
        gl.uniform3fv(
          gl.getUniformLocation(program, `u_clicks[${i}]`),
          [click.x, click.y, click.time]
        );
      });

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    const handleClick = (e: MouseEvent) => {
      if (clickEffect === 'none') return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      clicksRef.current.push({ x, y, time: currentTime });
    };

    if (mouseInteraction) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleClick);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      render();
    } else {
      requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (gl && program) {
        gl.deleteProgram(program);
      }
    };
  }, [
    colors,
    shape,
    cellSize,
    density,
    glyphOpacity,
    gradientOpacity,
    glow,
    flicker,
    softness,
    flow,
    speed,
    grain,
    mouseInteraction,
    clickEffect,
    intro,
    fragmentShaderSource,
  ]);

  return (
    <div className={`gradient-ascii-container ${className}`}>
      <canvas ref={canvasRef} className="gradient-ascii-canvas" />
    </div>
  );
};
