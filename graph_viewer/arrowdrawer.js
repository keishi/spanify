/**
 * Returns a point on a cubic Bezier curve for parameter t (0 <= t <= 1)
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
 * Returns the derivative (tangent vector) of a cubic Bezier curve at parameter t.
 */
function cubicBezierDerivative(P0, P1, P2, P3, t) {
  const u = 1 - t;
  return {
    x: 3 * u * u * (P1.x - P0.x) + 6 * u * t * (P2.x - P1.x) + 3 * t * t * (P3.x - P2.x),
    y: 3 * u * u * (P1.y - P0.y) + 6 * u * t * (P2.y - P1.y) + 3 * t * t * (P3.y - P2.y)
  };
}

/**
 * Approximates the arc length along a cubic Bezier curve between t0 and t1.
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
 * Returns the normalized tangent vector of a cubic Bezier curve at a point that is offset (in pixels)
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
   * @param {string} tag - The SVG tag name.
   * @param {Object} attrs - An object representing SVG attributes.
   * @returns {SVGElement} The created SVG element.
   */
  _createSVGElement(tag, attrs = {}) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [attr, value] of Object.entries(attrs)) {
      elem.setAttribute(attr, value);
    }
    return elem;
  }

  /**
   * Adds a marker to the SVG <defs> section.
   * This method is now unused because we always create new markers.
   * @param {string} id - The unique identifier for the marker.
   * @param {string} color - The fill color of the marker.
   * @param {number} width - The width of the marker.
   * @param {number} height - The height of the marker.
   * @returns {SVGMarkerElement} The created marker element.
   */
  addMarker(id, color, width = 10, height = 7) {
    // Legacy method: now we always create a new marker.
    const marker = this._createSVGElement('marker', {
      id,
      markerWidth: width,
      markerHeight: height,
      refX: width,
      refY: height / 2,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });

    const polygon = this._createSVGElement('polygon', {
      points: `0 0, ${width} ${height / 2}, 0 ${height}`,
      fill: color,
    });

    marker.appendChild(polygon);
    this.defs.appendChild(marker);

    return marker;
  }

  /**
   * Creates and appends an SVG path to the canvas.
   * @param {string} pathData - The SVG path data (d attribute).
   * @param {Object} options - Styling and marker options.
   * @param {string} options.stroke - The stroke color.
   * @param {number} options.strokeWidth - The stroke width.
   * @param {string} [options.strokeDasharray] - The stroke dash array for dashed or dotted lines.
   * @param {string} [options.markerEnd] - The URL of the marker to use at the end.
   * @returns {SVGPathElement} The created path element.
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
   * Useful for grouping related SVG elements.
   * @param {Object} attrs - Attributes for the group.
   * @returns {SVGGElement} The created group element.
   */
  createGroup(attrs = {}) {
    const group = this._createSVGElement('g', attrs);
    this.svg.appendChild(group);
    return group;
  }

  /**
   * Clears all elements from the SVG canvas.
   * This method removes all path elements and clears the defs (including markers).
   */
  clear() {
    // Remove all child elements from the SVG.
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    // Re-initialize <defs>
    this.defs = this._createSVGElement('defs');
    this.svg.appendChild(this.defs);
  }
}


/**
 * ArrowDrawer is responsible for drawing curved arrows between two DOM elements.
 * Each element is assumed to be a box with four anchor points (top, bottom, left, right).
 * The algorithm chooses the pair of anchors that best matches the ideal outgoing/incoming
 * directions (i.e. perpendicular to the box edge), then draws a cubic Bézier curve that
 * leaves each box perpendicularly.
 */
