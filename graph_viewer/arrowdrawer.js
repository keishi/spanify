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
 * ArrowDrawer is responsible for rendering arrows between DOM elements using SVG.
 */
class ArrowDrawer {
  /**
   * Creates an instance of ArrowDrawer.
   * @param {SVGCanvas} svgCanvas - An instance of SVGCanvas to handle SVG manipulations.
   * @param {Object} options - Configuration options for the arrows.
   * @param {string} options.color - The color of the arrows.
   * @param {number} options.strokeWidth - The stroke width of the arrows.
   * @param {number} options.maxCurvature - Maximum curvature for regular arrows.
   * @param {number} options.minDistance - Minimum distance to decide between regular and looped arrows.
   * @param {number} options.minLoopCurvature - Minimum curvature for looped arrows.
   * @param {number} options.maxLoopCurvature - Maximum curvature for looped arrows.
   */
  constructor(svgCanvas, options = {}) {
    if (!svgCanvas) {
      throw new Error('SVGCanvas instance is required to initialize ArrowDrawer.');
    }

    this.svgCanvas = svgCanvas;
    this.color = options.color || 'rgba(98, 0, 238, 0.86)';
    this.strokeWidth = options.strokeWidth || 2;
    this.maxCurvature = options.maxCurvature || 100;
    this.minDistance = options.minDistance || 100;
    this.minLoopCurvature = options.minLoopCurvature || 80;
    this.maxLoopCurvature = options.maxLoopCurvature || 160;
    this.k = 0.3; // Curvature factor

    // Add arrowhead marker
    this.markerId = 'arrowhead';
    this.svgCanvas.addMarker(this.markerId, this.color);
  }

  /**
   * Draws an arrow between two DOM elements.
   * @param {HTMLElement} fromElem - The starting element.
   * @param {HTMLElement} toElem - The ending element.
   * @param {boolean} dashed - Whether the arrow should be dashed.
   * @param {boolean} dotted - Whether the arrow should be dotted.
   * @param {boolean} debug - Whether to enable debug mode.
   * @returns {SVGPathElement} The created SVG path element representing the arrow.
   */
  drawArrow(fromElem, toElem, dashed = false, dotted = false, debug = false) {
    console.assert(fromElem, 'fromElem is required');
    console.assert(toElem, 'toElem is required');
    // Define primary anchor points
    const primaryAnchors = ['top', 'bottom', 'left', 'right'];

    /**
     * Get the coordinates of a specified anchor point relative to the SVG container.
     * @param {DOMRect} rect - The bounding rectangle of the element.
     * @param {string} anchor - The anchor position.
     * @param {DOMRect} containerRect - The bounding rectangle of the SVG container.
     * @returns {{x: number, y: number}} The coordinates of the anchor point.
     */
    const getAnchorPoint = (rect, anchor, containerRect) => {
      const relativeTop = rect.top - containerRect.top;
      const relativeBottom = rect.bottom - containerRect.top;
      const relativeLeft = rect.left - containerRect.left;
      const relativeRight = rect.right - containerRect.left;
      const centerX = (relativeLeft + relativeRight) / 2;
      const centerY = (relativeTop + relativeBottom) / 2;

      switch (anchor) {
        case 'top':
          return { x: centerX, y: relativeTop };
        case 'bottom':
          return { x: centerX, y: relativeBottom };
        case 'left':
          return { x: relativeLeft, y: centerY };
        case 'right':
          return { x: relativeRight, y: centerY };
        default:
          return { x: centerX, y: centerY };
      }
    };

    /**
     * Selects the appropriate anchor for the "from" element based on the direction.
     * @param {number} dx - Difference in x-coordinates.
     * @param {number} dy - Difference in y-coordinates.
     * @returns {string} The selected from anchor.
     */
    const chooseFromAnchor = (dx, dy) => {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal dominance
        return dx > 0 ? 'right' : 'left';
      } else {
        // Vertical dominance
        return dy > 0 ? 'bottom' : 'top';
      }
    };

