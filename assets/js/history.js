/**
 * History Module
 * Undo/Redo functionality with infinite history
 */

const MarkdownHistory = (function() {
    'use strict';
    
    let history = [];
    let currentIndex = -1;
    let isRestoring = false;
    const maxSize = 100;
    
    /**
     * Initialize history module
     */
    function init() {
        // Load saved history
        loadHistory();
        
        // Add initial state
        const content = MarkdownPro.getContent();
        if (content) {
            add(content);
        }
        
        updateButtons();
    }
    
    /**
     * Add state to history
     */
    function add(content) {
        if (isRestoring) return;
        
        // Don't add if content is same as current
        if (currentIndex >= 0 && history[currentIndex] === content) {
            return;
        }
        
        // Remove everything after current index
        history = history.slice(0, currentIndex + 1);
        
        // Add new state
        history.push(content);
        currentIndex++;
        
        // Trim if too large
        if (history.length > maxSize) {
            const overflow = history.length - maxSize;
            history = history.slice(overflow);
            currentIndex -= overflow;
        }
        
        updateButtons();
        saveHistory();
    }
    
    /**
     * Undo last change
     */
    function undo() {
        if (currentIndex > 0) {
            currentIndex--;
            restore(history[currentIndex]);
            updateButtons();
            saveHistory();
        }
    }
    
    /**
     * Redo last undone change
     */
    function redo() {
        if (currentIndex < history.length - 1) {
            currentIndex++;
            restore(history[currentIndex]);
            updateButtons();
            saveHistory();
        }
    }
    
    /**
     * Restore content from history
     */
    function restore(content) {
        isRestoring = true;
        MarkdownPro.state.editor.value = content;
        MarkdownPro.updateStats();
        MarkdownPro.updateLineNumbers();
        
        if (typeof MarkdownPreview !== 'undefined') {
            MarkdownPreview.update();
        }
        
        setTimeout(() => {
            isRestoring = false;
        }, 100);
    }
    
    /**
     * Update undo/redo buttons state
     */
    function updateButtons() {
        const undoBtn = document.querySelector('[data-action="undo"]');
        const redoBtn = document.querySelector('[data-action="redo"]');
        
        if (undoBtn) {
            undoBtn.disabled = currentIndex <= 0;
        }
        
        if (redoBtn) {
            redoBtn.disabled = currentIndex >= history.length - 1;
        }
    }
    
    /**
     * Clear history
     */
    function clear() {
        history = [];
        currentIndex = -1;
        updateButtons();
        saveHistory();
    }
    
    /**
     * Save history to localStorage
     */
    function saveHistory() {
        try {
            const data = {
                history: history,
                currentIndex: currentIndex
            };
            localStorage.setItem(
                MarkdownPro.config.storagePrefix + 'history',
                JSON.stringify(data)
            );
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }
    
    /**
     * Load history from localStorage
     */
    function loadHistory() {
        try {
            const saved = localStorage.getItem(MarkdownPro.config.storagePrefix + 'history');
            if (saved) {
                const data = JSON.parse(saved);
                history = data.history || [];
                currentIndex = data.currentIndex || -1;
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }
    
    // Public API
    return {
        init,
        add,
        undo,
        redo,
        clear
    };
})();