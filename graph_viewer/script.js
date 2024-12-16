// Expose key objects to the global namespace for easy access via DevTools
window.App = {};

function basename(path) {
  return path.split('/').pop();
}

/**
 * GraphLoader is responsible for fetching and parsing graph data from a JSON source.
 */
class GraphLoader {
  /**
   * Fetches graph data based on the provided graph ID.
   * @param {string} graphId - The identifier for the graph to fetch.
   * @returns {Promise<Object>} - A promise that resolves to the graph data.
   */
  static async fetchGraphData(graphId = 'graph') {
    try {
      // Replace 'graphs/${graphId}.json' with your actual JSON file path or endpoint
      const response = await fetch(`graphs/${graphId}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching JSON:', error);
      throw error;
    }
  }
}

/**
 * GraphData manages the graph's nodes, links, and related mappings with type checking and validation.
 */
class GraphData {
  /**
   * Initializes the GraphData instance with the provided graph data.
   * @param {Object} graphData - The graph JSON data.
   */
  constructor(graphData) {
    this.source = graphData.source;
    this.nodes = graphData.nodes;
    this.links = graphData.links;

    this.sourceLines = this.source.content.split('\n');
    this.lineOffsets = this.computeLineOffsets(this.sourceLines);

    this.processNodes();

    this.incoming = {};
    this.outgoing = {};
    this.nodeMap = {};
    this.initializeMappings();
  }

  processNodes() {
    this.nodes.forEach(node => {
      const [filepath, offset, length, replacementText] = this.extractReplacementInfo(node.replacement);
      node.filepath = filepath;
      node.replacementText = replacementText;
      node.replacementOffset = offset;
      node.replacementLength = length;
    });
  }

  /**
   * Computes cumulative offsets for each line in the source code.
   * @param {Array<string>} sourceLines - The source code split into lines.
   * @returns {Array<number>} - An array of cumulative offsets.
   */
  computeLineOffsets(sourceLines) {
    const offsets = [0];
    for (let i = 0; i < sourceLines.length; i++) {
      // +1 for the newline character
      offsets.push(offsets[i] + sourceLines[i].length + 1);
    }
    return offsets;
  }

  /**
   * Initializes incoming and outgoing mappings for nodes and creates a node map.
   */
  initializeMappings() {
    // Initialize incoming and outgoing mappings
    this.nodes.forEach(node => {
      this.incoming[node.id] = [];
      this.outgoing[node.id] = [];
      this.nodeMap[node.id] = node;
    });

    // Populate incoming and outgoing mappings based on links
    this.links.forEach(link => {
      if (this.outgoing[link.source]) {
        this.outgoing[link.source].push(link.target);
      } else {
        this.outgoing[link.source] = [link.target];
      }

      if (this.incoming[link.target]) {
        this.incoming[link.target].push(link.source);
      } else {
        this.incoming[link.target] = [link.source];
      }
    });
  }

  /**
   * Extracts offset, length, and replacement text from the replacement string.
   * Expected format: "r:::/path/to/file:::offset:::length:::replacement_text"
   * @param {string} replacementStr - The replacement string.
   * @returns {Array} - [filepath, offset, length, replacementText]
   */
  extractReplacementInfo(replacementStr) {
    try {
      const parts = replacementStr.split(":::");
      if (parts.length < 5) {
        throw new Error(`Invalid replacement string format: "${replacementStr}"`);
      }
      const filepath = parts[1];
      const offset = parseInt(parts[2], 10);
      const length = parseInt(parts[3], 10);
      const replacementText = parts[4] || ''; // Default to empty string if undefined
      return [filepath, offset, length, replacementText];
    } catch (error) {
      console.error('Error parsing replacement string:', replacementStr, error);
      return [null, null, null, null];
    }
  }

  /**
   * Generates a preview of three lines before and after the replacement, with the replacement highlighted.
   * @param {number} lineNumber - The zero-based line number where the replacement occurs.
   * @param {number} columnNumber - The zero-based column number where the replacement starts.
   * @param {number} length - The length of the replacement.
   * @param {string} replacementText - The replacement text.
   * @returns {string} - The HTML string representing the preview.
   */
  getThreeLinePreview(lineNumber, columnNumber, length, replacementText) {
    const previewLines = this.sourceLines.slice(
      Math.max(0, lineNumber - 3),
      Math.min(this.sourceLines.length, lineNumber + 4)
    );
    const targetLineIndex = Math.min(3, lineNumber - Math.max(0, lineNumber - 3)); // Adjust index based on slicing

    if (targetLineIndex >= previewLines.length) return '';

    const targetLine = previewLines[targetLineIndex];
    const beforeReplacement = targetLine.substring(0, columnNumber);
    const replacedText = targetLine.substring(columnNumber, columnNumber + length);
    const afterReplacement = targetLine.substring(columnNumber + length);

    let originalNullClass = '';
    if (!replacedText) {
      originalNullClass = ' null';
    }

    let newNullClass = '';
    if (!replacementText) {
      newNullClass = ' null';
    }

    let highlightedReplacement;
    if (replacementText.trim() === '') {
      // If replacementText is empty, the span is empty and CSS will insert "∅"
      highlightedReplacement = `<span class="highlight-original${originalNullClass}">${escapeHTML(replacedText)}</span>`;
    } else {
      const escapedReplacementText = escapeHTML(replacementText);
      highlightedReplacement = `<span class="highlight-original${originalNullClass}">${escapeHTML(replacedText)}</span> → <span class="highlight-new${newNullClass}">${escapedReplacementText}</span>`;
    }

    const finalTargetLine = beforeReplacement + highlightedReplacement + afterReplacement;
    previewLines[targetLineIndex] = finalTargetLine;

    // Escape HTML for all lines except the highlighted one
    const escapedPreview = previewLines.map((line, idx) => {
      if (idx === targetLineIndex) {
        return line; // Already escaped and contains HTML
      } else {
        return escapeHTML(line);
      }
    }).join('\n');

    return escapedPreview;
  }
}

/**
 * InspectorUI manages the user interface interactions and DOM manipulations.
 */
class InspectorUI {
  /**
   * Initializes the InspectorUI with the provided graph data.
   * @param {GraphData} graphData - An instance of GraphData.
   */
  constructor(graphData) {
    this.graphData = graphData;
    this.selectedNodeId = null;
    this.hoverNodeDisabledUntilPointerMove = false;

    this.svgContainer = document.getElementById('arrow-container');
    this.sourceCodeContainer = document.getElementById('source-code');
    this.inspectorElement = document.querySelector('.inspector-section');
    this.arrowConfigElement = document.getElementById('arrow-config');
    this.replacementTextElement = document.getElementById('replacement-text');
    this.replacementPreviewElement = document.getElementById('replacement-preview');
    this.incomingListElement = document.getElementById('incoming-list');
    this.outgoingListElement = document.getElementById('outgoing-list');
    this.nodeInternalsElement = document.getElementById('node-internals');
    this.sourceCodeLineNumbersElement = document.getElementById('source-code-line-numbers');

    this.initializeUI();
  }

  /**
   * Sets up the UI by annotating the source code, adding event listeners, and initializing arrows.
   */
  initializeUI() {
    // Load arrow configuration from SettingsStore
    const savedArrowConfig = SettingsStore.get('arrowConfig') || this.arrowConfigElement.value;
    this.arrowConfigElement.value = savedArrowConfig;
    this.arrowConfig = savedArrowConfig;

    // Initialize arrow configuration
    this.arrowConfigElement.addEventListener('change', (event) => {
      this.arrowConfig = event.target.value;
      SettingsStore.set('arrowConfig', this.arrowConfig); // Save setting
      this.updateArrows();
    });

    // Annotate the source code and display it
    // remove all children from sourceCodeContainer
    this.sourceCodeContainer.innerHTML = '';
    const annotatedSource = this.annotateSourceCode(this.graphData.source);
    const numLines = annotatedSource.querySelectorAll('br').length + 1;
    this.sourceCodeContainer.appendChild(annotatedSource);
    this.sourceCodeLineNumbersElement.innerHTML = Array.from({ length: numLines }, (_, i) => `<div>${i + 1}</div>`).join('');

    let lineNumberWidth = this.sourceCodeLineNumbersElement.getBoundingClientRect().width;
    this.sourceCodeContainer.style.paddingLeft = `${lineNumberWidth + 8}px`;

    this.addExternalNodes(this.graphData.source);

    // Initialize event listeners for replacement spans
    this.attachReplacementClickHandlers();

    // Initial arrow rendering
    this.updateArrows();
  }

  addExternalNodes(source) {
    let externalNodes = this.graphData.nodes.filter(node => node.filepath !== source.file_path);
    for (let node of externalNodes) {
      const element = document.createElement('div');
      element.classList.add('external-node', 'replacement');
      element.dataset.nodeId = node.id;
      element.textContent = `${basename(node.filepath)}:${node.replacementOffset}`;
      const nodeTypeFrag = document.createRange().createContextualFragment(this.generateNodeTypeHTML(node));
      element.appendChild(nodeTypeFrag);
      // Search through links to find a non-external node that it is connected with.
      let connectedNode = null;
      for (let link of this.graphData.links) {
        if (link.source === node.id) {
          connectedNode = this.graphData.nodeMap[link.target];
          break;
        }
        if (link.target === node.id) {
          connectedNode = this.graphData.nodeMap[link.source];
          break;
        }
      }
      if (connectedNode) {
        console.log('connectedNode', connectedNode);
        // position the external node close to the connected node
        const connectedNodeElement = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${connectedNode.id}"]`);
        if (connectedNodeElement) {
          const connectedNodeRect = connectedNodeElement.getBoundingClientRect();
          element.style.top = `${connectedNodeRect.top}px`;
          element.style.right = `16px`;
        }
        this.sourceCodeContainer.appendChild(element);
      }
    }
  }

  sortNodesByOffset(nodes) {
    return nodes.slice().sort((a, b) => {
      if (a.replacementOffset === b.replacementOffset) {
        return a.replacementLength - b.replacementLength;
      }
      return a.replacementOffset - b.replacementOffset;
    });
  }

  /**
   * Annotates the source code by wrapping replacement ranges with clickable spans.
   * @returns {HTMLDocumentFragment} - The annotated source code as an HTML fragment.
   */
  annotateSourceCode(source) {
    let nodes = this.graphData.nodes.filter(node => node.filepath === source.file_path);

    // Sort nodes by offset ascending and offset+length ascending to process from start to end
    nodes = this.sortNodesByOffset(nodes);

    // Take out overlapping nodes.
    let overlappingNodes = [];
    let nonOverlappingNodes = nodes;
    while (true) {
      let newOverlappingNodes = [];
      for (let i = 0; i < nonOverlappingNodes.length - 1; i++) {
        const a = nonOverlappingNodes[i];
        const b = nonOverlappingNodes[i + 1];
        if (a.replacementOffset + a.replacementLength > b.replacementOffset) {
          newOverlappingNodes.push(nonOverlappingNodes[i]);
        }
      }
      if (newOverlappingNodes.length === 0) {
        break;
      }
      overlappingNodes = overlappingNodes.concat(newOverlappingNodes);
      nonOverlappingNodes = nonOverlappingNodes.filter(node => !newOverlappingNodes.includes(node));
    }
    overlappingNodes = this.sortNodesByOffset(overlappingNodes);

    let parts = [];
    let currentNodeIndex = 0;

    for (let offset = 0; offset < source.content.length; offset++) {
      while (currentNodeIndex < nonOverlappingNodes.length) {
        const node = nonOverlappingNodes[currentNodeIndex];
        console.assert(node.replacementOffset !== null && node.replacementLength !== null, "Invalid replacement info");

        if (offset < node.replacementOffset) {
          // Not in the current node's range
          break;
        }

        if (offset === node.replacementOffset) {
          // Start of the replacement range
          const isEmpty = node.replacementLength === 0;
          parts.push(`<span class="replacement${isEmpty ? ' empty-node' : ''}${node['debug_info']['added_to_component'] ? ' applied' : ''}${node.hasError ? ' error-node' : ''}" data-node-id="${node.id}">`);
        }

        if (offset === node.replacementOffset + node.replacementLength) {
          // End of the replacement range
          parts.push(this.generateNodeTypeHTML(node));
          parts.push(`</span>`);
          currentNodeIndex++;
          continue;
        }

        break;
      }

      const char = source.content[offset];

      if (char === '\n') {
        parts.push('<br>');
      } else {
        parts.push(escapeHTML(char));
      }
    }

    const documentFragment = document.createRange().createContextualFragment(parts.join(''));
    return documentFragment
  }

  /**
   * Generates HTML for node type indicators.
   * @param {Object} node - The node object.
   * @returns {string} - HTML string representing node type icons.
   */
  generateNodeTypeHTML(node) {
    let parts = [];
    parts.push(`<div class="node-type-icons">`);
    if (node.is_buffer === true) {
      parts.push(`<span class="node-type is-buffer" title="is_buffer">B</span>`);
    }
    if (node.debug_info?.original_size_info_available === true) {
      parts.push(`<span class="node-type" title="original_size_info_available">S</span>`);
    }
    if (node.visited) {
      parts.push(`<span class="node-type" title="visited">V</span>`);
    }
    if (node.is_deref_node === true) {
      parts.push(`<span class="node-type" title="is_deref_node">DR</span>`);
    }
    if (node.is_data_change === true) {
      parts.push(`<span class="node-type" title="is_data_change">DC</span>`);
    }
    parts.push(`</div>`);
    return parts.join('');
  }

  /**
   * Attaches click and highlight event listeners to all replacement spans.
   */
  attachReplacementClickHandlers() {
    const replacements = this.sourceCodeContainer.querySelectorAll('.replacement');
    replacements.forEach(span => {
      span.addEventListener('click', this.handleReplacementClick.bind(this));
      span.addEventListener('click', function () {
        // Remove highlight from all spans
        replacements.forEach(s => s.classList.remove('highlight'));
        // Add highlight to the clicked span
        this.classList.add('highlight');
      });
    });
  }

  /**
   * Handles click events on replacement spans.
   * Updates the inspector sidebar with node details and previews.
   * @param {Event} event - The click event.
   */
  handleReplacementClick(event) {
    const nodeId = event.target.getAttribute('data-node-id');
    if (!nodeId) return;
    this.selectNode(nodeId);
  }

  /**
   * Selects a node by its ID and updates the UI accordingly.
   * @param {number|string} nodeId - The ID of the node to select.
   */
  selectNode(nodeId) {
    nodeId = parseInt(nodeId, 10);
    const node = this.graphData.nodeMap[nodeId];
    if (!node) {
      console.error(`Node with ID ${nodeId} not found.`);
      return;
    }

    this.selectedNodeId = nodeId;
    this.inspectorElement.dataset.selectedNodeId = nodeId;

    this.updateArrows();

    this.hoverNodeDisabledUntilPointerMove = true;
    this.inspectorElement.addEventListener("pointermove", () => {
      this.hoverNodeDisabledUntilPointerMove = false;
    }, { once: true });

    // Update replacement info
    this.replacementTextElement.textContent = node.replacement;

    // Compute line number and column number
    let lineNumber = 0;
    for (let i = 0; i < this.graphData.lineOffsets.length; i++) {
      if (node.replacementOffset < this.graphData.lineOffsets[i]) {
        lineNumber = i - 1;
        break;
      }
    }
    if (lineNumber === 0 && node.replacementOffset >= this.graphData.lineOffsets[this.graphData.lineOffsets.length - 1]) {
      lineNumber = this.graphData.lineOffsets.length - 1;
    }
    if (lineNumber < 0) lineNumber = 0;
    const columnNumber = node.replacementOffset - this.graphData.lineOffsets[lineNumber];

    // Get three lines before and after
    const previewContent = this.graphData.getThreeLinePreview(lineNumber, columnNumber, length, node.replacementText);

    // Update 'replacement-preview' div
    this.replacementPreviewElement.innerHTML = '<pre>' + previewContent + '</pre>';

    // Update incoming and outgoing nodes
    this.updateNodeLists(node);

    // Update node internals
    this.nodeInternalsElement.textContent = JSON.stringify(node, null, 2);

    // If node has errors, indicate in the UI (future enhancement)
    if (node.hasError) {
      this.nodeInternalsElement.classList.add('error');
      // Additional UI updates can be implemented here
    } else {
      this.nodeInternalsElement.classList.remove('error');
    }
  }

  /**
   * Updates the incoming and outgoing node lists in the inspector.
   * @param {Object} node - The currently selected node.
   */
  updateNodeLists(node) {
    this.updateList(this.incomingListElement, this.graphData.incoming[node.id], 'incoming', node.id);
    this.updateList(this.outgoingListElement, this.graphData.outgoing[node.id], 'outgoing', node.id);
  }

  /**
   * Updates a specific list (incoming or outgoing) with the provided node IDs.
   * @param {HTMLElement} listElement - The list DOM element to update.
   * @param {Array<number>} nodeIds - The list of node IDs to display.
   * @param {string} type - The type of list ('incoming' or 'outgoing').
   * @param {number} currentNodeId - The ID of the currently selected node.
   */
  updateList(listElement, nodeIds, type, currentNodeId) {
    listElement.innerHTML = '';
    if (nodeIds.length === 0) {
      listElement.innerHTML = `<li>No ${type} nodes.</li>`;
      return;
    }

    nodeIds.forEach(sourceId => {
      const sourceNode = this.graphData.nodeMap[sourceId];
      if (!sourceNode) return;
      const sourceOriginalText = sourceNode.replacementOffset !== null && sourceNode.replacementLength !== null
        ? this.graphData.source.content.substring(sourceNode.replacementOffset, sourceNode.replacementOffset + sourceNode.replacementLength)
        : '';
      const sourceEscapedOriginal = escapeHTML(sourceOriginalText);
      const sourceEscapedReplacement = escapeHTML(sourceNode.replacementText);
      const preview = `<span class="preview-before">${sourceEscapedOriginal}</span> → <span class="preview-after">${sourceEscapedReplacement}</span>`;
      const listItem = document.createElement('li');
      listItem.innerHTML = preview;
      listItem.classList.add('list-item');

      if (!sourceEscapedOriginal) {
        listItem.querySelector(".preview-before").classList.add("null");
      }
      if (!sourceEscapedReplacement) {
        listItem.querySelector(".preview-after").classList.add("null");
      }

      // Indicate if the source node has errors
      if (sourceNode.hasError) {
        listItem.classList.add('error-node');
        // Additional UI indicators can be added here
      }

      listItem.addEventListener('click', () => {
        this.selectNode(sourceId);
      });
      listItem.addEventListener('pointerenter', () => {
        if (this.hoverNodeDisabledUntilPointerMove) return;
        this.highlightNode(sourceId);
      });
      listItem.addEventListener('pointerleave', () => {
        if (this.hoverNodeDisabledUntilPointerMove) return;
        this.highlightNode(currentNodeId);
      });

      listElement.appendChild(listItem);
    });
  }

  /**
   * Highlights a node in the source code by adding a highlight class.
   * @param {number} nodeId - The ID of the node to highlight.
   */
  highlightNode(nodeId) {
    nodeId = parseInt(nodeId, 10);
    const selector = `.replacement[data-node-id="${nodeId}"]`;
    this.sourceCodeContainer.querySelectorAll(".highlight").forEach(e => e.classList.remove('highlight'));
    const targetSpan = this.sourceCodeContainer.querySelector(selector);
    if (targetSpan) {
      targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetSpan.classList.add('highlight');
    }
  }

  /**
   * Updates the arrows in the SVG container based on the current arrow configuration and selected node.
   */
  updateArrows() {
    this.svgContainer.innerHTML = "";

    if (this.arrowConfig === "") return;

    const selectedNodeId = this.selectedNodeId;
    const { links, nodeMap } = this.graphData;

    links.forEach(link => {
      if (this.arrowConfig === 'selected') {
        if (link.source !== selectedNodeId && link.target !== selectedNodeId) {
          return;
        }
      }
      console.log('selectedNodeId', selectedNodeId, link);
      const fromElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${link.source}"]`);
      const toElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${link.target}"]`);
      console.log('drawArrow', fromElem, toElem);
      let sourceNode = nodeMap[link.source];
      ArrowDrawer.drawArrow(fromElem, toElem, this.svgContainer, sourceNode?.is_deref_node === true, false, window.debug);
    });

    this.graphData.nodes.forEach(node => {
      if (node.is_data_change !== true) return;
      let source = node.data_change_lhs;
      let target = node.id;
      if (this.arrowConfig === 'selected') {
        if (source !== selectedNodeId && target !== selectedNodeId) {
          return;
        }
      }
      const fromElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${source}"]`);
      const toElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${target}"]`);
      ArrowDrawer.drawArrow(fromElem, toElem, this.svgContainer, false, true, window.debug);
    });
  }
}

