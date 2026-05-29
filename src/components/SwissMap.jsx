import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { feature } from 'topojson-client';
import { MapContainer, TileLayer, GeoJSON, useMap, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { fastEffectiveRate, formatPct, formatCHF } from '../utils/taxCalculations.js';

const CH_CENTER = [46.82, 8.23];
const CH_INITIAL_ZOOM = 8;
const CH_BOUNDS = [[45.8, 5.9], [47.85, 10.55]];

const STYLE_CANTON = { color: '#1f2937', weight: 1.4, fill: false, opacity: 0.85 };
const STYLE_LAKES  = { fillColor: '#0ea5e9', fillOpacity: 0.15, color: '#0284c7', weight: 0.6 };

// Style for a commune in EFFECTIVE-RATE view mode.
function styleEffective({ rate, colorScale, isSel, inCompare }) {
  const fillColor = rate == null ? '#94a3b8' : colorScale(rate);
  return {
    fillColor, fillOpacity: 0.62,
    color: isSel ? '#facc15' : inCompare ? '#22d3ee' : '#0b0f17',
    weight: isSel ? 2.2 : inCompare ? 1.6 : 0.4,
    opacity: isSel ? 1 : inCompare ? 0.95 : 0.6,
  };
}

// Style for a commune in AT-SOURCE-DELTA view mode.
//  delta = commune.co - cantonAvgCommuneRate     (positive = pays more than source)
//  scale is symmetric (green = below avg, red = above)
function styleSourceDelta({ delta, scale, isSel, inCompare }) {
  const fillColor = delta == null ? '#94a3b8' : scale(delta);
  return {
    fillColor, fillOpacity: 0.62,
    color: isSel ? '#facc15' : inCompare ? '#22d3ee' : '#0b0f17',
    weight: isSel ? 2.2 : inCompare ? 1.6 : 0.4,
    opacity: isSel ? 1 : inCompare ? 0.95 : 0.6,
  };
}

// Inner Leaflet component (needs to be inside MapContainer to use useMap).
function MapBody({
  data, params, viewMode, selectedBfsId, comparedBfsIds,
  setHover, onSelect,
}) {
  const map = useMap();
  const muniLayerRef = useRef(null);

  const { communes, cantons, federal } = data;
  const deductionsData = data.deductions;

  const muniGeoJSON = useMemo(
    () => feature(data.topo, data.topo.objects.municipalities),
    [data.topo],
  );
  const cantonGeoJSON = useMemo(
    () => feature(data.topo, data.topo.objects.cantons),
    [data.topo],
  );
  const lakesGeoJSON = useMemo(
    () => data.topo.objects.lakes ? feature(data.topo, data.topo.objects.lakes) : null,
    [data.topo],
  );

  // Effective rate per commune.
  const rateByBfs = useMemo(() => {
    const out = new Map();
    for (const bfsId of Object.keys(communes)) {
      const c = communes[bfsId];
      const cantonTariff = cantons[c.c];
      if (!cantonTariff) continue;
      const r = fastEffectiveRate({
        ...params, commune: c, cantonTariff, federal, deductionsData,
      });
      if (r != null) out.set(+bfsId, r);
    }
    return out;
  }, [communes, cantons, federal, deductionsData, params]);

  // Auto-calibrated rate color scale (for effective mode).
  const rateScale = useMemo(() => {
    const vals = [...rateByBfs.values()].filter(v => v > 0).sort((a, b) => a - b);
    if (!vals.length) return Object.assign(() => '#333', { lo: 0, hi: 0 });
    const lo = vals[Math.floor(vals.length * 0.02)];
    const hi = vals[Math.floor(vals.length * 0.98)];
    const scale = scaleSequential(t => interpolateRdYlGn(1 - t)).domain([lo, hi]);
    scale.lo = lo; scale.hi = hi;
    return scale;
  }, [rateByBfs]);

  // At-source-delta: per-canton avg commune multiplier; delta per commune.
  const sourceDelta = useMemo(() => {
    const byCanton = {};
    for (const bfsId of Object.keys(communes)) {
      const c = communes[bfsId];
      (byCanton[c.c] ||= []).push(c.co);
    }
    const avgByCanton = {};
    for (const k of Object.keys(byCanton)) {
      const arr = byCanton[k];
      avgByCanton[k] = arr.reduce((s, x) => s + x, 0) / arr.length;
    }
    const out = new Map();
    for (const bfsId of Object.keys(communes)) {
      const c = communes[bfsId];
      out.set(+bfsId, c.co - avgByCanton[c.c]);
    }
    return { avgByCanton, delta: out };
  }, [communes]);

  const deltaScale = useMemo(() => {
    const vals = [...sourceDelta.delta.values()].filter(Number.isFinite).sort((a, b) => a - b);
    if (!vals.length) return Object.assign(() => '#333', { lo: 0, hi: 0 });
    // Symmetric domain around 0
    const lo = vals[Math.floor(vals.length * 0.02)];
    const hi = vals[Math.floor(vals.length * 0.98)];
    const m = Math.max(Math.abs(lo), Math.abs(hi));
    // Green for negative (cheaper than source), red for positive.
    const scale = scaleSequential((t) => interpolateRdYlGn(1 - t)).domain([-m, m]);
    scale.lo = -m; scale.hi = m;
    return scale;
  }, [sourceDelta]);

  const compareSet = useMemo(() => new Set(comparedBfsIds), [comparedBfsIds]);

  // Stable refs for styling + handlers (so listeners attached in onEachFeature
  // always see current state without re-binding).
  const styleStateRef = useRef({});
  styleStateRef.current = {
    rateByBfs, rateScale, sourceDelta, deltaScale,
    selectedBfsId, compareSet, viewMode,
  };
  const handlersRef = useRef({});
  handlersRef.current = { setHover, onSelect, communes, rateByBfs, sourceDelta };

  const styleMuni = useCallback((feature) => {
    const { rateByBfs, rateScale, sourceDelta, deltaScale,
            selectedBfsId, compareSet, viewMode } = styleStateRef.current;
    const bfsId = feature.id;
    const isSel = bfsId === selectedBfsId;
    const inCompare = compareSet.has(bfsId);
    if (viewMode === 'source-delta') {
      return styleSourceDelta({
        delta: sourceDelta.delta.get(bfsId), scale: deltaScale, isSel, inCompare,
      });
    }
    return styleEffective({
      rate: rateByBfs.get(bfsId), colorScale: rateScale, isSel, inCompare,
    });
  }, []);

  // Imperatively restyle when params or selection change.
  useEffect(() => {
    const layer = muniLayerRef.current;
    if (!layer) return;
    const { rateByBfs, rateScale, sourceDelta, deltaScale,
            selectedBfsId, compareSet, viewMode } = styleStateRef.current;
    layer.eachLayer((sub) => {
      const bfsId = sub.feature?.id;
      const isSel = bfsId === selectedBfsId;
      const inCompare = compareSet.has(bfsId);
      sub.setStyle(viewMode === 'source-delta'
        ? styleSourceDelta({ delta: sourceDelta.delta.get(bfsId), scale: deltaScale, isSel, inCompare })
        : styleEffective({ rate: rateByBfs.get(bfsId), colorScale: rateScale, isSel, inCompare }));
    });
  }, [rateByBfs, rateScale, sourceDelta, deltaScale, selectedBfsId, compareSet, viewMode]);

  // Bind events once. `bringToFront` removed — it's not needed in canvas mode
  // and on some Leaflet versions in canvas it noops/breaks the hover.
  const onEachMuni = (f, layer) => {
    layer.on({
      mouseover: () => {
        handlersRef.current.setHover({ bfsId: f.id, kind: 'hover' });
      },
      mouseout: () => {
        handlersRef.current.setHover(null);
      },
      click: () => {
        handlersRef.current.onSelect(f.id);
      },
    });
  };

  // Initial fit.
  useEffect(() => { map.fitBounds(CH_BOUNDS, { padding: [4, 4] }); }, [map]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Pane name="muni" style={{ zIndex: 410 }}>
        <GeoJSON
          ref={muniLayerRef}
          data={muniGeoJSON}
          pane="muni"
          style={styleMuni}
          onEachFeature={onEachMuni}
        />
      </Pane>
      <Pane name="cantons" style={{ zIndex: 415, pointerEvents: 'none' }}>
        <GeoJSON data={cantonGeoJSON} pane="cantons" interactive={false} style={STYLE_CANTON} />
      </Pane>
      {lakesGeoJSON && (
        <Pane name="lakes" style={{ zIndex: 412, pointerEvents: 'none' }}>
          <GeoJSON data={lakesGeoJSON} pane="lakes" interactive={false} style={STYLE_LAKES} />
        </Pane>
      )}
    </>
  );
}

export default function SwissMap({
  data, params, selectedBfsId, onSelect, comparedBfsIds = [],
  viewMode = 'effective', setViewMode,
}) {
  const [hover, setHover] = useState(null);

  // Derived per-commune rates/deltas for tooltip & legend.
  const { rateByBfs, rateLo, rateHi, deltaByBfs, deltaLo, deltaHi, avgByCanton } = useMemo(() => {
    if (!data) return {};
    const rate = new Map();
    for (const bfsId of Object.keys(data.communes)) {
      const c = data.communes[bfsId];
      const cantonTariff = data.cantons[c.c];
      if (!cantonTariff) continue;
      const r = fastEffectiveRate({
        ...params, commune: c, cantonTariff,
        federal: data.federal, deductionsData: data.deductions,
      });
      if (r != null) rate.set(+bfsId, r);
    }
    const vals = [...rate.values()].filter(v => v > 0).sort((a, b) => a - b);
    const rateLo = vals.length ? vals[Math.floor(vals.length * 0.02)] : 0;
    const rateHi = vals.length ? vals[Math.floor(vals.length * 0.98)] : 0;

    // Delta map
    const byCanton = {};
    for (const bfsId of Object.keys(data.communes)) {
      const c = data.communes[bfsId];
      (byCanton[c.c] ||= []).push(c.co);
    }
    const avg = {};
    for (const k of Object.keys(byCanton))
      avg[k] = byCanton[k].reduce((s, x) => s + x, 0) / byCanton[k].length;
    const delta = new Map();
    for (const bfsId of Object.keys(data.communes)) {
      const c = data.communes[bfsId];
      delta.set(+bfsId, c.co - avg[c.c]);
    }
    const dvals = [...delta.values()].sort((a, b) => a - b);
    const lo = dvals[Math.floor(dvals.length * 0.02)] ?? 0;
    const hi = dvals[Math.floor(dvals.length * 0.98)] ?? 0;
    const m = Math.max(Math.abs(lo), Math.abs(hi));
    return {
      rateByBfs: rate, rateLo, rateHi,
      deltaByBfs: delta, deltaLo: -m, deltaHi: m,
      avgByCanton: avg,
    };
  }, [data, params]) || {};

  // Which commune does the tooltip describe?
  //  hover takes precedence; otherwise fall back to selected.
  const tooltipBfs = hover?.bfsId ?? selectedBfsId;
  const tooltipKind = hover ? 'hover' : 'selected';
  const tooltipCommune = tooltipBfs ? data.communes[tooltipBfs] : null;

  const tooltipRate  = tooltipBfs != null ? rateByBfs?.get(tooltipBfs) : null;
  const tooltipDelta = tooltipBfs != null ? deltaByBfs?.get(tooltipBfs) : null;
  const tooltipAvg   = tooltipCommune ? avgByCanton?.[tooltipCommune.c] : null;

  return (
    <div className="map-card">
      <div className="map-header">
        <h3>
          {viewMode === 'source-delta'
            ? 'Commune tax vs at-source average'
            : 'Tax burden by commune'}
        </h3>
        <div className="map-sub">
          {viewMode === 'source-delta'
            ? <>Commune multiplier compared to canton average (used for Quellensteuer / at-source taxation). <span style={{ color: '#86efac' }}>● below avg</span> · <span style={{ color: '#fca5a5' }}>● above avg</span></>
            : <>Effective rate at <strong>{formatCHF(params.income)}</strong>{' '}
               {params.incomeMode === 'taxable' ? 'taxable' : 'gross'} income · <span style={{ color: '#86efac' }}>● low</span>{' '}<span style={{ color: '#fde047' }}>● mid</span>{' '}<span style={{ color: '#fca5a5' }}>● high</span></>}
        </div>
      </div>

      {setViewMode && (
        <div className="map-mode-toggle">
          <button className={`pill ${viewMode === 'effective' ? 'active' : ''}`}
                  onClick={() => setViewMode('effective')}>
            Effective rate
          </button>
          <button className={`pill ${viewMode === 'source-delta' ? 'active' : ''}`}
                  onClick={() => setViewMode('source-delta')}
                  title="Quellensteuer: commune multiplier vs canton average">
            At-source delta
          </button>
        </div>
      )}

      <div className="map-wrap" id="map-wrap">
        <MapContainer
          center={CH_CENTER}
          zoom={CH_INITIAL_ZOOM}
          minZoom={7}
          maxZoom={14}
          maxBounds={[[44.5, 4.5], [49, 12]]}
          maxBoundsViscosity={0.7}
          preferCanvas={true}
          scrollWheelZoom={true}
          className="map-leaflet"
          style={{ width: '100%', borderRadius: 12 }}
          attributionControl={true}
        >
          <MapBody
            data={data} params={params}
            viewMode={viewMode}
            selectedBfsId={selectedBfsId}
            comparedBfsIds={comparedBfsIds}
            setHover={setHover}
            onSelect={onSelect}
          />
        </MapContainer>

        {tooltipCommune && (
          <div className={`map-tooltip pinned ${tooltipKind}`}>
            <div className="tt-title">
              {tooltipCommune.n}
              <span className="canton-chip">{tooltipCommune.c}</span>
              {tooltipKind === 'selected' && <span className="tt-badge">selected</span>}
            </div>
            {viewMode === 'source-delta' ? (
              <>
                <div className="tt-row">
                  <span>Commune mult.</span>
                  <strong>{tooltipCommune.co}%</strong>
                </div>
                <div className="tt-row">
                  <span>Canton avg.</span>
                  <strong>{tooltipAvg != null ? tooltipAvg.toFixed(1) + '%' : '—'}</strong>
                </div>
                <div className="tt-row">
                  <span>Δ vs avg</span>
                  <strong style={{ color: tooltipDelta > 0 ? '#fca5a5' : tooltipDelta < 0 ? '#86efac' : 'inherit' }}>
                    {tooltipDelta != null
                      ? (tooltipDelta > 0 ? '+' : '') + tooltipDelta.toFixed(1) + 'pp'
                      : '—'}
                  </strong>
                </div>
                <div className="tt-hint">
                  Negative = cheaper than at-source · positive = a top-up bill at year-end
                </div>
              </>
            ) : (
              <>
                <div className="tt-row">
                  <span>Effective rate</span>
                  <strong>{tooltipRate != null ? formatPct(tooltipRate, 2) : '—'}</strong>
                </div>
                <div className="tt-row"><span>Canton mult.</span><strong>{tooltipCommune.ca}%</strong></div>
                <div className="tt-row"><span>Commune mult.</span><strong>{tooltipCommune.co}%</strong></div>
              </>
            )}
          </div>
        )}
      </div>

      <Legend
        lo={viewMode === 'source-delta' ? deltaLo : rateLo}
        hi={viewMode === 'source-delta' ? deltaHi : rateHi}
        mode={viewMode}
      />
    </div>
  );
}

function Legend({ lo, hi, mode }) {
  if (lo == null || hi == null) return null;
  const stops = 12;
  const scale = scaleSequential(t => interpolateRdYlGn(1 - t)).domain([lo, hi]);
  const colors = Array.from({ length: stops }, (_, i) =>
    scale(lo + (hi - lo) * (i / (stops - 1))));
  const fmt = (v) => mode === 'source-delta'
    ? (v > 0 ? '+' : '') + v.toFixed(1) + 'pp'
    : formatPct(v, 1);
  return (
    <div className="legend">
      <div className="legend-bar">
        {colors.map((c, i) => <div key={i} style={{ background: c, flex: 1 }} />)}
      </div>
      <div className="legend-labels">
        <span>{fmt(lo)}</span>
        <span>{fmt((lo + hi) / 2)}</span>
        <span>{fmt(hi)}</span>
      </div>
    </div>
  );
}
