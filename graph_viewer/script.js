// Expose key objects to the global namespace for easy access via DevTools
window.App = {};

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
        this.originalSource = graphData.source.content;
        this.nodesRaw = graphData.nodes;
        this.links = graphData.links;

        this.sourceLines = this.originalSource.split('\n');
        this.lineOffsets = this.computeLineOffsets(this.sourceLines);

        this.incoming = {};
        this.outgoing = {};
        this.nodeMap = {};

        // Process and validate nodes
        this.nodes = this.processNodes(this.nodesRaw);
        this.initializeMappings();
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
     * Processes and validates raw node data, converting string flags to booleans or nulls.
     * @param {Array<Object>} nodesRaw - The raw nodes from the graph data.
     * @returns {Array<Object>} - The processed and validated nodes.
     */
    processNodes(nodesRaw) {
        return nodesRaw.map(node => {
            const processedNode = { ...node };

            // Convert string flags to booleans or nulls
            processedNode.is_buffer = this.parseFlag(processedNode.is_buffer, 'is_buffer', node.id);
            processedNode.size_info_available = this.parseFlag(processedNode.size_info_available, 'size_info_available', node.id);
            processedNode.is_deref_node = this.parseFlag(processedNode.is_deref_node, 'is_deref_node', node.id);
            processedNode.is_data_change = this.parseFlag(processedNode.is_data_change, 'is_data_change', node.id);

            // Process debug_info similarly
            if (processedNode.debug_info) {
                processedNode.debug_info.original_is_buffer = this.parseFlag(processedNode.debug_info.original_is_buffer, 'original_is_buffer', node.id);
                processedNode.debug_info.original_size_info_available = this.parseFlag(processedNode.debug_info.original_size_info_available, 'original_size_info_available', node.id);
                // Add more fields as necessary
            }

            // Flag if any critical field is null
            processedNode.hasError = ['is_buffer', 'size_info_available', 'is_deref_node', 'is_data_change'].some(field => processedNode[field] === null);

            if (processedNode.hasError) {
                console.warn(`Node ID ${node.id} has invalid or missing fields.`);
            }

            return processedNode;
        });
    }

    /**
     * Parses a flag from the graph data, converting "1" to true, "0" to false, and null remains null.
     * @param {string|null} value - The flag value to parse.
     * @param {string} fieldName - The name of the field being parsed.
     * @param {number} nodeId - The ID of the node (for logging purposes).
     * @returns {boolean|null} - The parsed boolean or null.
     */
    parseFlag(value, fieldName, nodeId) {
        if (value === "1") return true;
        if (value === "0") return false;
        if (value === null || value === undefined) {
            console.warn(`Node ID ${nodeId} has null or undefined value for field "${fieldName}".`);
            return null;
        }
        console.warn(`Node ID ${nodeId} has unexpected value "${value}" for field "${fieldName}". Expected "1", "0", or null.`);
        return null;
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
     * @returns {Array} - [offset, length, replacementText]
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
            return [offset, length, replacementText];
        } catch (error) {
            console.error('Error parsing replacement string:', replacementStr, error);
            return [null, null, null];
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
        this.inspectorElement = document.getElementById('inspector');
        this.arrowConfigElement = document.getElementById('arrow-config');
        this.replacementTextElement = document.getElementById('replacement-text');
        this.replacementPreviewElement = document.getElementById('replacement-preview');
        this.incomingListElement = document.getElementById('incoming-list');
        this.outgoingListElement = document.getElementById('outgoing-list');
        this.nodeInternalsElement = document.getElementById('node-internals');

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
        const annotatedSource = this.annotateSourceCode();
        this.sourceCodeContainer.innerHTML = annotatedSource;

        // Initialize event listeners for replacement spans
        this.attachReplacementClickHandlers();

        // Initial arrow rendering
        this.updateArrows();
    }

    /**
     * Annotates the source code by wrapping replacement ranges with clickable spans.
     * @returns {string} - The annotated source code as HTML.
     */
    annotateSourceCode() {
        const { originalSource, nodes } = this.graphData;

        // Sort nodes by offset ascending and offset+length ascending to process from start to end
        const sortedNodes = nodes.slice().sort((a, b) => {
            const [offsetA, lengthA] = this.graphData.extractReplacementInfo(a.replacement);
            const [offsetB, lengthB] = this.graphData.extractReplacementInfo(b.replacement);
            if (offsetA === offsetB) {
                return lengthA - lengthB;
            }
            return offsetA - offsetB;
        });

        // Check for overlapping nodes.
        for (let i = 0; i < sortedNodes.length - 1; i++) {
            const [offsetA, lengthA] = this.graphData.extractReplacementInfo(sortedNodes[i].replacement);
            const [offsetB, lengthB] = this.graphData.extractReplacementInfo(sortedNodes[i + 1].replacement);
            if (offsetA + lengthA > offsetB) {
                console.warn(`Overlapping nodes detected. Node ${sortedNodes[i].id} and ${sortedNodes[i + 1].id}`);
                console.log(sortedNodes[i]);
                console.log(sortedNodes[i + 1]);
                console.log(offsetA, lengthA, offsetB, lengthB);
                alert("Overlapping nodes detected. Please fix the graph data.");
            }
        }

        let parts = [];
        let currentNodeIndex = 0;

        for (let offset = 0; offset < originalSource.length; offset++) {
            //debugger;
            while (currentNodeIndex < sortedNodes.length) {
                const node = sortedNodes[currentNodeIndex];
                const [replacementOffset, replacementLength, replacementText] = this.graphData.extractReplacementInfo(node.replacement);
                console.assert(replacementOffset !== null && replacementLength !== null, "Invalid replacement info");

                if (offset < replacementOffset) {
                    // Not in the current node's range
                    break;
                }
                console.log("currentNodeIndex", currentNodeIndex);

                if (offset === replacementOffset) {
                    // Start of the replacement range
                    const isEmpty = replacementLength === 0;
                    parts.push(`<span class="replacement${isEmpty ? ' empty-node' : ''}${node['debug_info']['added_to_component'] ? ' applied' : ''}${node.hasError ? ' error-node' : ''}" data-node-id="${node.id}">`);

                }

                if (offset === replacementOffset + replacementLength) {
                    // End of the replacement range
                    parts.push(`</span>`);
                    currentNodeIndex++;
                    continue;
                }

                break;
            }

            const char = originalSource[offset];

            if (char === '\n') {
                parts.push('<br>');
            } else {
                parts.push(escapeHTML(char));
            }
        }

        return parts.join('');
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

        const [offset, length, replacementText] = this.graphData.extractReplacementInfo(node.replacement);
        if (offset === null || length === null) return;

        // Update replacement info
        this.replacementTextElement.textContent = node.replacement;

        // Compute line number and column number
        let lineNumber = 0;
        for (let i = 0; i < this.graphData.lineOffsets.length; i++) {
            if (offset < this.graphData.lineOffsets[i]) {
                lineNumber = i - 1;
                break;
            }
        }
        if (lineNumber === 0 && offset >= this.graphData.lineOffsets[this.graphData.lineOffsets.length - 1]) {
            lineNumber = this.graphData.lineOffsets.length - 1;
        }
        if (lineNumber < 0) lineNumber = 0;
        const columnNumber = offset - this.graphData.lineOffsets[lineNumber];

        // Get three lines before and after
        const previewContent = this.graphData.getThreeLinePreview(lineNumber, columnNumber, length, replacementText);

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
            const [sourceOffset, sourceLength, sourceReplacementText] = this.graphData.extractReplacementInfo(sourceNode.replacement);
            const sourceOriginalText = sourceOffset !== null && sourceLength !== null
                ? this.graphData.originalSource.substring(sourceOffset, sourceOffset + sourceLength)
                : '';
            const sourceEscapedOriginal = escapeHTML(sourceOriginalText);
            const sourceEscapedReplacement = escapeHTML(sourceReplacementText);
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
            const fromElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${link.source}"]`);
            const toElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${link.target}"]`);
            let sourceNode = nodeMap[link.source];
            ArrowDrawer.drawArrow(fromElem, toElem, this.svgContainer, sourceNode?.is_deref_node === true, false);
        });

        this.graphData.nodes.forEach(node => {
            if (node.is_data_change !== true) return;
            let source = node.data_change_lhs;
            let target = node.id;
            if (arrowConfig === 'selected') {
                if (source !== selectedNodeId && target !== selectedNodeId) {
                    return;
                }
            }
            const fromElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${source}"]`);
            const toElem = this.sourceCodeContainer.querySelector(`.replacement[data-node-id="${target}"]`);
            ArrowDrawer.drawArrow(fromElem, toElem, this.svgContainer, false, true);
        });
    }
}

