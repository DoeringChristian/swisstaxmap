import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { feature } from 'topojson-client';
import { MapContainer, TileLayer, GeoJSON, useMap, Pane } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { fastEffectiveRate, formatPct, formatCHF } from '../utils/taxCalculations.js';

const CH_CENTER = [46.82, 8.23];
const CH_INITIAL_ZOOM = 8;
const CH_BOUNDS = [[45.8, 5.9], [47.85, 10.55]];

const STYLE_CANTON = { color: '#1f2937', weight: 1.4, fill: false, opacity: 0.85 };
const STYLE_LAKES  = { fillColor: '#0ea5e9', fillOpacity: 0.15, color: '#0284c7', weight: 0.6 };

// Style helper that returns the leaflet style options for a commune feature.
function styleFor({ rate, colorScale, isSel, inCompare }) {
  const fillColor = rate == null ? '#94a3b8' : colorScale(rate);
  return {
    fillColor,
    fillOpacity: 0.62,
    color: isSel ? '#facc15' : inCompare ? '#22d3ee' : '#0b0f17',
    weight: isSel ? 2.2 : inCompare ? 1.6 : 0.4,
    opacity: isSel ? 1 : inCompare ? 0.95 : 0.6,
  };
}

// Inner component that has access to the leaflet map instance via useMap.
function MapBody({
  data, params, selectedBfsId, onSelect, comparedBfsIds, onHover,
}) {
  const map = useMap();
  const muniLayerRef = useRef(null);
  const cantonLayerRef = useRef(null);
  const lakesLayerRef = useRef(null);

  const { communes, cantons, federal } = data;
  const deductionsData = data.deductions;

  // GeoJSON conversion (once).
  const muniGeoJSON = useMemo(
    () => feature(data.topo, data.topo.objects.municipalities),
    [data.topo],
  );
  const cantonGeoJSON = useMemo(
    () => feature(data.topo, data.topo.objects.cantons),
    [data.topo],
  );
  const lakesGeoJSON = useMemo(
    () => data.topo.objects.lakes
      ? feature(data.topo, data.topo.objects.lakes)
      : null,
    [data.topo],
  );

  // Compute effective tax rate per commune.
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

  // Color scale auto-calibrated to the 2nd–98th percentile of current rates.
  const colorScale = useMemo(() => {
    const vals = [...rateByBfs.values()].filter(v => v > 0).sort((a, b) => a - b);
    if (vals.length === 0) return Object.assign(() => '#333', { lo: 0, hi: 0 });
    const lo = vals[Math.floor(vals.length * 0.02)];
    const hi = vals[Math.floor(vals.length * 0.98)];
    const scale = scaleSequential(t => interpolateRdYlGn(1 - t)).domain([lo, hi]);
    scale.lo = lo; scale.hi = hi;
    return scale;
  }, [rateByBfs]);

  const compareSet = useMemo(() => new Set(comparedBfsIds), [comparedBfsIds]);

  // Stable refs for current state used by the style function so the function
  // identity stays the same (react-leaflet calls resetStyle on prop change —
  // a fresh closure each render would wipe our colors back to grey).
  const styleStateRef = useRef({ rateByBfs, colorScale, selectedBfsId, compareSet });
  useEffect(() => {
    styleStateRef.current = { rateByBfs, colorScale, selectedBfsId, compareSet };
  });

  // Stable style function used as the initial `style` prop — identity never
  // changes, so react-leaflet never wipes our colors.
  const styleMuni = useCallback((feature) => {
    const { rateByBfs, colorScale, selectedBfsId, compareSet } = styleStateRef.current;
    const bfsId = feature.id;
    return styleFor({
      rate: rateByBfs.get(bfsId),
      colorScale,
      isSel: bfsId === selectedBfsId,
      inCompare: compareSet.has(bfsId),
    });
  }, []);

  // Imperatively restyle commune features when rates/selection/compare change.
  useEffect(() => {
    const layer = muniLayerRef.current;
    if (!layer) return;
    layer.eachLayer((sub) => {
      const bfsId = sub.feature?.id;
      sub.setStyle(styleFor({
        rate: rateByBfs.get(bfsId),
        colorScale,
        isSel: bfsId === selectedBfsId,
        inCompare: compareSet.has(bfsId),
      }));
    });
  }, [rateByBfs, colorScale, selectedBfsId, compareSet]);

  // Stable refs to current callbacks, so feature listeners (bound once) see
  // the latest props without rebinding.
  const handlersRef = useRef({ onSelect, onHover, communes, rateByBfs });
  useEffect(() => {
    handlersRef.current = { onSelect, onHover, communes, rateByBfs };
  });

  // Bind event listeners to each feature on first render.
  const onEachMuni = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const r = handlersRef.current.rateByBfs.get(feature.id) ?? null;
        handlersRef.current.onHover({
          bfsId: feature.id,
          commune: handlersRef.current.communes[feature.id],
          rate: r,
          point: e.containerPoint,
        });
        e.target.bringToFront();
      },
      mousemove: (e) => {
        handlersRef.current.onHover((h) => h && ({ ...h, point: e.containerPoint }));
      },
      mouseout: () => handlersRef.current.onHover(null),
      click: () => handlersRef.current.onSelect(feature.id),
    });
  };

  // Initial fit to Switzerland bounds.
  useEffect(() => {
    map.fitBounds(CH_BOUNDS, { padding: [4, 4] });
  }, [map]);

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
        <GeoJSON
          ref={cantonLayerRef}
          data={cantonGeoJSON}
          pane="cantons"
          interactive={false}
          style={STYLE_CANTON}
        />
      </Pane>
      {lakesGeoJSON && (
        <Pane name="lakes" style={{ zIndex: 412, pointerEvents: 'none' }}>
          <GeoJSON
            ref={lakesLayerRef}
            data={lakesGeoJSON}
            pane="lakes"
            interactive={false}
            style={STYLE_LAKES}
          />
        </Pane>
      )}
    </>
  );
}