/**
 * Utility functions for escaping HTML and other helper tasks.
 */

/**
 * Escapes HTML special characters in a string to prevent HTML injection.
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * SettingsStore is a simple key-value store that persists data in localStorage.
 */
class SettingsStore {
  /**
   * Retrieves a value from localStorage.
   * @param {string} key - The key to retrieve.
   * @returns {any} - The parsed value from localStorage, or null if not found.
   */
  static get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Stores a value in localStorage.
   * @param {string} key - The key to store.
   * @param {any} value - The value to store, must be serializable to JSON.
   */
  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Removes a key from localStorage.
   * @param {string} key - The key to remove.
   */
  static remove(key) {
    localStorage.removeItem(key);
  }
}

// Initialize the application once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const url = new URL(window.location);
    const graphId = url.searchParams.get('g') || 'basics-original';
    window.debug = url.searchParams.get('debug') === "1";

    // Fetch the graph JSON data
    const graphDataRaw = await GraphLoader.fetchGraphData(graphId);
    const graphData = new GraphData(graphDataRaw);

    // Assign to global namespace for easy access
    window.App.graphData = graphData;

    // Initialize the inspector UI
    const inspectorUI = new InspectorUI(graphData);

    // Assign to global namespace for debugging
    window.App.inspectorUI = inspectorUI;
  } catch (error) {
    console.error('Failed to initialize the application:', error);
  }
});