class ArrowDrawer {
  /**
   * Creates an instance of ArrowDrawer.
   * @param {SVGCanvas} svgCanvas - An instance of SVGCanvas for SVG operations.
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

    // We no longer use a fixed marker id; each arrow gets its own marker.
    this.markerCounter = 0;
  }

  /**
   * Returns the four anchor points for a DOM element.
   * Coordinates are computed relative to the SVG container.
   * Each anchor point includes its “ideal” direction vector (the normal of the box edge).
   * @param {HTMLElement} elem - The box element.
   * @returns {Object} A map from anchor names ('top', 'bottom', 'left', 'right') to objects with {x, y, ideal}.
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
   * Draws a curved arrow between two DOM elements.
   *
   * The algorithm:
   * 1. Computes the anchor points for each element.
   * 2. Evaluates candidate anchor pairs using a simplified cost function:
   *    - Base cost based on alignment with each anchor’s ideal.
   *    - A fixed penalty if the chosen anchors are not the same (to encourage same‑side pairs).
   *    - A penalty if the midpoint of the connecting line lies inside the target rect.
   * 3. Chooses the candidate pair with the lowest cost.
   * 4. Computes control points by offsetting along the anchor’s ideal.
   * 5. Creates a cubic Bézier path and attaches a new unique marker.
   * 6. Computes the tangent 10 pixels before the end of the curve to set the marker’s orientation.
   *
   * @param {HTMLElement} fromElem - The starting element.
   * @param {HTMLElement} toElem - The ending element.
   * @param {boolean} [dashed=false] - Whether the arrow should be dashed.
   * @param {boolean} [dotted=false] - Whether the arrow should be dotted.
   * @param {boolean} [debug=false] - If true, logs extra debugging information.
   * @returns {SVGPathElement} The created SVG path element.
   */
  drawArrow(fromElem, toElem, dashed = false, dotted = false, debug = false) {
    if (!fromElem || !toElem) {
      throw new Error('Both fromElem and toElem are required');
    }

    // Get anchor points from each element.
    const fromAnchors = this._getAnchors(fromElem);
    const toAnchors = this._getAnchors(toElem);

    // Debug: log anchor points.
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

    // Get bounding rectangles and centers (in SVG container coordinates).
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

    // Prepare target rect in SVG coordinates.
    const targetRect = {
      left: toRect.left - containerRect.left,
      top: toRect.top - containerRect.top,
      right: toRect.right - containerRect.left,
      bottom: toRect.bottom - containerRect.top
    };

    // Simplified candidate evaluation.
    let bestPair = null;
    let bestCost = Infinity;

    // Fixed penalties.
    const mismatchPenaltyFixed = 1.5; // Penalty if the chosen anchors are not the same.
    const rectPenaltyFixed = 5.0;     // Penalty if the candidate line passes through the target.
    const veryCloseDistance = 50;     // (Optional) Extra penalty for mismatched anchors when very close.

    for (const [fromKey, fromAnchor] of Object.entries(fromAnchors)) {
      for (const [toKey, toAnchor] of Object.entries(toAnchors)) {
        // Compute connection vector from source anchor to target anchor.
        const connection = this._subtract(toAnchor, fromAnchor);
        const distance = Math.hypot(connection.x, connection.y);
        if (distance === 0) continue; // skip degenerate cases

        const connectionNorm = this._normalize(connection);

        // Compute alignment: higher is better.
        const alignmentFrom = this._dot(connectionNorm, fromAnchor.ideal);
        const alignmentTo = this._dot({ x: -connectionNorm.x, y: -connectionNorm.y }, toAnchor.ideal);

        // Base cost.
        const baseCost = (1 - alignmentFrom) + (1 - alignmentTo);

        // Penalty if the anchors are not the same.
        let mismatchPenalty = (fromKey !== toKey) ? mismatchPenaltyFixed : 0;
        if (distance < veryCloseDistance && fromKey !== toKey) {
          mismatchPenalty += 2.0;
        }

        // Compute the midpoint of the candidate segment.
        const midX = (fromAnchor.x + toAnchor.x) / 2;
        const midY = (fromAnchor.y + toAnchor.y) / 2;
        let rectPenalty = 0;
        const margin = 2;
        if (midX > targetRect.left + margin &&
          midX < targetRect.right - margin &&
          midY > targetRect.top + margin &&
          midY < targetRect.bottom - margin) {
          rectPenalty = rectPenaltyFixed;
        }

        const totalCost = baseCost + mismatchPenalty + rectPenalty;

        if (totalCost < bestCost) {
          bestCost = totalCost;
          bestPair = {
            fromKey, toKey,
            fromAnchor, toAnchor,
            distance, baseCost, mismatchPenalty, rectPenalty,
            totalCost
          };
        }
      }
    }

    // Debug output: chosen candidate.
    if (debug && bestPair) {
      console.log(
        'Chosen Anchor Pair:',
        `from: ${bestPair.fromKey}, to: ${bestPair.toKey}`,
        '\nDistance:', bestPair.distance.toFixed(2),
        '\nCost Breakdown:',
        `Base: ${bestPair.baseCost.toFixed(2)}`,
        `Mismatch: ${bestPair.mismatchPenalty.toFixed(2)}`,
        `RectIntersect: ${bestPair.rectPenalty.toFixed(2)}`,
        `=> Total: ${bestPair.totalCost.toFixed(2)}`
      );
    }

    // Use the chosen anchors.
    const start = { x: bestPair.fromAnchor.x, y: bestPair.fromAnchor.y };
    const end = { x: bestPair.toAnchor.x, y: bestPair.toAnchor.y };

    // Compute control points by offsetting along the ideal vectors.
    const curvatureOffset = this._clamp(bestPair.distance * 0.3, 30, 100);
    const cp1 = this._add(start, this._scale(bestPair.fromAnchor.ideal, curvatureOffset));
    const cp2 = this._add(end, this._scale(bestPair.toAnchor.ideal, curvatureOffset));

    // Build the cubic Bézier path.
    const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

    // Determine stroke dash style.
    let strokeDasharray;
    if (dotted) strokeDasharray = '2,4';
    else if (dashed) strokeDasharray = '8,4';

    // Create a new marker for this arrow.
    const markerId = 'arrowhead-' + (++this.markerCounter);
    const marker = this._createNewMarker(markerId, this.color);
    // The marker-end attribute will reference this unique marker.
    const markerUrl = `url(#${markerId})`;

    // Create the arrow path.
    const arrowPath = this.svgCanvas.createPath(pathData, {
      stroke: this.color,
      strokeWidth: this.strokeWidth,
      strokeDasharray,
      markerEnd: markerUrl
    });

    // Compute the tangent vector 10 pixels before the end.
    const tangent = tangentAtOffsetFromEnd(start, cp1, cp2, end, 10);
    const angleDeg = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI;
    // Update the marker's orient attribute.
    marker.setAttribute("orient", angleDeg);

    return arrowPath;
  }

  /**
   * Creates a new marker element with the given id and color.
   * Always creates a new marker (does not reuse existing ones).
   * @param {string} id - Unique marker id.
   * @param {string} color - Fill color for the marker.
   * @param {number} width - Marker width.
   * @param {number} height - Marker height.
   * @returns {SVGMarkerElement} The created marker element.
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
    // Remove all path elements.
    this.svgCanvas.svg.querySelectorAll('path').forEach(path => path.remove());
    // Clear markers by clearing the defs element.
    while (this.svgCanvas.defs.firstChild) {
      this.svgCanvas.defs.removeChild(this.svgCanvas.defs.firstChild);
    }
  }
}