/**
 * ArrowDrawer is responsible for rendering arrows between DOM elements using SVG.
 */
class ArrowDrawer {
  /**
   * Draws an arrow between two DOM elements within the specified SVG container.
   * Handles both regular and looped arrows based on the distance between elements.
   * Includes an optional debug mode to visualize control points and handles.
   * @param {HTMLElement} fromElem - The starting element.
   * @param {HTMLElement} toElem - The ending element.
   * @param {SVGSVGElement} svgContainer - The SVG container to append the arrow to.
   * @param {boolean} dashed - Whether the arrow should be dashed.
   * @param {boolean} dotted - Whether the arrow should be dotted.
   * @param {boolean} debug - Whether to enable debug mode (default: false).
   * @returns {SVGPathElement} The created SVG path element representing the arrow.
   */
  static drawArrow(fromElem, toElem, svgContainer, dashed = false, dotted = false, debug = true) {
    if (!fromElem || !toElem) return;

    const color = 'rgba(98, 0, 238, 0.86)';
    const k = 0.2; // Curvature scaling factor for regular arrows
    const maxCurvature = 100; // Maximum curvature in pixels for regular arrows
    const minDistance = 100; // Minimum distance to draw a regular arrow

    // Define bounds for dynamic loop curvature and slant offset
    const minLoopCurvature = 50; // Minimum curvature for looped arrows
    const maxLoopCurvature = 100; // Maximum curvature for looped arrows
    const minSlantOffset = 10; // Minimum slant offset in pixels for looped arrows
    const maxSlantOffset = 30; // Maximum slant offset in pixels for looped arrows

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

    // Get bounding rectangles
    const fromRect = fromElem.getBoundingClientRect();
    const toRect = toElem.getBoundingClientRect();
    const containerRect = svgContainer.getBoundingClientRect();

    // Calculate centers
    const fromCenterX = (fromRect.left + fromRect.right) / 2;
    const fromCenterY = (fromRect.top + fromRect.bottom) / 2;
    const toCenterX = (toRect.left + toRect.right) / 2;
    const toCenterY = (toRect.top + toRect.bottom) / 2;

    // Calculate deltas
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    /**
     * Step 1: Choose the From Anchor based on the relative position of toElem.
     * @param {number} dx 
     * @param {number} dy 
     * @returns {string} Selected from anchor.
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
     * Step 2: Choose the To Anchor based on the direction vector and normal vectors.
     * @param {string} fromAnchorName - The name of the from anchor ('top', 'bottom', 'left', 'right').
     * @param {{x: number, y: number}} fromAnchorPos - The position of the from anchor.
     * @param {DOMRect} toRect - The bounding rectangle of the to element.
     * @param {DOMRect} containerRect - The bounding rectangle of the SVG container.
     * @returns {string} Selected to anchor.
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
     * Step 3: Choose alternative anchors for short arrows to create pleasing loops.
     * Dynamically selects alternative anchors based on the dominant direction and relative positions.
     * @param {string} dominantDirection - 'horizontal' or 'vertical'.
     * @param {number} dx 
     * @param {number} dy 
     * @returns {{ from: string, to: string }} Selected anchors.
     */
    const chooseAlternativeAnchors = (dominantDirection, dx, dy) => {
      if (dominantDirection === 'horizontal') {
        // For horizontal dominance, determine if toElem is to the right or left
        return dx > 0 ? { from: 'top', to: 'top' } : { from: 'bottom', to: 'bottom' };
      } else {
        // For vertical dominance, determine if toElem is below or above
        return dy > 0 ? { from: 'left', to: 'left' } : { from: 'right', to: 'right' };
      }
    };

    // Execute the two-step anchor selection
    const fromAnchorName = chooseFromAnchor(dx, dy);
    const fromAnchor = getAnchorPoint(fromRect, fromAnchorName, containerRect);
    const toAnchorName = chooseToAnchor(fromAnchorName, fromAnchor, toRect, containerRect);
    const toAnchor = getAnchorPoint(toRect, toAnchorName, containerRect);

    // Calculate distance between points
    const distance = Math.hypot(toAnchor.x - fromAnchor.x, toAnchor.y - fromAnchor.y);

    // Initialize path data
    let pathData = '';
    let isLoop = false;

    // Variables to store control points for debug mode
    let controlPoint1 = null;
    let controlPoint2 = null;
    let startAnchor = fromAnchor;
    let endAnchor = toAnchor;

    if (distance < minDistance) {
      // Handle short arrows by creating a loop
      isLoop = true;

      // Determine the dominant direction
      const dominantDirection = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';

      // Choose alternative anchors based on dominant direction and relative positions
      const altAnchors = chooseAlternativeAnchors(dominantDirection, dx, dy);
      const altFromAnchor = getAnchorPoint(fromRect, altAnchors.from, containerRect);
      const altToAnchor = getAnchorPoint(toRect, altAnchors.to, containerRect);

      // Calculate proportional values for loopCurvature and slantOffset based on distance
      // Closer distance -> smaller curvature and slant
      // Farther distance (but < minDistance) -> larger curvature and slant
      const curvatureRatio = distance / minDistance; // Ranges from 0 to 1
      const currentLoopCurvature = minLoopCurvature + curvatureRatio * (maxLoopCurvature - minLoopCurvature);
      const currentSlantOffset = minSlantOffset + curvatureRatio * (maxSlantOffset - minSlantOffset);

      // Determine direction to offset control points based on alternative anchors
      let control1X, control1Y, control2X, control2Y;

      if (dominantDirection === 'horizontal') {
        // For horizontal dominance, use top or bottom anchors
        if (altAnchors.from === 'top') {
          // Shift control points further upwards
          control1X = altFromAnchor.x + currentSlantOffset; // Slight right shift
          control1Y = altFromAnchor.y - currentLoopCurvature - currentSlantOffset; // More upwards
          control2X = altToAnchor.x - currentSlantOffset; // Slight left shift
          control2Y = altToAnchor.y - currentLoopCurvature - currentSlantOffset; // More upwards
        } else {
          // Shift control points further downwards
          control1X = altFromAnchor.x + currentSlantOffset; // Slight right shift
          control1Y = altFromAnchor.y + currentLoopCurvature + currentSlantOffset; // More downwards
          control2X = altToAnchor.x - currentSlantOffset; // Slight left shift
          control2Y = altToAnchor.y + currentLoopCurvature + currentSlantOffset; // More downwards
        }

        pathData = `M${altFromAnchor.x} ${altFromAnchor.y} C${control1X} ${control1Y}, ${control2X} ${control2Y}, ${altToAnchor.x} ${altToAnchor.y}`;

      } else {
        // For vertical dominance, use left or right anchors
        if (altAnchors.from === 'left') {
          // Shift control points further leftwards
          control1X = altFromAnchor.x - currentLoopCurvature - currentSlantOffset; // More left
          control1Y = altFromAnchor.y + currentSlantOffset; // Slight downward shift
          control2X = altToAnchor.x - currentLoopCurvature - currentSlantOffset; // More left
          control2Y = altToAnchor.y - currentSlantOffset; // Slight upward shift
        } else {
          // Shift control points further rightwards
          control1X = altFromAnchor.x + currentLoopCurvature + currentSlantOffset; // More right
          control1Y = altFromAnchor.y + currentSlantOffset; // Slight downward shift
          control2X = altToAnchor.x + currentLoopCurvature + currentSlantOffset; // More right
          control2Y = altToAnchor.y - currentSlantOffset; // Slight upward shift
        }

        pathData = `M${altFromAnchor.x} ${altFromAnchor.y} C${control1X} ${control1Y}, ${control2X} ${control2Y}, ${altToAnchor.x} ${altToAnchor.y}`;
      }

      // Store control points for debug
      controlPoint1 = { x: control1X, y: control1Y };
      controlPoint2 = { x: control2X, y: control2Y };
      startAnchor = altFromAnchor;
      endAnchor = altToAnchor;
    } else {
      // Handle regular arrows
      // Calculate curvature
      let curvature = k * distance;
      curvature = Math.min(curvature, maxCurvature); // Cap curvature

      // Determine the direction of the curvature based on anchor positions
      let controlX, controlY;
      if (fromAnchorName === 'left' || fromAnchorName === 'right') {
        // Horizontal connection: control point offset vertically
        controlX = (fromAnchor.x + toAnchor.x) / 2;
        controlY = (fromAnchor.y + toAnchor.y) / 2 + (fromAnchorName === 'left' ? curvature : -curvature);
      } else {
        // Vertical connection: control point offset horizontally
        controlX = (fromAnchor.x + toAnchor.x) / 2 + (fromAnchorName === 'top' ? curvature : -curvature);
        controlY = (fromAnchor.y + toAnchor.y) / 2;
      }

      pathData = `M${fromAnchor.x} ${fromAnchor.y} Q${controlX} ${controlY} ${toAnchor.x} ${toAnchor.y}`;

      // Store control point for debug
      controlPoint1 = { x: controlX, y: controlY };
    }

    // Create arrow marker if it doesn't exist
    if (!svgContainer.querySelector('defs')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrowhead');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '10');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      marker.setAttribute('markerUnits', 'strokeWidth');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
      polygon.setAttribute('fill', color); // Arrow color

      marker.appendChild(polygon);
      defs.appendChild(marker);
      svgContainer.appendChild(defs);
    }

    // Create the SVG path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color); // Arrow color

    // Apply stroke styles
    if (dashed) {
      path.setAttribute('stroke-dasharray', '8,4');
    }
    if (dotted) {
      path.setAttribute('stroke-dasharray', '2,4');
    }

    path.setAttribute('stroke-width', '2');
    path.setAttribute('marker-end', 'url(#arrowhead)');

    // Optional: Add a class or data attribute to identify looped arrows
    if (isLoop) {
      path.classList.add('looped-arrow');
    }

    // Append the arrow path to the SVG container
    svgContainer.appendChild(path);

    // If debug mode is enabled, draw control points and handles
    if (debug) {
      const debugGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      debugGroup.setAttribute('class', 'debug-group');
      debugGroup.setAttribute('stroke', 'red');
      debugGroup.setAttribute('stroke-width', '1');
      debugGroup.setAttribute('stroke-dasharray', '4,2');
      debugGroup.setAttribute('fill', 'blue');

      if (isLoop) {
        // For looped arrows, there are two control points
        if (controlPoint1 && controlPoint2) {
          // Draw lines from startAnchor to control1
          const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line1.setAttribute('x1', startAnchor.x);
          line1.setAttribute('y1', startAnchor.y);
          line1.setAttribute('x2', controlPoint1.x);
          line1.setAttribute('y2', controlPoint1.y);
          debugGroup.appendChild(line1);

          // Draw lines between control1 and control2
          const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line2.setAttribute('x1', controlPoint1.x);
          line2.setAttribute('y1', controlPoint1.y);
          line2.setAttribute('x2', controlPoint2.x);
          line2.setAttribute('y2', controlPoint2.y);
          debugGroup.appendChild(line2);

          // Draw lines from control2 to endAnchor
          const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line3.setAttribute('x1', controlPoint2.x);
          line3.setAttribute('y1', controlPoint2.y);
          line3.setAttribute('x2', endAnchor.x);
          line3.setAttribute('y2', endAnchor.y);
          debugGroup.appendChild(line3);

          // Draw control points as circles
          const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle1.setAttribute('cx', controlPoint1.x);
          circle1.setAttribute('cy', controlPoint1.y);
          circle1.setAttribute('r', 3);
          debugGroup.appendChild(circle1);

          const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle2.setAttribute('cx', controlPoint2.x);
          circle2.setAttribute('cy', controlPoint2.y);
          circle2.setAttribute('r', 3);
          debugGroup.appendChild(circle2);
        }
      } else {
        // For regular arrows, there is one control point
        if (controlPoint1) {
          // Draw line from startAnchor to control point
          const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line1.setAttribute('x1', startAnchor.x);
          line1.setAttribute('y1', startAnchor.y);
          line1.setAttribute('x2', controlPoint1.x);
          line1.setAttribute('y2', controlPoint1.y);
          debugGroup.appendChild(line1);

          // Draw line from control point to endAnchor
          const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line2.setAttribute('x1', controlPoint1.x);
          line2.setAttribute('y1', controlPoint1.y);
          line2.setAttribute('x2', endAnchor.x);
          line2.setAttribute('y2', endAnchor.y);
          debugGroup.appendChild(line2);

          // Draw control point as a circle
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', controlPoint1.x);
          circle.setAttribute('cy', controlPoint1.y);
          circle.setAttribute('r', 3);
          debugGroup.appendChild(circle);
        }
      }

      // Append the debug group to the SVG container
      svgContainer.appendChild(debugGroup);
    }

    return path;
  }
}