    /**
     * Selects the appropriate anchor for the "to" element based on the direction.
     * @param {string} fromAnchorName - The selected from anchor.
     * @param {{x: number, y: number}} fromAnchorPos - Position of the from anchor.
     * @param {DOMRect} toRect - Bounding rectangle of the to element.
     * @param {DOMRect} containerRect - Bounding rectangle of the SVG container.
     * @returns {string} The selected to anchor.
     */
    const chooseToAnchor = (fromAnchorName, fromAnchorPos, toRect, containerRect) => {
      const aspectRatio = toRect.width / toRect.height;
      const horizontalWeight = aspectRatio > 1 ? aspectRatio : 1;
      const verticalWeight = aspectRatio < 1 ? 1 / aspectRatio : 1;

      const normalVectors = {
        'top': { x: 0, y: -1 },
        'bottom': { x: 0, y: 1 },
        'left': { x: -1, y: 0 },
        'right': { x: 1, y: 0 }
      };

      const potentialToAnchors = primaryAnchors.map(anchor => {
        const anchorPos = getAnchorPoint(toRect, anchor, containerRect);
        const dirVector = {
          x: fromAnchorPos.x - anchorPos.x,
          y: fromAnchorPos.y - anchorPos.y
        };
        const length = Math.hypot(dirVector.x, dirVector.y);
        const normalizedDir = length === 0 ? { x: 0, y: 0 } : { x: dirVector.x / length, y: dirVector.y / length };
        const normal = normalVectors[anchor];
        const dot = normalizedDir.x * normal.x + normalizedDir.y * normal.y;
        const angle = Math.acos(Math.min(Math.max(dot, -1), 1)) * (180 / Math.PI);

        return { anchor, angle };
      });

      const weightedAngle = (anchor) => {
        const isHorizontal = anchor === 'left' || anchor === 'right';
        return potentialToAnchors.find(a => a.anchor === anchor).angle * (isHorizontal ? horizontalWeight : verticalWeight);
      };

      potentialToAnchors.sort((a, b) => {
        const weightA = weightedAngle(a.anchor);
        const weightB = weightedAngle(b.anchor);
        return weightA - weightB;
      });

      return potentialToAnchors[0].anchor;
    };

    /**
     * Chooses alternative anchors for looped arrows based on the dominant direction.
     * @param {string} dominantDirection - 'horizontal' or 'vertical'.
     * @param {number} dx - Difference in x-coordinates.
     * @param {number} dy - Difference in y-coordinates.
     * @returns {{ from: string, to: string }} Selected alternative anchors.
     */
    const chooseAlternativeAnchors = (dominantDirection, dx, dy) => {
      if (dominantDirection === 'horizontal') {
        return dx > 0 ? { from: 'top', to: 'top' } : { from: 'bottom', to: 'bottom' };
      } else {
        return dy > 0 ? { from: 'left', to: 'left' } : { from: 'right', to: 'right' };
      }
    };

    /**
     * Computes the path data for a regular arrow using a single quadratic Bézier curve.
     * @param {{x: number, y: number}} from - Starting point.
     * @param {{x: number, y: number}} to - Ending point.
     * @param {string} fromAnchorName - Name of the from anchor.
     * @returns {{ pathData: string, controlPoint: {x: number, y: number} }} Path data and control point.
     */
    const computeRegularPath = (from, to, fromAnchorName) => {
      let controlX, controlY;
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      let curvature = this.k * distance;
      curvature = Math.min(curvature, this.maxCurvature); // Cap curvature

      if (fromAnchorName === 'left' || fromAnchorName === 'right') {
        // Horizontal connection: control point offset vertically
        controlX = (from.x + to.x) / 2;
        controlY = (from.y + to.y) / 2 + (fromAnchorName === 'left' ? curvature : -curvature);
      } else {
        // Vertical connection: control point offset horizontally
        controlX = (from.x + to.x) / 2 + (fromAnchorName === 'top' ? curvature : -curvature);
        controlY = (from.y + to.y) / 2;
      }

      const pathData = `M${from.x} ${from.y} Q${controlX} ${controlY} ${to.x} ${to.y}`;
      const controlPoint = { x: controlX, y: controlY };

      return { pathData, controlPoint };
    };

