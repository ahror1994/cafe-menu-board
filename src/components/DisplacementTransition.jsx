import { useEffect, useRef } from 'react';

/**
 * Minimal displacement warp transition (inspired by gl-transitions/displacement.glsl)
 * Uses a procedural displacement map instead of a texture to avoid extra assets.
 * Falls back gracefully if canvas/WebGL unavailable.
 */
export default function DisplacementTransition({ from, to, progress, duration = 900 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || from == null || to == null) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vert = `
      attribute vec2 position;
      varying vec2 v_uv;
      void main(){ v_uv = position*0.5+0.5; gl_Position = vec4(position,0.0,1.0); }
    `;
    // fragment: смешиваем две картинки через волновой дисплейс
    const frag = `
      precision mediump float;
      uniform sampler2D from;
      uniform sampler2D to;
      uniform float progress;
      uniform float strength;
      varying vec2 v_uv;
      void main(){
        float disp = sin(v_uv.y*12.0 + progress*8.0) * 0.5 + sin(v_uv.x*10.0 - progress*6.0)*0.5;
        disp = disp * 0.5 + 0.5;
        float amount = strength * progress * (1.0 - progress);
        vec2 uvFrom = v_uv + vec2(disp*amount*0.08, 0.0);
        vec2 uvTo = v_uv - vec2(disp*amount*0.08, 0.0);
        vec4 cFrom = texture2D(from, uvFrom);
        vec4 cTo = texture2D(to, uvTo);
        float mix = smoothstep(0.45,0.55, progress + disp*0.06);
        gl_FragColor = mix(cFrom, cTo, mix);
      }
    `;

    function compile(src, type) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    const vs = compile(vert, gl.VERTEX_SHADER), fs = compile(frag, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    function tex(img, unit, uniform) {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (img?.width) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(gl.getUniformLocation(prog, uniform), unit);
      return t;
    }

    const imgFrom = new Image(); imgFrom.crossOrigin = 'anonymous';
    const imgTo = new Image(); imgTo.crossOrigin = 'anonymous';
    let tFrom = null, tTo = null;
    let ready = 0;
    function draw(p) {
      if (!tFrom || !tTo) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(prog, 'progress'), p);
      gl.uniform1f(gl.getUniformLocation(prog, 'strength'), 1.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function maybeDraw() { if (++ready === 2) draw(progress); }

    imgFrom.onload = () => { tFrom = tex(imgFrom, 0, 'from'); maybeDraw(); };
    imgTo.onload = () => { tTo = tex(imgTo, 1, 'to'); maybeDraw(); };
    imgFrom.src = from; imgTo.src = to;

    // animate progress
    let start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      draw(eased * progress + (1 - eased) * progress);
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(rafRef.current); try { gl.deleteProgram(prog); } catch {} };
  }, [from, to, progress, duration]);

  return <canvas ref={canvasRef} width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover" />;
}