export default function SwissMap({
  data, params, selectedBfsId, onSelect, comparedBfsIds = [],
}) {
  const [hover, setHover] = useState(null);

  // colorScale for the legend
  const legend = useMemo(() => {
    if (!data) return null;
    const out = [];
    for (const bfsId of Object.keys(data.communes)) {
      const c = data.communes[bfsId];
      const cantonTariff = data.cantons[c.c];
      if (!cantonTariff) continue;
      const r = fastEffectiveRate({
        ...params,
        commune: c, cantonTariff, federal: data.federal, deductionsData: data.deductions,
      });
      if (r != null) out.push(r);
    }
    out.sort((a, b) => a - b);
    if (!out.length) return null;
    const lo = out[Math.floor(out.length * 0.02)];
    const hi = out[Math.floor(out.length * 0.98)];
    return { lo, hi };
  }, [data, params]);

  function tooltipStyle(h) {
    const offX = 18, offY = 18;
    const W = 220, H = 130;
    const rect = h.containerRect;
    let left = h.point.x + offX;
    let top  = h.point.y + offY;
    if (rect && left + W > rect.width)  left = h.point.x - W - offX;
    if (rect && top + H > rect.height)  top  = h.point.y - H - offY;
    if (left < 0) left = 0;
    if (top  < 0) top  = 0;
    return { left, top };
  }

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
          style={{ height: 520, width: '100%', borderRadius: 12 }}
          attributionControl={true}
        >
          <MapBody
            data={data} params={params}
            selectedBfsId={selectedBfsId}
            onSelect={onSelect}
            comparedBfsIds={comparedBfsIds}
            onHover={(h) => setHover((cur) => {
              if (typeof h === 'function') return h(cur);
              if (!h) return null;
              // attach container rect for tooltip clamping
              const wrap = document.getElementById('map-wrap');
              const r = wrap?.getBoundingClientRect();
              return { ...h, containerRect: r ? { width: r.width, height: r.height } : null };
            })}
          />
        </MapContainer>

        {hover && hover.commune && hover.point && (
          <div className="map-tooltip" style={tooltipStyle(hover)}>
            <div className="tt-title">{hover.commune.n}</div>
            <div className="tt-sub">{hover.commune.c}</div>
            <div className="tt-row">
              <span>Effective rate</span>
              <strong>{hover.rate != null ? formatPct(hover.rate, 1) : '—'}</strong>
            </div>
            <div className="tt-row"><span>Canton mult.</span><strong>{hover.commune.ca}%</strong></div>
            <div className="tt-row"><span>Commune mult.</span><strong>{hover.commune.co}%</strong></div>
            <div className="tt-hint">Click to select</div>
          </div>
        )}
      </div>
      {legend && <Legend lo={legend.lo} hi={legend.hi} />}
    </div>
  );
}

function Legend({ lo, hi }) {
  const stops = 12;
  const scale = scaleSequential(t => interpolateRdYlGn(1 - t)).domain([lo, hi]);
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
