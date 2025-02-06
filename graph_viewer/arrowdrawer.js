/**
 * Returns a point on a cubic Bézier curve for parameter t (0 <= t <= 1)
 */
function cubicBezierPoint(P0, P1, P2, P3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * P0.x + 3 * uu * t * P1.x + 3 * u * tt * P2.x + ttt * P3.x,
    y: uuu * P0.y + 3 * uu * t * P1.y + 3 * u * tt * P2.y + ttt * P3.y
  };
}

/**
 * Returns the derivative (tangent vector) of a cubic Bézier curve at parameter t.
 */
function cubicBezierDerivative(P0, P1, P2, P3, t) {
  const u = 1 - t;
  return {
    x: 3 * u * u * (P1.x - P0.x) + 6 * u * t * (P2.x - P1.x) + 3 * t * t * (P3.x - P2.x),
    y: 3 * u * u * (P1.y - P0.y) + 6 * u * t * (P2.y - P1.y) + 3 * t * t * (P3.y - P2.y)
  };
}

/**
 * Approximates the arc length along a cubic Bézier curve between t0 and t1.
 */
function bezierArcLength(P0, P1, P2, P3, t0, t1, steps = 50) {
  let length = 0;
  let prevPoint = cubicBezierPoint(P0, P1, P2, P3, t0);
  for (let i = 1; i <= steps; i++) {
    const t = t0 + (t1 - t0) * (i / steps);
    const point = cubicBezierPoint(P0, P1, P2, P3, t);
    length += Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
    prevPoint = point;
  }
  return length;
}

/**
 * Uses binary search to find the parameter t0 such that the arc length from t0 to 1 is targetLength.
 */
function findParameterForArcLength(P0, P1, P2, P3, targetLength) {
  let low = 0, high = 1, tMid;
  const tolerance = 0.1; // in pixels
  while (high - low > 0.0001) {
    tMid = (low + high) / 2;
    const length = bezierArcLength(P0, P1, P2, P3, tMid, 1);
    if (Math.abs(length - targetLength) < tolerance) {
      return tMid;
    }
    if (length > targetLength) {
      low = tMid;
    } else {
      high = tMid;
    }
  }
  return tMid;
}

/**
 * Returns the normalized tangent vector of a cubic Bézier curve at a point that is offset (in pixels)
 * from the end of the curve.
 */
function tangentAtOffsetFromEnd(P0, P1, P2, P3, offset = 10) {
  const t0 = findParameterForArcLength(P0, P1, P2, P3, offset);
  const d = cubicBezierDerivative(P0, P1, P2, P3, t0);
  const len = Math.hypot(d.x, d.y);
  return len === 0 ? { x: 0, y: 0 } : { x: d.x / len, y: d.y / len };
}


/**
 * SVGCanvas is responsible for initializing and managing the SVG container.
 * It provides utility methods to create and manipulate SVG elements.
 */
class SVGCanvas {
  /**
   * Creates an instance of SVGCanvas.
   * @param {HTMLElement} container - The DOM element to contain the SVG.
   */
  constructor(container) {
    if (!container) {
      throw new Error('Container element is required to initialize SVGCanvas.');
    }
    console.assert(container instanceof SVGElement, 'Container element must be an SVG element.');
    this.svg = container;
    // Initialize <defs> section
    this.defs = this._createSVGElement('defs');
    this.svg.appendChild(this.defs);
  }

  /**
   * Creates an SVG element with the given tag and attributes.
   */
  _createSVGElement(tag, attrs = {}) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [attr, value] of Object.entries(attrs)) {
      elem.setAttribute(attr, value);
    }
    return elem;
  }

  /**
   * Creates and appends an SVG path to the canvas.
   */
  createPath(pathData, options = {}) {
    const path = this._createSVGElement('path', {
      d: pathData,
      fill: 'none',
      stroke: options.stroke || 'black',
      'stroke-width': options.strokeWidth || 2,
    });
    if (options.strokeDasharray) {
      path.setAttribute('stroke-dasharray', options.strokeDasharray);
    }
    if (options.markerEnd) {
      path.setAttribute('marker-end', options.markerEnd);
    }
    this.svg.appendChild(path);
    return path;
  }

  /**
   * Creates and appends an SVG group (<g>) to the canvas.
   */
  createGroup(attrs = {}) {
    const group = this._createSVGElement('g', attrs);
    this.svg.appendChild(group);
    return group;
  }

  /**
   * Clears all elements from the SVG canvas.
   * Removes all paths and clears the defs (including markers).
   */
  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.defs = this._createSVGElement('defs');
    this.svg.appendChild(this.defs);
  }
}


