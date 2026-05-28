import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { feature, mesh } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { fastEffectiveRate, formatPct, formatCHF } from '../utils/taxCalculations.js';

const WIDTH = 760;
const HEIGHT = 480;
const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

export default function SwissMap({
  data, params, selectedBfsId, onSelect,
}) {
  const { topo, communes, cantons, federal } = data;

  const { mun, cant, lakes, country, path } = useMemo(() => {
    const mun = feature(topo, topo.objects.municipalities);
    const cant = mesh(topo, topo.objects.cantons, (a, b) => a !== b);
    const lakes = topo.objects.lakes ? feature(topo, topo.objects.lakes) : null;
    const country = mesh(topo, topo.objects.country);
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], mun);
    const path = geoPath(projection);
    return { mun, cant, lakes, country, path };
  }, [topo]);

  const deductionsData = data.deductions;
  const rateByBfs = useMemo(() => {
    const out = new Map();
    for (const bfsId of Object.keys(communes)) {
      const c = communes[bfsId];
      const cantonTariff = cantons[c.c];
      if (!cantonTariff) continue;
      const rate = fastEffectiveRate({
        ...params,
        commune: c, cantonTariff, federal, deductionsData,
      });
      if (rate != null) out.set(+bfsId, rate);
    }
    return out;
  }, [communes, cantons, federal, deductionsData, params]);

  const colorScale = useMemo(() => {
    const vals = [...rateByBfs.values()].filter(v => v > 0).sort((a, b) => a - b);
    if (vals.length === 0) return () => '#333';
    const lo = vals[Math.floor(vals.length * 0.02)];
    const hi = vals[Math.floor(vals.length * 0.98)];
    const scale = scaleSequential(t => interpolateRdYlGn(1 - t)).domain([lo, hi]);
    scale.lo = lo; scale.hi = hi;
    return scale;
  }, [rateByBfs]);

  // -------- zoom / pan --------
  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  // Correct clamping for `<g transform="translate(tx,ty) scale(k)">`.
  //   Point (x,y) in viewBox coords maps to (tx + k*x, ty + k*y) on-screen.
  //   To keep the scaled content (originally [0,WIDTH]×[0,HEIGHT]) covering
  //   the entire viewport, we need:
  //     tx ∈ [WIDTH*(1-k),  0]   (left edge ≤ 0, right edge ≥ WIDTH)
  //     ty ∈ [HEIGHT*(1-k), 0]
  const clampView = (v) => {
    const k = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.k));
    const minTx = WIDTH  * (1 - k);
    const minTy = HEIGHT * (1 - k);
    return {
      k,
      tx: Math.max(minTx, Math.min(0, v.tx)),
      ty: Math.max(minTy, Math.min(0, v.ty)),
    };
  };

  function onWheel(e) {
    if (!svgRef.current) return;
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    // Mouse position in viewBox coords
    const mx = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const my = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    setView((v) => {
      const newK = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.k * factor));
      const actualFactor = newK / v.k;
      // Zoom around mouse position
      const newTx = mx - (mx - v.tx) * actualFactor;
      const newTy = my - (my - v.ty) * actualFactor;
      return clampView({ k: newK, tx: newTx, ty: newTy });
    });
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      origTx: view.tx, origTy: view.ty,
      moved: false,
    };
    svgRef.current?.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    const drag = dragRef.current;
    if (!drag) {
      handleHover(e);
      return;
    }
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      drag.moved = true;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = WIDTH / rect.width;
      const sy = HEIGHT / rect.height;
      const targetTx = drag.origTx + dx * sx;
      const targetTy = drag.origTy + dy * sy;
      setView((v) => clampView({ ...v, tx: targetTx, ty: targetTy }));
      setHover(null);
    }
  }
  function onPointerUp(e) {
    if (!dragRef.current) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current = null;
    svgRef.current?.releasePointerCapture?.(e.pointerId);
    if (wasDrag) {
      // suppress click after drag — handled by setting a flag the path onClick checks
      lastDragRef.current = Date.now();
    }
  }
  const lastDragRef = useRef(0);

  function resetView() { setView({ k: 1, tx: 0, ty: 0 }); }
  function zoomIn()  { setView((v) => clampView({ ...v, k: v.k * 1.5 })); }
  function zoomOut() { setView((v) => clampView({ ...v, k: v.k / 1.5 })); }

  // Attach wheel via native ref to call preventDefault non-passively
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e) => onWheel(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  });

  // -------- tooltip --------
  const [hover, setHover] = useState(null); // { bfsId, x, y }

  function handleHover(e) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHover((h) => h ? { ...h, x, y } : null);
  }

  function onPathEnter(bfsId, e) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({
      bfsId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  const hoverInfo = useMemo(() => {
    if (!hover) return null;
    const c = communes[hover.bfsId];
    if (!c) return null;
    const rate = rateByBfs.get(hover.bfsId) ?? 0;
    return { commune: c, rate, x: hover.x, y: hover.y };
  }, [hover, communes, rateByBfs]);

  // Tooltip placement: offset diagonally from cursor with edge-aware flip
  function tooltipStyle(info) {
    const tooltipW = 220, tooltipH = 130;
    const offsetX = 18, offsetY = 18;
    let left = info.x + offsetX;
    let top  = info.y + offsetY;
    if (left + tooltipW > WIDTH * 1.05) left = info.x - tooltipW - offsetX;
    if (top + tooltipH > HEIGHT) top = info.y - tooltipH - offsetY;
    if (left < 0) left = 0;
    if (top < 0)  top = 0;
    return { left, top };
  }

  // Only paint communes (no canton/lakes — drawn separately) — keep map performant.
  const muniGeometries = mun.features;

  // Larger stroke for selection; thinner everywhere when zoomed in
  const baseStroke = 0.25 / view.k;
  const selStroke  = 1.6 / view.k;
  const cantonStroke = 0.7 / view.k;

  return (
    <div className="map-card">
      <div className="map-header">
        <h3>Tax burden by commune</h3>
        <div className="map-sub">
          Effective rate at <strong>{formatCHF(params.income)}</strong>{' '}
          {params.incomeMode === 'taxable' ? 'taxable' : 'gross'} income
          {' · '}
          <span style={{ color: '#86efac' }}>● low</span>{' '}
          <span style={{ color: '#fde047' }}>● mid</span>{' '}
          <span style={{ color: '#fca5a5' }}>● high</span>
        </div>
      </div>
      <div className="map-wrap">
        <div className="map-zoom-controls">
          <button onClick={zoomIn}  title="Zoom in (scroll up)">+</button>
          <button onClick={zoomOut} title="Zoom out (scroll down)">−</button>
          <button onClick={resetView} title="Reset view">⤾</button>
          <div className="zoom-indicator">{view.k.toFixed(1)}×</div>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%', height: 'auto', display: 'block',
            cursor: dragRef.current ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setHover(null)}
        >
          <g transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}>
            <path d={path(country)} fill="#1c2333" stroke="none" />
            <g>
              {muniGeometries.map((g) => {
                const bfsId = g.id;
                const rate = rateByBfs.get(bfsId);
                const isSel = bfsId === selectedBfsId;
                const fill = rate == null ? '#2a3140' : colorScale(rate);
                return (
                  <path
                    key={bfsId}
                    d={path(g)}
                    fill={fill}
                    stroke={isSel ? '#facc15' : '#0b0f17'}
                    strokeWidth={isSel ? selStroke : baseStroke}
                    onMouseMove={(e) => onPathEnter(bfsId, e)}
                    onClick={() => {
                      // Suppress click that follows a drag.
                      if (Date.now() - lastDragRef.current < 200) return;
                      onSelect(bfsId);
                    }}
                  />
                );
              })}
            </g>
            <path d={path(cant)} fill="none" stroke="#475569"
                  strokeWidth={cantonStroke} pointerEvents="none" />
            {lakes && (
              <path d={path(lakes)} fill="#0b0f17" stroke="#334155"
                    strokeWidth={0.3/view.k} pointerEvents="none" />
            )}
          </g>
        </svg>

        {hoverInfo && (
          <div className="map-tooltip" style={tooltipStyle(hoverInfo)}>
            <div className="tt-title">{hoverInfo.commune.n}</div>
            <div className="tt-sub">{hoverInfo.commune.c}</div>
            <div className="tt-row">
              <span>Effective rate</span>
              <strong>{formatPct(hoverInfo.rate, 1)}</strong>
            </div>
            <div className="tt-row"><span>Canton mult.</span><strong>{hoverInfo.commune.ca}%</strong></div>
            <div className="tt-row"><span>Commune mult.</span><strong>{hoverInfo.commune.co}%</strong></div>
            <div className="tt-hint">Click to select · scroll to zoom · drag to pan</div>
          </div>
        )}
      </div>
      <Legend scale={colorScale} />
    </div>
  );
}

function Legend({ scale }) {
  const lo = scale.lo;
  const hi = scale.hi;
  if (lo == null || hi == null) return null;
  const stops = 12;
  const colors = Array.from({ length: stops }, (_, i) => scale(lo + (hi - lo) * (i / (stops - 1))));
  return (
    <div className="legend">
      <div className="legend-bar">
        {colors.map((c, i) => <div key={i} style={{ background: c, flex: 1 }} />)}
      </div>
      <div className="legend-labels">
        <span>{formatPct(lo, 1)}</span>
        <span>{formatPct((lo + hi) / 2, 1)}</span>
        <span>{formatPct(hi, 1)}</span>
      </div>
    </div>
  );
}
