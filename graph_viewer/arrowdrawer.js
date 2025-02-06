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
   * @param {string} id - The unique identifier for the marker.
   * @param {string} color - The fill color of the marker.
   * @param {number} width - The width of the marker.
   * @param {number} height - The height of the marker.
   * @returns {SVGMarkerElement} The created marker element.
   */
  addMarker(id, color, width = 10, height = 7) {
    // Check if marker already exists
    if (this.svg.querySelector(`#${id}`)) {
      return this.svg.querySelector(`#${id}`);
    }

    const marker = this._createSVGElement('marker', {
      id,
      markerWidth: width,
      markerHeight: height,
      refX: width,
      refY: height / 2,
      orient: 'auto',
      markerUnits: 'strokeWidth',
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
   */
  clear() {
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

    // Add an arrowhead marker (make sure that your SVGCanvas.addMarker
    // creates a marker with refX=0 and reversed polygon so that the tip is at the left).
    this.markerId = 'arrowhead';
    this.svgCanvas.addMarker(this.markerId, this.color);
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
   * The algorithm does the following:
   * 1. Compute all four anchor points on each element (top, bottom, left, right).
   * 2. For every possible pairing, measure the cost based on how closely the connection
   *    matches the ideal (perpendicular) direction of the box edge.
   *    If the distance is small (close neighbours) we add a penalty for left/right anchors,
   *    biasing the selection toward top/bottom.
   * 3. Select the pair with the lowest cost.
   * 4. Compute control points so that the arrow leaves/enters each box perpendicularly,
   *    but with the control point for the target calculated on the outside.
   * 5. Draw a cubic Bézier curve with an arrowhead marker.
   *
   * @param {HTMLElement} fromElem - The starting element.
   * @param {HTMLElement} toElem - The ending element.
   * @param {boolean} [dashed=false] - Whether the arrow should be dashed.
   * @param {boolean} [dotted=false] - Whether the arrow should be dotted.
   * @param {boolean} [debug=false] - If true, draws extra debugging graphics.
   * @returns {SVGPathElement} The created SVG path element.
   */
  drawArrow(fromElem, toElem, dashed = false, dotted = false, debug = false) {
    if (!fromElem || !toElem) {
      throw new Error('Both fromElem and toElem are required');
    }

    // Get the anchors for each element.
    const fromAnchors = this._getAnchors(fromElem);
    const toAnchors = this._getAnchors(toElem);

    // Also compute each element's center (relative to the SVG container).
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

    // Evaluate all 16 (4x4) candidate pairs.
    let bestPair = null;
    let bestCost = Infinity;
    for (const [fromKey, fromAnchor] of Object.entries(fromAnchors)) {
      for (const [toKey, toAnchor] of Object.entries(toAnchors)) {
        // Compute the connection vector from the "from" anchor to the "to" anchor.
        const connection = this._subtract(toAnchor, fromAnchor);
        const distance = Math.hypot(connection.x, connection.y);
        if (distance === 0) continue; // avoid division by zero

        const connectionNorm = this._normalize(connection);
        // For the source, we want the arrow to exit along its ideal.
        const dotFrom = this._dot(connectionNorm, fromAnchor.ideal);
        // For the target, we want the arrow to approach from the opposite direction.
        const dotTo = this._dot({ x: -connectionNorm.x, y: -connectionNorm.y }, toAnchor.ideal);

        // Base cost: lower when the connection is aligned with both ideals.
        let cost = (1 - dotFrom) + (1 - dotTo);

        // Compute average alignment: if both dotFrom and dotTo are close to 1, the connection is nearly straight.
        const averageAlignment = (dotFrom + dotTo) / 2;

        // --- Modulated S‑Shape Penalty ---
        // Calculate the dot product between the source and target ideal vectors.
        const idealDot = this._dot(fromAnchor.ideal, toAnchor.ideal);
        // If the ideals point in opposite directions, idealDot will be negative.
        // Apply a penalty that is scaled by how non-straight the connection is.
        if (idealDot < 0) {
          const penaltyFactor = 1 - averageAlignment;  // near 0 for almost straight lines, near 1 for less straight ones.
          cost += (1 - idealDot) * penaltyFactor;
        }
        // ----------------------------------------

        // If the boxes are close neighbours, penalize left/right anchors so that top/bottom
        // anchors (which produce a U-shaped arrow) are preferred.
        const closeThreshold = 100; // adjust as needed
        if (distance < closeThreshold) {
          if (fromKey === 'left' || fromKey === 'right') cost += 1.0;
          if (toKey === 'left' || toKey === 'right') cost += 1.0;
        }

        if (cost < bestCost) {
          bestCost = cost;
          bestPair = { fromKey, toKey, fromAnchor, toAnchor, distance };
        }
      }
    }


    // Fallback (should not happen): default to top anchors.
    if (!bestPair) {
      bestPair = {
        fromKey: 'top',
        toKey: 'top',
        fromAnchor: fromAnchors.top,
        toAnchor: toAnchors.top,
        distance: Math.hypot(fromCenter.x - toCenter.x, fromCenter.y - toCenter.y)
      };
    }

    // Use the chosen anchors.
    const start = { x: bestPair.fromAnchor.x, y: bestPair.fromAnchor.y };
    const end = { x: bestPair.toAnchor.x, y: bestPair.toAnchor.y };

    // Compute a curvature offset (proportional to the distance, clamped).
    const curvatureOffset = this._clamp(bestPair.distance * 0.3, 30, 100);

    // Compute control points so that the curve leaves/enters the boxes perpendicularly.
    // For the source, we add the ideal vector (placing the control point outside the box).
    const cp1 = this._add(start, this._scale(bestPair.fromAnchor.ideal, curvatureOffset));
    // For the target, we now also add its ideal vector (instead of subtracting)
    // so that the arrow approaches the box from outside.
    const cp2 = this._add(end, this._scale(bestPair.toAnchor.ideal, curvatureOffset));

    // Create the cubic Bézier path data.
    const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

    // Determine stroke dash style if needed.
    let strokeDasharray;
    if (dotted) strokeDasharray = '2,4';
    else if (dashed) strokeDasharray = '8,4';

    // Create the SVG path using SVGCanvas's helper.
    const arrowPath = this.svgCanvas.createPath(pathData, {
      stroke: this.color,
      strokeWidth: this.strokeWidth,
      strokeDasharray,
      markerEnd: `url(#${this.markerId})`
    });

    // (Optional) If debug mode is enabled, draw anchor and control points.
    if (debug) {
      const debugGroup = this.svgCanvas.createGroup({ class: 'debug-group' });
      const debugPoints = [
        { x: start.x, y: start.y, label: `start (${bestPair.fromKey})` },
        { x: end.x, y: end.y, label: `end (${bestPair.toKey})` },
        { x: cp1.x, y: cp1.y, label: 'cp1' },
        { x: cp2.x, y: cp2.y, label: 'cp2' }
      ];
      debugPoints.forEach(pt => {
        const circle = this.svgCanvas._createSVGElement('circle', {
          cx: pt.x,
          cy: pt.y,
          r: 3,
          fill: 'red'
        });
        debugGroup.appendChild(circle);
      });
      // Optionally, draw lines connecting the points.
      const lines = [
        { x1: start.x, y1: start.y, x2: cp1.x, y2: cp1.y },
        { x1: cp1.x, y1: cp1.y, x2: cp2.x, y2: cp2.y },
        { x1: cp2.x, y1: cp2.y, x2: end.x, y2: end.y }
      ];
      lines.forEach(lineData => {
        const line = this.svgCanvas._createSVGElement('line', {
          x1: lineData.x1,
          y1: lineData.y1,
          x2: lineData.x2,
          y2: lineData.y2,
          stroke: 'blue',
          'stroke-width': 1,
          'stroke-dasharray': '4,2'
        });
        debugGroup.appendChild(line);
      });
      this.svgCanvas.svg.appendChild(debugGroup);
    }

    return arrowPath;
  }

  /**
   * Clears all arrows (SVG path elements) from the SVG canvas.
   */
  clearArrows() {
    this.svgCanvas.svg.querySelectorAll('path').forEach(path => path.remove());
  }
}