/**
 * ArrowDrawer draws curved arrows between two DOM elements.
 *
 * The approach is as follows:
 * 1. For each candidate pair of anchor points, consider a C‑style path whose control points are computed as follows:
 *    - They are offset along the anchor’s ideal.
 *    - They are also shifted by a fixed amount along the chord’s normal so that the curve is consistently a C curve.
 * 2. The candidate is penalized if:
 *    - The candidate path covers the target rectangle (its midpoint lies inside the target rect).
 *    - The distance between anchors is too short (so that most of the arrow would be obscured by the marker).
 *    - The anchor points themselves lie outside the SVG canvas bounds.
 * 3. The candidate with the lowest cost is chosen.
 * 4. After the best candidate is chosen, the curvature is reduced if necessary so that the control points remain within the SVG canvas bounds.
 * 5. A cubic Bézier path is drawn for the arrow, and a unique marker is attached whose orientation is set using the tangent 10 pixels before the end.
 */
class ArrowDrawer {
  /**
   * Creates an instance of ArrowDrawer.
   * @param {SVGCanvas} svgCanvas - An instance of SVGCanvas.
   * @param {Object} options - Configuration options.
   * @param {string} options.color - Stroke color for the arrow.
   * @param {number} options.strokeWidth - Stroke width for the arrow.
   */
  constructor(svgCanvas, options = {}) {
    if (!svgCanvas) {
      throw new Error('SVGCanvas instance is required to initialize ArrowDrawer.');
    }
    if (!(svgCanvas instanceof SVGCanvas)) {
      throw new Error('ArrowDrawer requires an instance of SVGCanvas.');
    }
    this.svgCanvas = svgCanvas;
    this.color = options.color || 'rgba(98, 0, 238, 0.86)';
    this.strokeWidth = options.strokeWidth || 2;
    this.markerCounter = 0;
  }

  /**
   * Returns the four anchor points for a DOM element.
   */
  _getAnchors(elem) {
    const rect = elem.getBoundingClientRect();
    const containerRect = this.svgCanvas.svg.getBoundingClientRect();
    const offsetX = containerRect.left;
    const offsetY = containerRect.top;
    return {
      top: {
        x: (rect.left + rect.right) / 2 - offsetX,
        y: rect.top - offsetY,
        ideal: { x: 0, y: -1 }
      },
      bottom: {
        x: (rect.left + rect.right) / 2 - offsetX,
        y: rect.bottom - offsetY,
        ideal: { x: 0, y: 1 }
      },
      left: {
        x: rect.left - offsetX,
        y: (rect.top + rect.bottom) / 2 - offsetY,
        ideal: { x: -1, y: 0 }
      },
      right: {
        x: rect.right - offsetX,
        y: (rect.top + rect.bottom) / 2 - offsetY,
        ideal: { x: 1, y: 0 }
      }
    };
  }

