/**
 * Preview Module
 * Markdown rendering and syntax highlighting
 */

const MarkdownPreview = (function() {
    'use strict';
    
    let updateTimer = null;
    
    /**
     * Initialize preview
     */
    function init() {
        // Configure marked
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                gfm: true,
                breaks: true,
                sanitize: false,
                smartLists: true,
                smartypants: true,
                highlight: function(code, lang) {
                    if (lang && typeof Prism !== 'undefined' && Prism.languages[lang]) {
                        try {
                            return Prism.highlight(code, Prism.languages[lang], lang);
                        } catch (e) {
                            console.warn('Syntax highlighting failed for language:', lang);
                        }
                    }
                    return code;
                }
            });
        }
        
        // Initial render
        update();
    }
    
    /**
     * Update preview (debounced)
     */
    function update() {
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
        
        updateTimer = setTimeout(() => {
            render();
        }, MarkdownPro.config.debounceDelay);
    }
    
    /**
     * Render markdown to HTML
     */
    function render() {
        const content = MarkdownPro.getContent();
        const preview = MarkdownPro.state.preview;
        
        if (!content.trim()) {
            preview.innerHTML = `
                <div class="preview-placeholder">
                    <h1>Welcome to Markdown Pro</h1>
                    <p>Start typing in the editor to see your content rendered here.</p>
                </div>
            `;
            return;
        }
        
        try {
            // Render markdown
            let html = marked.parse(content);
            
            // Sanitize HTML
            html = sanitizeHTML(html);
            
            // Update preview
            preview.innerHTML = html;
            
            // Apply syntax highlighting
            if (typeof Prism !== 'undefined') {
                preview.querySelectorAll('pre code').forEach((block) => {
                    Prism.highlightElement(block);
                });
            }
            
            // Update TOC
            if (typeof MarkdownTOC !== 'undefined') {
                MarkdownTOC.update();
            }
            
            // Process images
            processImages();
            
            // Process links
            processLinks();
            
        } catch (e) {
            console.error('Preview render error:', e);
            preview.innerHTML = `
                <div style="color: var(--error-color); padding: 2rem;">
                    <h3>Preview Error</h3>
                    <p>${e.message}</p>
                </div>
            `;
        }
    }
    
    /**
     * Sanitize HTML to prevent XSS
     */
    function sanitizeHTML(html) {
        const allowedTags = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'strong', 'em', 'u', 's', 'del', 'ins',
            'code', 'pre',
            'ul', 'ol', 'li',
            'blockquote',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'a', 'img',
            'div', 'span'
        ];
        
        // Basic sanitization - remove script tags and event handlers
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        html = html.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
        
        return html;
    }
    
    /**
     * Process images
     */
    function processImages() {
        const preview = MarkdownPro.state.preview;
        preview.querySelectorAll('img').forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            // Handle broken images
            img.onerror = function() {
                this.style.display = 'none';
                const alt = this.alt || 'Image failed to load';
                const placeholder = document.createElement('div');
                placeholder.style.cssText = 'padding: 2rem; background: var(--bg-tertiary); border-radius: 4px; text-align: center; color: var(--text-secondary);';
                placeholder.textContent = alt;
                this.parentNode.insertBefore(placeholder, this);
            };
        });
    }
    
    /**
     * Process links
     */
    function processLinks() {
        const preview = MarkdownPro.state.preview;
        preview.querySelectorAll('a').forEach(link => {
            // Open external links in new tab
            if (link.hostname && link.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
    
    /**
     * Get rendered HTML
     */
    function getHTML() {
        return MarkdownPro.state.preview.innerHTML;
    }
    
    // Public API
    return {
        init,
        update,
        render,
        getHTML
    };
})();