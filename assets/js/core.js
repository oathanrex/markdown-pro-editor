/**
 * Core Application Module
 * Main initialization and state management
 */

const MarkdownPro = (function() {
    'use strict';
    
    // Application state
    const state = {
        editor: null,
        preview: null,
        currentFile: null,
        isModified: false,
        vimMode: false,
        theme: 'light',
        splitterPosition: 50,
        tocVisible: false,
        fullscreen: false
    };
    
    // Configuration
    const config = {
        autosaveInterval: 30000, // 30 seconds
        maxHistorySize: 100,
        debounceDelay: 300,
        storagePrefix: 'mdpro_'
    };
    
    /**
     * Initialize application
     */
    function init() {
        // Get DOM elements
        state.editor = document.getElementById('editor');
        state.preview = document.getElementById('preview');
        
        if (!state.editor || !state.preview) {
            console.error('Required elements not found');
            return;
        }
        
        // Load saved state
        loadState();
        
        // Initialize modules
        initModules();
        
        // Load saved content
        loadSavedContent();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Markdown Pro initialized successfully');
    }
    
    /**
     * Initialize all modules
     */
    function initModules() {
        if (typeof MarkdownUI !== 'undefined') MarkdownUI.init();
        if (typeof MarkdownHistory !== 'undefined') MarkdownHistory.init();
        if (typeof MarkdownAutosave !== 'undefined') MarkdownAutosave.init();
        if (typeof MarkdownPreview !== 'undefined') MarkdownPreview.init();
        if (typeof MarkdownTOC !== 'undefined') MarkdownTOC.init();
        if (typeof MarkdownActions !== 'undefined') MarkdownActions.init();
        if (typeof MarkdownShortcuts !== 'undefined') MarkdownShortcuts.init();
        if (typeof MarkdownFile !== 'undefined') MarkdownFile.init();
        if (typeof MarkdownFullscreen !== 'undefined') MarkdownFullscreen.init();
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Editor input
        state.editor.addEventListener('input', handleEditorInput);
        
        // Editor scroll sync
        state.editor.addEventListener('scroll', handleEditorScroll);
        
        // Window events
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('resize', handleResize);
        
        // Vim mode toggle
        const vimToggle = document.getElementById('vim-toggle');
        if (vimToggle) {
            vimToggle.checked = state.vimMode;
            vimToggle.addEventListener('change', toggleVimMode);
        }
    }
    
    /**
     * Handle editor input
     */
    function handleEditorInput(e) {
        state.isModified = true;
        updateStats();
        updateLineNumbers();
        
        // Trigger preview update (debounced)
        if (typeof MarkdownPreview !== 'undefined') {
            MarkdownPreview.update();
        }
        
        // Add to history
        if (typeof MarkdownHistory !== 'undefined') {
            MarkdownHistory.add(e.target.value);
        }
    }
    
    /**
     * Handle editor scroll
     */
    function handleEditorScroll() {
        updateLineNumbers();
    }
    
    /**
     * Handle before unload
     */
    function handleBeforeUnload(e) {
        if (state.isModified) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    }
    
    /**
     * Handle window resize
     */
    function handleResize() {
        updateLineNumbers();
    }
    
    /**
     * Update editor statistics
     */
    function updateStats() {
        const text = state.editor.value;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        const readTime = Math.ceil(words / 200); // Average reading speed
        
        document.getElementById('word-count').textContent = `Words: ${words}`;
        document.getElementById('char-count').textContent = `Chars: ${chars}`;
        document.getElementById('read-time').textContent = `Read: ${readTime}m`;
    }
    
    /**
     * Update line numbers
     */
    function updateLineNumbers() {
        const lineNumbersEl = document.getElementById('line-numbers');
        if (!lineNumbersEl) return;
        
        const lines = state.editor.value.split('\n').length;
        const currentLines = lineNumbersEl.children.length;
        
        if (lines !== currentLines) {
            lineNumbersEl.innerHTML = '';
            for (let i = 1; i <= lines; i++) {
                const span = document.createElement('span');
                span.textContent = i;
                lineNumbersEl.appendChild(span);
            }
        }
        
        // Sync scroll
        lineNumbersEl.scrollTop = state.editor.scrollTop;
    }
    
    /**
     * Toggle Vim mode
     */
    function toggleVimMode(e) {
        state.vimMode = e.target.checked;
        document.body.setAttribute('data-vim-mode', state.vimMode);
        saveState();
        
        if (typeof MarkdownUI !== 'undefined') {
            MarkdownUI.showToast(
                state.vimMode ? 'Vim mode enabled' : 'Vim mode disabled',
                'info'
            );
        }
    }
    
    /**
     * Load saved state from localStorage
     */
    function loadState() {
        try {
            const saved = localStorage.getItem(config.storagePrefix + 'state');
            if (saved) {
                const parsed = JSON.parse(saved);
                state.theme = parsed.theme || 'light';
                state.vimMode = parsed.vimMode || false;
                state.splitterPosition = parsed.splitterPosition || 50;
                state.tocVisible = parsed.tocVisible || false;
                
                // Apply theme
                document.body.setAttribute('data-theme', state.theme);
                document.body.setAttribute('data-vim-mode', state.vimMode);
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
    
    /**
     * Save state to localStorage
     */
    function saveState() {
        try {
            const stateToSave = {
                theme: state.theme,
                vimMode: state.vimMode,
                splitterPosition: state.splitterPosition,
                tocVisible: state.tocVisible
            };
            localStorage.setItem(
                config.storagePrefix + 'state',
                JSON.stringify(stateToSave)
            );
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }
    
    /**
     * Load saved content
     */
    function loadSavedContent() {
        try {
            const content = localStorage.getItem(config.storagePrefix + 'content');
            if (content) {
                state.editor.value = content;
                updateStats();
                updateLineNumbers();
                
                if (typeof MarkdownPreview !== 'undefined') {
                    MarkdownPreview.update();
                }
            }
        } catch (e) {
            console.error('Failed to load content:', e);
        }
    }
    
    /**
     * Save content to localStorage
     */
    function saveContent() {
        try {
            localStorage.setItem(
                config.storagePrefix + 'content',
                state.editor.value
            );
            state.isModified = false;
        } catch (e) {
            console.error('Failed to save content:', e);
        }
    }
    
    /**
     * Get current editor content
     */
    function getContent() {
        return state.editor.value;
    }
    
    /**
     * Set editor content
     */
    function setContent(content) {
        state.editor.value = content;
        state.isModified = true;
        updateStats();
        updateLineNumbers();
        
        if (typeof MarkdownPreview !== 'undefined') {
            MarkdownPreview.update();
        }
        
        if (typeof MarkdownHistory !== 'undefined') {
            MarkdownHistory.add(content);
        }
    }
    
    /**
     * Clear editor content
     */
    function clearContent() {
        state.editor.value = '';
        state.isModified = false;
        state.currentFile = null;
        updateStats();
        updateLineNumbers();
        
        if (typeof MarkdownPreview !== 'undefined') {
            MarkdownPreview.update();
        }
    }
    
    // Public API
    return {
        init,
        state,
        config,
        getContent,
        setContent,
        clearContent,
        saveContent,
        saveState,
        updateStats,
        updateLineNumbers
    };
})();