  // --- Vector helper methods ---
  _dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }
  _normalize(v) {
    const len = Math.hypot(v.x, v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
  }
  _subtract(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }
  _add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }
  _scale(v, factor) {
    return { x: v.x * factor, y: v.y * factor };
  }
  _clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Evaluates a candidate pair for connecting two anchor points.
   * Returns a cost that combines:
   *  - A base cost favoring good alignment.
   *  - A penalty if the candidate path's midpoint covers the target rect.
   *  - A penalty if the distance is too short.
   *  - A penalty if the anchor points are outside the canvas bounds.
   */
  _evaluateCandidate(fromKey, fromAnchor, toKey, toAnchor, targetRect, containerRect) {
    // Compute connection vector and distance.
    const connection = this._subtract(toAnchor, fromAnchor);
    const distance = Math.hypot(connection.x, connection.y);
    // Base cost: higher if the connection does not align well with the anchors.
    const connectionNorm = this._normalize(connection);
    const alignmentFrom = this._dot(connectionNorm, fromAnchor.ideal);
    const alignmentTo = this._dot({ x: -connectionNorm.x, y: -connectionNorm.y }, toAnchor.ideal);
    const baseCost = (1 - alignmentFrom) + (1 - alignmentTo);
    let cost = baseCost;

    // Penalty if the distance is too short. - REMOVED

    // Add distance as a direct cost component.
    cost += distance;

    // Penalty if either anchor point is outside the canvas.
    if (fromAnchor.x < 0 || fromAnchor.y < 0 ||
      fromAnchor.x > containerRect.width || fromAnchor.y > containerRect.height) {
      cost += 10;
    }
    if (toAnchor.x < 0 || toAnchor.y < 0 ||
      toAnchor.x > containerRect.width || toAnchor.y > containerRect.height) {
      cost += 10;
    }
    // Penalty if the candidate path (approximated by the straight line) covers the target rect.
    const midX = (fromAnchor.x + toAnchor.x) / 2;
    const midY = (fromAnchor.y + toAnchor.y) / 2;
    const margin = 2;
    if (midX > targetRect.left + margin &&
      midX < targetRect.right - margin &&
      midY > targetRect.top + margin &&
      midY > targetRect.bottom - margin) {
      cost += 5; // penalty if midpoint is inside target rect
    }
    return { cost, distance };
  }

  /**
   * Draws a curved arrow between two DOM elements.
   */
  drawArrow(fromElem, toElem, dashed = false, dotted = false, debug = false) {
    if (!fromElem || !toElem) {
      throw new Error('Both fromElem and toElem are required');
    }
    // Get anchor points.
    const fromAnchors = this._getAnchors(fromElem);
    const toAnchors = this._getAnchors(toElem);
    if (debug) {
      console.group("Source Anchors:");
      Object.entries(fromAnchors).forEach(([key, a]) =>
        console.log(key, `x: ${a.x.toFixed(2)} y: ${a.y.toFixed(2)}`, "ideal:", a.ideal)
      );
      console.groupEnd();
      console.group("Target Anchors:");
      Object.entries(toAnchors).forEach(([key, a]) =>
        console.log(key, `x: ${a.x.toFixed(2)} y: ${a.y.toFixed(2)}`, "ideal:", a.ideal)
      );
      console.groupEnd();
    }
    // Get bounding rectangles and centers.
    const fromRect = fromElem.getBoundingClientRect();
    const toRect = toElem.getBoundingClientRect();
    const containerRect = this.svgCanvas.svg.getBoundingClientRect();
    const fromCenter = {
      x: (fromRect.left + fromRect.right) / 2 - containerRect.left,
      y: (fromRect.top + fromRect.bottom) / 2 - containerRect.top
    };
    const toCenter = {
      x: (toRect.left + toRect.right) / 2 - containerRect.left,
      y: (toRect.top + toRect.bottom) / 2 - containerRect.top
    };
    // Prepare target rectangle.
    const targetRect = {
      left: toRect.left - containerRect.left,
      top: toRect.top - containerRect.top,
      right: toRect.right - containerRect.left,
      bottom: toRect.bottom - containerRect.top
    };

    // Candidate evaluation: try all combinations.
    let bestPair = null;
    let bestCost = Infinity;
    for (const [fromKey, fromAnchor] of Object.entries(fromAnchors)) {
      for (const [toKey, toAnchor] of Object.entries(toAnchors)) {
        const { cost, distance } = this._evaluateCandidate(fromKey, fromAnchor, toKey, toAnchor, targetRect, containerRect);
        // For our purposes, we can also add a slight penalty if the candidate doesn't match our desired relative arrangement.
        // For example, if the centers indicate vertically adjacent rects (|dx| < |dy|), we prefer left/right anchors.
        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;
        let relPenalty = 0;
        if (Math.abs(dx) < Math.abs(dy)) {
          // Vertically adjacent: prefer left/right.
          if (!(fromKey === 'left' || fromKey === 'right')) relPenalty += 1;
          if (!(toKey === 'left' || toKey === 'right')) relPenalty += 1;
        } else {
          // Horizontally adjacent: prefer top/bottom.
          if (!(fromKey === 'top' || fromKey === 'bottom')) relPenalty += 1;
          if (!(toKey === 'top' || toKey === 'bottom')) relPenalty += 1;
        }
        const totalCost = cost + relPenalty;
        if (totalCost < bestCost) {
          bestCost = totalCost;
          bestPair = { fromKey, toKey, fromAnchor, toAnchor, distance, totalCost };
        }
      }
    }

    if (debug && bestPair) {
      console.log(
        'Chosen Anchor Pair:',
        `from: ${bestPair.fromKey}, to: ${bestPair.toKey}`,
        '\nDistance:', bestPair.distance.toFixed(2),
        '\nTotal Cost:', bestPair.totalCost.toFixed(2)
      );
    }
    if (!bestPair) {
      throw new Error("No valid candidate anchor pair found.");
    }

    // Use the chosen anchors.
    const start = { x: bestPair.fromAnchor.x, y: bestPair.fromAnchor.y };
    const end = { x: bestPair.toAnchor.x, y: bestPair.toAnchor.y };

    // Compute a basic curvature offset (scaled by distance).
    let curvatureOffset = this._clamp(bestPair.distance * 0.3, 30, 100);
    // For a C‑curve, compute the chord from start to end and its normalized perpendicular.
    const chord = this._subtract(end, start);
    const chordNormal = this._normalize({ x: chord.y, y: -chord.x });
    // Also use a fixed fraction of the curvature offset as extra offset.
    const normalOffset = curvatureOffset * 0.3;

    // Compute control points.
    let cp1 = this._add(
      this._add(start, this._scale(bestPair.fromAnchor.ideal, curvatureOffset)),
      this._scale(chordNormal, normalOffset)
    );
    let cp2 = this._add(
      this._add(end, this._scale(bestPair.toAnchor.ideal, curvatureOffset)),
      this._scale(chordNormal, normalOffset)
    );

    // Now adjust the curvature if the control points would lie outside the SVG canvas.
    // We'll reduce the curvature offset gradually until both cp1 and cp2 are within bounds.
    const adjusted = this._adjustControlPointsWithinBounds(start, end, cp1, cp2, curvatureOffset, containerRect, bestPair.fromAnchor, bestPair.toAnchor); // <--- PASS THE ANCHORS
    cp1 = adjusted.cp1;
    cp2 = adjusted.cp2;
    curvatureOffset = adjusted.curvatureOffset;

    // Build the cubic Bézier path.
    const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
    let strokeDasharray;
    if (dotted) strokeDasharray = '2,4';
    else if (dashed) strokeDasharray = '8,4';

    // Create a new marker.
    const markerId = 'arrowhead-' + (++this.markerCounter);
    const marker = this._createNewMarker(markerId, this.color);
    const markerUrl = `url(#${markerId})`;

    // Create the arrow path.
    const arrowPath = this.svgCanvas.createPath(pathData, {
      stroke: this.color,
      strokeWidth: this.strokeWidth,
      strokeDasharray,
      markerEnd: markerUrl
    });

    // Compute the tangent 10 pixels before the end.
    const tangent = tangentAtOffsetFromEnd(start, cp1, cp2, end, 10);
    const angleDeg = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI;
    marker.setAttribute("orient", angleDeg);

    return arrowPath;
  }

  /**
   * Adjusts the control points so that they lie within the SVG canvas bounds.
   * It reduces the curvatureOffset gradually until both cp1 and cp2 are within the container.
   * @param {Object} start - Start point.
   * @param {Object} end - End point.
   * @param {Object} cp1 - Initial control point 1.
   * @param {Object} cp2 - Initial control point 2.
   * @param {number} curvatureOffset - The current curvature offset.
   * @param {DOMRect} containerRect - The SVG container's bounding rectangle.
   * @param {Object} fromAnchor - The from anchor object.  <--- ADDED
   * @param {Object} toAnchor - The to anchor object.    <--- ADDED
   * @returns {Object} { cp1, cp2, curvatureOffset } with adjusted values.
   */
  _adjustControlPointsWithinBounds(start, end, cp1, cp2, curvatureOffset, containerRect, fromAnchor, toAnchor) { // <--- ADDED PARAMS
    const minCurvature = 10;
    // We'll iterate until both cp1 and cp2 are inside [0, width] and [0, height], or until we reach minCurvature.
    while (
      (cp1.x < 0 || cp1.y < 0 || cp1.x > containerRect.width || cp1.y > containerRect.height ||
        cp2.x < 0 || cp2.y < 0 || cp2.x > containerRect.width || cp2.y > containerRect.height) &&
      curvatureOffset > minCurvature
    ) {
      curvatureOffset *= 0.9; // reduce curvature
      const chord = this._subtract(end, start);
      const chordNormal = this._normalize({ x: chord.y, y: -chord.x });
      const normalOffset = curvatureOffset * 0.3;
      // Recompute control points.
      cp1 = this._add(
        this._add(start, this._scale(fromAnchor.ideal, curvatureOffset)), // <--- USE fromAnchor
        this._scale(chordNormal, normalOffset)
      );
      cp2 = this._add(
        this._add(end, this._scale(toAnchor.ideal, curvatureOffset)),   // <--- USE toAnchor
        this._scale(chordNormal, normalOffset)
      );
    }
    return { cp1, cp2, curvatureOffset };
  }

  /**
   * Creates a new marker element with the given id and color.
   * Always creates a new marker (does not reuse existing ones).
   */
  _createNewMarker(id, color, width = 10, height = 7) {
    const marker = this.svgCanvas._createSVGElement('marker', {
      id,
      markerWidth: width,
      markerHeight: height,
      refX: width,
      refY: height / 2,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const polygon = this.svgCanvas._createSVGElement('polygon', {
      points: `0 0, ${width} ${height / 2}, 0 ${height}`,
      fill: color,
    });
    marker.appendChild(polygon);
    this.svgCanvas.defs.appendChild(marker);
    return marker;
  }

  /**
   * Clears all arrows (SVG path elements) and markers from the SVG canvas.
   */
  clearArrows() {
    this.svgCanvas.svg.querySelectorAll('path').forEach(path => path.remove());
    while (this.svgCanvas.defs.firstChild) {
      this.svgCanvas.defs.removeChild(this.svgCanvas.defs.firstChild);
    }
  }
}