    /**
     * Computes the path data for a looped arrow using two quadratic Bézier curves.
     * @param {{x: number, y: number}} from - Starting anchor point.
     * @param {{x: number, y: number}} to - Ending anchor point.
     * @param {string} dominantDirection - 'horizontal' or 'vertical'.
     * @returns {{ pathData: string, controlPoints: Array<{x: number, y: number}>, midPoint: {x: number, y: number} }} Path data, control points, and midpoint.
     */
    const computeLoopedPath = (from, to, dominantDirection) => {
      // Calculate proportional values for loopCurvature based on distance
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const curvatureRatio = distance / this.minDistance; // Ranges from 0 to 1
      const currentLoopCurvature = this.minLoopCurvature + curvatureRatio * (this.maxLoopCurvature - this.minLoopCurvature);

      let control1X, control1Y, control2X, control2Y, midPoint;

      if (dominantDirection === 'horizontal') {
        // Shift control points upwards or downwards based on anchor
        if (from.anchor === 'top') {
          // Upwards loop
          control1X = from.x;
          control1Y = from.y - currentLoopCurvature;
          control2X = to.x;
          control2Y = to.y - currentLoopCurvature;
          midPoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - currentLoopCurvature };
        } else {
          // Downwards loop
          control1X = from.x;
          control1Y = from.y + currentLoopCurvature;
          control2X = to.x;
          control2Y = to.y + currentLoopCurvature;
          midPoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + currentLoopCurvature };
        }
      } else {
        // Vertical dominance: Shift control points left or right
        if (from.anchor === 'left') {
          // Leftwards loop
          control1X = from.x - currentLoopCurvature;
          control1Y = from.y;
          control2X = to.x - currentLoopCurvature;
          control2Y = to.y;
          midPoint = { x: (from.x + to.x) / 2 - currentLoopCurvature, y: (from.y + to.y) / 2 };
        } else {
          // Rightwards loop
          control1X = from.x + currentLoopCurvature;
          control1Y = from.y;
          control2X = to.x + currentLoopCurvature;
          control2Y = to.y;
          midPoint = { x: (from.x + to.x) / 2 + currentLoopCurvature, y: (from.y + to.y) / 2 };
        }
      }

      // Define two quadratic Bézier segments
      const pathData = `
        M${from.x} ${from.y}
        Q${control1X} ${control1Y}, ${midPoint.x} ${midPoint.y}
        Q${control2X} ${control2Y}, ${to.x} ${to.y}
      `;

      const controlPoints = [
        { x: control1X, y: control1Y },
        { x: control2X, y: control2Y }
      ];

      return { pathData, controlPoints, midPoint };
    };

    /**
     * Draws debug lines and circles to visualize control points and handles.
     * @param {SVGPathElement} path - The SVG path element representing the arrow.
     * @param {boolean} isLoop - Whether the arrow is looped.
     * @param {Object} points - Contains control points and midPoint if looped.
     * @param {{x: number, y: number}} from - Starting point.
     * @param {{x: number, y: number}} to - Ending point.
     */
    const drawDebugElements = (path, isLoop, points, from, to) => {
      const debugGroup = this.svgCanvas.createGroup({
        class: 'debug-group',
        stroke: 'red',
        'stroke-width': '1',
        'stroke-dasharray': '4,2',
        fill: 'blue',
      });

      if (isLoop && points.controlPoints && points.midPoint) {
        const [control1, control2] = points.controlPoints;
        const { midPoint } = points;

        // Draw lines between points
        const lines = [
          { x1: from.x, y1: from.y, x2: control1.x, y2: control1.y },
          { x1: control1.x, y1: control1.y, x2: midPoint.x, y2: midPoint.y },
          { x1: midPoint.x, y1: midPoint.y, x2: control2.x, y2: control2.y },
          { x1: control2.x, y1: control2.y, x2: to.x, y2: to.y }
        ];

        lines.forEach(lineData => {
          const line = this.svgCanvas._createSVGElement('line', {
            x1: lineData.x1,
            y1: lineData.y1,
            x2: lineData.x2,
            y2: lineData.y2,
            stroke: 'red',
            'stroke-width': '1',
            'stroke-dasharray': '4,2',
          });
          debugGroup.appendChild(line);
        });

        // Draw control points and midpoint
        [control1, control2, midPoint].forEach(point => {
          const circle = this.svgCanvas._createSVGElement('circle', {
            cx: point.x,
            cy: point.y,
            r: 3,
            fill: 'blue',
          });
          debugGroup.appendChild(circle);
        });
      } else if (!isLoop && points.controlPoint) {
        const { controlPoint } = points;

        // Draw lines between points
        const lines = [
          { x1: from.x, y1: from.y, x2: controlPoint.x, y2: controlPoint.y },
          { x1: controlPoint.x, y1: controlPoint.y, x2: to.x, y2: to.y }
        ];

        lines.forEach(lineData => {
          const line = this.svgCanvas._createSVGElement('line', {
            x1: lineData.x1,
            y1: lineData.y1,
            x2: lineData.x2,
            y2: lineData.y2,
            stroke: 'red',
            'stroke-width': '1',
            'stroke-dasharray': '4,2',
          });
          debugGroup.appendChild(line);
        });

        // Draw control point
        const circle = this.svgCanvas._createSVGElement('circle', {
          cx: controlPoint.x,
          cy: controlPoint.y,
          r: 3,
          fill: 'blue',
        });
        debugGroup.appendChild(circle);
      }

      this.svgCanvas.svg.appendChild(debugGroup);
    };

    // Get bounding rectangles
    const fromRect = fromElem.getBoundingClientRect();
    const toRect = toElem.getBoundingClientRect();
    const containerRect = this.svgCanvas.svg.getBoundingClientRect();

    // Calculate centers
    const fromCenterX = (fromRect.left + fromRect.right) / 2;
    const fromCenterY = (fromRect.top + fromRect.bottom) / 2;
    const toCenterX = (toRect.left + toRect.right) / 2;
    const toCenterY = (toRect.top + toRect.bottom) / 2;

    // Calculate deltas
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    // Anchor selection
    const fromAnchorName = chooseFromAnchor(dx, dy);
    const fromAnchor = getAnchorPoint(fromRect, fromAnchorName, containerRect);
    const toAnchorName = chooseToAnchor(fromAnchorName, fromAnchor, toRect, containerRect);
    const toAnchor = getAnchorPoint(toRect, toAnchorName, containerRect);

    // Calculate distance between points
    const distance = Math.hypot(toAnchor.x - fromAnchor.x, toAnchor.y - fromAnchor.y);

    // Determine if the arrow should be looped
    const isLoop = distance < this.minDistance;

    // Initialize path data and control points
    let pathData = '';
    let controlPoints = null;
    let midPoint = null;

    if (isLoop) {
      // Handle looped arrows using two quadratic Bézier curves
      const dominantDirection = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      const altAnchors = chooseAlternativeAnchors(dominantDirection, dx, dy);
      const altFromAnchor = getAnchorPoint(fromRect, altAnchors.from, containerRect);
      const altToAnchor = getAnchorPoint(toRect, altAnchors.to, containerRect);

      const { pathData: loopPathData, controlPoints: loopControlPoints, midPoint: loopMidPoint } = computeLoopedPath(
        altFromAnchor,
        altToAnchor,
        dominantDirection
      );

      pathData = loopPathData;
      controlPoints = loopControlPoints;
      midPoint = loopMidPoint;
    } else {
      // Handle regular arrows using a single quadratic Bézier curve
      const { pathData: regularPathData, controlPoint } = computeRegularPath(fromAnchor, toAnchor, fromAnchorName);
      pathData = regularPathData;
      controlPoints = { controlPoint };
    }

    // Create the styled SVG path
    const arrowPath = this.svgCanvas.createPath(pathData, {
      stroke: this.color,
      strokeWidth: this.strokeWidth,
      strokeDasharray: dotted ? '2,4' : dashed ? '8,4' : undefined,
      markerEnd: `url(#${this.markerId})`,
    });

    // Optionally, add a class to looped arrows
    if (isLoop) {
      arrowPath.classList.add('looped-arrow');
    }

    // If debug mode is enabled, draw control points and handles
    if (debug) {
      const points = isLoop ? { controlPoints, midPoint } : { controlPoint: controlPoints.controlPoint };
      drawDebugElements(arrowPath, isLoop, points, fromAnchor, toAnchor);
    }

    return arrowPath;
  }

  clearArrows() {
    this.svgCanvas.svg.querySelectorAll('path').forEach(path => {
      path.remove();
    });
  }
}