/**
 * ArrowDrawer is responsible for rendering arrows between DOM elements using SVG.
 */
class ArrowDrawer {
    /**
     * Draws an arrow between two DOM elements within the specified SVG container.
     * @param {HTMLElement} fromElem - The starting element.
     * @param {HTMLElement} toElem - The ending element.
     * @param {SVGSVGElement} svgContainer - The SVG container to append the arrow to.
     * @param {boolean} dashed - Whether the arrow should be dashed.
     * @param {boolean} dotted - Whether the arrow should be dotted.
     */
    static drawArrow(fromElem, toElem, svgContainer, dashed, dotted) {
        if (!fromElem || !toElem) return;

        const color = 'rgba(98, 0, 238, 0.86)';
        // Get bounding rectangles
        const fromRect = fromElem.getBoundingClientRect();
        const toRect = toElem.getBoundingClientRect();
        const containerRect = svgContainer.getBoundingClientRect();

        // Calculate center points relative to the SVG container
        const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toX = toRect.left + toRect.width / 2 - containerRect.left;
        const toY = toRect.top + toRect.height / 2 - containerRect.top;

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

        // Create the line (arrow)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        line.setAttribute('stroke', color); // Arrow color
        if (dashed) {
            line.setAttribute('stroke-dasharray', '4');
        }
        if (dotted) {
            line.setAttribute('stroke-dasharray', '6 3 2 3');
        }
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrowhead)');

        svgContainer.appendChild(line);
        return line;
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
 * Draws an arrow between two DOM elements using SVG.
 *
 * @param {HTMLElement} fromElem - The starting element.
 * @param {HTMLElement} toElem - The ending element.
 * @param {SVGSVGElement} svgContainer - The SVG container to append the arrow to.
 * @param {boolean} dashed - Whether the arrow should be dashed.
 * @param {boolean} dotted - Whether the arrow should be dotted.
 * @returns {SVGLineElement} The created SVG line element representing the arrow.
 */
function drawArrow(fromElem, toElem, svgContainer, dashed, dotted) {
    // This function is now obsolete as ArrowDrawer handles arrow drawing
    ArrowDrawer.drawArrow(fromElem, toElem, svgContainer, dashed, dotted);
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
        const graphId = url.searchParams.get('g') || 'graph';

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
