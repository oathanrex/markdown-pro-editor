/**
 * Autosave Module
 * Silent autosave with debouncing
 */

const MarkdownAutosave = (function() {
    'use strict';
    
    let autosaveTimer = null;
    let lastSaved = null;
    
    /**
     * Initialize autosave
     */
    function init() {
        startAutosave();
    }
    
    /**
     * Start autosave timer
     */
    function startAutosave() {
        if (autosaveTimer) {
            clearInterval(autosaveTimer);
        }
        
        autosaveTimer = setInterval(() => {
            save(true); // Silent save
        }, MarkdownPro.config.autosaveInterval);
    }
    
    /**
     * Save content
     */
    function save(silent = false) {
        const content = MarkdownPro.getContent();
        
        // Don't save if content hasn't changed
        if (content === lastSaved) {
            return;
        }
        
        try {
            localStorage.setItem(
                MarkdownPro.config.storagePrefix + 'content',
                content
            );
            
            lastSaved = content;
            MarkdownPro.state.isModified = false;
            
            // Show toast only if not silent
            if (!silent && typeof MarkdownUI !== 'undefined') {
                MarkdownUI.showToast('Document saved', 'success');
            }
        } catch (e) {
            console.error('Failed to save:', e);
            if (typeof MarkdownUI !== 'undefined') {
                MarkdownUI.showToast('Failed to save document', 'error');
            }
        }
    }
    
    /**
     * Stop autosave
     */
    function stop() {
        if (autosaveTimer) {
            clearInterval(autosaveTimer);
            autosaveTimer = null;
        }
    }
    
    // Public API
    return {
        init,
        save,
        stop
    };
})();