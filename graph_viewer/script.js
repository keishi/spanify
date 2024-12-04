
document.addEventListener("DOMContentLoaded", () => {
    let url = new URL(window.location);
    let graphId = url.searchParams.get('g') || 'graph';
    // Fetch the graph JSON data
    // Replace 'graph.json' with your actual JSON file path or endpoint
    fetch(`graphs/${graphId}.json`)
        .then(response => response.json())
        .then(data => initializeInspector(data))
        .catch(error => console.error('Error fetching JSON:', error));
});

/**
 * Initializes the inspector UI with the fetched graph data.
 * @param {Object} graphData - The graph JSON data.
 */
function initializeInspector(graphData) {
    const originalSource = graphData.source.content;
    const nodes = graphData.nodes;
    const links = graphData.links;

    // Split source code into lines
    const sourceLines = originalSource.split('\n');
    // Compute cumulative offsets for each line
    const lineOffsets = [0];
    for (let i = 0; i < sourceLines.length; i++) {
        // +1 for the newline character
        lineOffsets.push(lineOffsets[i] + sourceLines[i].length + 1);
    }

    // Create mappings for incoming and outgoing links
    const incoming = {};
    const outgoing = {};
    nodes.forEach(node => {
        incoming[node.id] = [];
        outgoing[node.id] = [];
    });
    links.forEach(link => {
        if (outgoing[link.source]) {
            outgoing[link.source].push(link.target);
        } else {
            outgoing[link.source] = [link.target];
        }
        if (incoming[link.target]) {
            incoming[link.target].push(link.source);
        } else {
            incoming[link.target] = [link.source];
        }
    });

    // Create a mapping from node ID to node object
    const nodeMap = {};
    nodes.forEach(node => {
        nodeMap[node.id] = node;
    });

    // Process and annotate the source code
    const annotatedSource = annotateSourceCode(originalSource, nodes);
    document.getElementById('source-code').innerHTML = annotatedSource;

    let showArrows = '';

    document.getElementById('arrow-config').addEventListener('change', (event) => {
        showArrows = event.target.value;
        console.log('showArrows', showArrows);
        updateArrows();
    });

    function updateArrows() {
        let selectedNodeId = parseInt(document.getElementById("inspector").dataset.selectedNodeId, 10);
        const svgContainer = document.getElementById('arrow-container');
        svgContainer.innerHTML = "";
        if (showArrows !== "") {
            links.forEach((link) => {
                if (showArrows === 'selected') {
                    if (link.source !== selectedNodeId && link.target !== selectedNodeId) {
                        return;
                    }
                }
                const fromElem = document.querySelector(`#source-code span[data-node-id="${link.source}"]`);
                const toElem = document.querySelector(`#source-code span[data-node-id="${link.target}"]`);
                let sourceNode = nodeMap[link.source];
                drawArrow(fromElem, toElem, svgContainer, sourceNode['is_deref_node'] === '1', false);
            });
            nodes.forEach((node) => {
                if (node['is_data_change'] !== '1') {
                    return;
                }
                let source = node['data_change_lhs'];
                let target = node['id'];
                if (showArrows === 'selected') {
                    if (source !== selectedNodeId && target !== selectedNodeId) {
                        return;
                    }
                }
                const fromElem = document.querySelector(`#source-code span[data-node-id="${source}"]`);
                const toElem = document.querySelector(`#source-code span[data-node-id="${target}"]`);
                drawArrow(fromElem, toElem, svgContainer, false, true);
            });
        }
    }

    updateArrows();

    // Attach click handlers to all replacement spans
    document.querySelectorAll('.replacement').forEach(span => {
        span.addEventListener('click', handleReplacementClick);
    });

    // Optional: Handle highlighting of selected replacement
    document.querySelectorAll('.replacement').forEach(span => {
        span.addEventListener('click', function() {
            // Remove highlight from all spans
            document.querySelectorAll('.replacement').forEach(s => s.classList.remove('highlight'));
            // Add highlight to the clicked span
            this.classList.add('highlight');
        });
    });

    let hoverNodeDisabledUntilPointerMove = false;

    /**
     * Handles click events on replacement spans.
     * Updates the inspector sidebar with node details and previews.
     * @param {Event} event - The click event.
     */
    function handleReplacementClick(event) {
        const nodeId = event.target.getAttribute('data-node-id');
        if (!nodeId) return;
        selectNode(nodeId);
    }
    function selectNode(nodeId) {
        nodeId = parseInt(nodeId, 10);
        const node = nodeMap[nodeId];
        if (!node) return;

        document.getElementById("inspector").dataset.selectedNodeId = nodeId;

        updateArrows();

        hoverNodeDisabledUntilPointerMove = true;
        document.getElementById("inspector").addEventListener("pointermove", () => {
            hoverNodeDisabledUntilPointerMove = false;
        }, {
            once: true
        })

        const [offset, length, replacementText] = extractReplacementInfo(node.replacement);
        if (offset === null || length === null) return;

        // Update replacement info
        document.getElementById('replacement-text').textContent = node.replacement;

        // Compute line number and column number
        let lineNumber = 0;
        for (let i = 0; i < lineOffsets.length; i++) {
            if (offset < lineOffsets[i]) {
                lineNumber = i - 1;
                break;
            }
        }
        if (lineNumber === 0 && offset >= lineOffsets[lineOffsets.length - 1]) {
            lineNumber = lineOffsets.length - 1;
        }
        if (lineNumber < 0) lineNumber = 0;
        const columnNumber = offset - lineOffsets[lineNumber];

        // Get three lines before and after
        const previewContent = getThreeLinePreview(lineNumber, columnNumber, length, replacementText);

        // Update 'replacement-preview' div
        document.getElementById('replacement-preview').innerHTML = '<pre>' + previewContent + '</pre>';

        // Update incoming nodes
        const incomingList = document.getElementById('incoming-list');
        incomingList.innerHTML = '';
        if (incoming[node.id].length === 0) {
            incomingList.innerHTML = '<li>No incoming nodes.</li>';
        } else {
            incoming[node.id].forEach(sourceId => {
                const sourceNode = nodeMap[sourceId];
                if (!sourceNode) return;
                const [sourceOffset, sourceLength, sourceReplacementText] = extractReplacementInfo(sourceNode.replacement);
                const sourceOriginalText = originalSource.substring(sourceOffset, sourceOffset + sourceLength);
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
                listItem.addEventListener('click', () => {
                    selectNode(sourceId);
                });
                listItem.addEventListener('pointerenter', () => {
                    if (hoverNodeDisabledUntilPointerMove) {
                        return;
                    }
                    highlightNode(sourceId);
                });
                listItem.addEventListener('pointerleave', () => {
                    if (hoverNodeDisabledUntilPointerMove) {
                        return;
                    }
                    highlightNode(nodeId);
                });
                incomingList.appendChild(listItem);
            });
        }

        // Update outgoing nodes
        const outgoingList = document.getElementById('outgoing-list');
        outgoingList.innerHTML = '';
        if (outgoing[node.id].length === 0) {
            outgoingList.innerHTML = '<li>No outgoing nodes.</li>';
        } else {
            outgoing[node.id].forEach(targetId => {
                const targetNode = nodeMap[targetId];
                if (!targetNode) return;
                const [targetOffset, targetLength, targetReplacementText] = extractReplacementInfo(targetNode.replacement);
                const targetOriginalText = originalSource.substring(targetOffset, targetOffset + targetLength);
                const targetEscapedOriginal = escapeHTML(targetOriginalText);
                const targetEscapedReplacement = escapeHTML(targetReplacementText);
                const preview = `<span class="preview-before">${targetEscapedOriginal}</span> → <span class="preview-after">${targetEscapedReplacement}</span>`;
                
                const listItem = document.createElement('li');
                listItem.innerHTML = preview;
                listItem.classList.add('list-item');
                if (!targetEscapedOriginal) {
                    listItem.querySelector(".preview-before").classList.add("null");
                }
                if (!targetEscapedReplacement) {
                    listItem.querySelector(".preview-after").classList.add("null");
                }
                listItem.addEventListener('click', () => {
                    selectNode(targetId);
                });
                listItem.addEventListener('pointerenter', () => {
                    if (hoverNodeDisabledUntilPointerMove) {
                        return;
                    }
                    highlightNode(targetId);
                });
                listItem.addEventListener('pointerleave', () => {
                    if (hoverNodeDisabledUntilPointerMove) {
                        return;
                    }
                    highlightNode(nodeId);
                });
                outgoingList.appendChild(listItem);
            });
        }

        document.getElementById('node-internals').textContent = JSON.stringify(node, null, 2);
    }

    /**
     * Navigates to a specific node's replacement in the source code.
     * @param {number} nodeId - The ID of the node to navigate to.
     */
    function navigateToNode(nodeId) {
        nodeId = parseInt(nodeId, 10);
        const selector = `.replacement[data-node-id="${nodeId}"]`;
        const targetSpan = document.querySelector(selector);
        if (targetSpan) {
            targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function highlightNode(nodeId) {
        nodeId = parseInt(nodeId, 10);
        const selector = `.replacement[data-node-id="${nodeId}"]`;
        document.querySelectorAll(".highlight").forEach(e=>e.classList.remove('highlight'));
        const targetSpan = document.querySelector(selector);
        if (targetSpan) {
            targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetSpan.classList.add('highlight');
        }
    }

    function generateNodeTypeHTML(node) {
        let parts = [];
        parts.push(`<div class="node-type-icons">`);
        if (node['is_buffer'] === '1') {
            parts.push(`<span class="node-type is-buffer" title="is_buffer">B</span>`);
        }
        if (node['debug_info']['original_size_info_available'] === '1') {
            parts.push(`<span class="node-type" title="original_size_info_available">S</span>`);
        }
        if (node['visited']) {
            parts.push(`<span class="node-type" title="visited">V</span>`);
        }
        if (node['is_deref_node'] === '1') {
            parts.push(`<span class="node-type" title="is_deref_node">DR</span>`);
        }
        if (node['is_data_change'] === '1') {
            parts.push(`<span class="node-type" title="is_data_change">DC</span>`);
        }
        parts.push(`</div>`);
        return parts.join('');
    }

    /**
     * Annotates the source code by wrapping replacement ranges with clickable spans.
     * @param {string} source - The original source code.
     * @param {Array} nodes - The list of node objects.
     * @returns {string} - The annotated source code as HTML.
     */
    function annotateSourceCode(source, nodes) {
        // Sort nodes by offset ascending to process from start to end
        const sortedNodes = nodes.slice().sort((a, b) => {
            const [offsetA] = extractReplacementInfo(a.replacement);
            const [offsetB] = extractReplacementInfo(b.replacement);
            return offsetA - offsetB;
        });
    
        let annotatedSource = '';
        let currentIndex = 0;
    
        sortedNodes.forEach(node => {
            const [offset, length, replacementText] = extractReplacementInfo(node.replacement);
            if (offset === null || length === null) return;
    
            // Ensure the offset and length are within the source code bounds
            if (offset < 0 || offset + length > source.length) {
                console.warn(`Invalid offset/length for node ID ${node.id}`);
                return;
            }
    
            // Append the text before the replacement, escaped
            const textBefore = source.substring(currentIndex, offset);
            annotatedSource += escapeHTML(textBefore);
    
            // Extract the text to be replaced
            const textToReplace = source.substring(offset, offset + length);
    
            // Escape HTML in textToReplace
            const escapedTextToReplace = escapeHTML(textToReplace);
    
            // Determine if the textToReplace is empty
            const isEmpty = escapedTextToReplace.trim() === '';
    
            // Create the replacement span
            let replacementSpan = `<span class="replacement${isEmpty ? ' empty-node' : ''}${node['debug_info']['added_to_component'] ? ' applied' : ''}" data-node-id="${node.id}">`;
            replacementSpan += generateNodeTypeHTML(node);
            if (isEmpty) {
                // If replacementText is empty, the span will be empty and CSS will insert "∅"
                replacementSpan += `</span>`;
            } else {
                // Insert the escaped replacementText
                replacementSpan += `${escapedTextToReplace}</span>`;
            }
    
            annotatedSource += replacementSpan;
    
            // Update the current index
            currentIndex = offset + length;
        });
    
        // Append the remaining text after the last replacement, escaped
        if (currentIndex < source.length) {
            const remainingText = source.substring(currentIndex);
            annotatedSource += escapeHTML(remainingText);
        }
    
        // Optionally, replace line breaks with <br> for HTML display
        // annotatedSource = annotatedSource.replace(/\n/g, '<br>');
    
        return annotatedSource;
    }
    
    // Helper function to escape HTML characters
    function escapeHTML(str) {
        const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return str.replace(/[&<>"']/g, match => replacements[match]);
    }

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
     * Extracts offset, length, and replacement text from the replacement string.
     * Expected format: "r:::/path/to/file:::offset:::length:::replacement_text"
     * @param {string} replacementStr - The replacement string.
     * @returns {Array} - [offset, length, replacementText]
     */
    function extractReplacementInfo(replacementStr) {
        try {
            const parts = replacementStr.split(":::");
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
    function getThreeLinePreview(lineNumber, columnNumber, length, replacementText) {
        // Access sourceLines from the outer scope
        const previewLines = sourceLines.slice(Math.max(0, lineNumber - 3), Math.min(sourceLines.length, lineNumber + 4));
        const targetLineIndex = Math.min(3, lineNumber); // Adjust index based on slicing

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
 * Draws an arrow between two DOM elements.
 *
 * @param {HTMLElement} fromElem - The starting element.
 * @param {HTMLElement} toElem - The ending element.
 * @param {SVGSVGElement} svgContainer - The SVG container to append the arrow to.
 * @returns {SVGLineElement} The created SVG line element representing the arrow.
 */
function drawArrow(fromElem, toElem, svgContainer, dashed, dotted) {
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
  
