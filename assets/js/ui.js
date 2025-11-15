/**
 * UI Module
 * Handles modals, toasts, and UI interactions
 */

const MarkdownUI = (function() {
    'use strict';
    
    let toastTimeout;
    
    /**
     * Initialize UI module
     */
    function init() {
        setupModalListeners();
        setupSplitter();
        setupToolbarActions();
    }
    
    /**
     * Setup modal event listeners
     */
    function setupModalListeners() {
        // Close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-close');
                closeModal(modalId);
            });
        });
        
        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });
        
        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    closeModal(modal.id);
                });
            }
        });
    }
    
    /**
     * Setup splitter functionality
     */
    function setupSplitter() {
        const splitter = document.getElementById('splitter');
        const editorPane = document.querySelector('.editor-pane');
        const mainContent = document.querySelector('.main-content');
        
        if (!splitter || !editorPane || !mainContent) return;
        
        let isDragging = false;
        let startX = 0;
        let startWidth = 0;
        
        // Load saved position
        const savedPosition = localStorage.getItem(MarkdownPro.config.storagePrefix + 'splitterPosition');
        if (savedPosition) {
            editorPane.style.width = savedPosition + '%';
        }
        
        splitter.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startWidth = editorPane.offsetWidth;
            splitter.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const delta = e.clientX - startX;
            const newWidth = startWidth + delta;
            const maxWidth = mainContent.offsetWidth - 200;
            const minWidth = 200;
            
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                const percentage = (newWidth / mainContent.offsetWidth) * 100;
                editorPane.style.width = percentage + '%';
                MarkdownPro.state.splitterPosition = percentage;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                splitter.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Save position
                localStorage.setItem(
                    MarkdownPro.config.storagePrefix + 'splitterPosition',
                    MarkdownPro.state.splitterPosition
                );
            }
        });
    }
    
    /**
     * Setup toolbar action buttons
     */
    function setupToolbarActions() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                handleAction(action);
            });
        });
    }
    
    /**
     * Handle toolbar actions
     */
    function handleAction(action) {
        switch(action) {
            case 'new':
                if (typeof MarkdownFile !== 'undefined') MarkdownFile.newFile();
                break;
            case 'import':
                if (typeof MarkdownFile !== 'undefined') MarkdownFile.importFile();
                break;
            case 'export-md':
                if (typeof MarkdownFile !== 'undefined') MarkdownFile.exportMarkdown();
                break;
            case 'export-html':
                if (typeof MarkdownFile !== 'undefined') MarkdownFile.exportHTML();
                break;
            case 'save':
                if (typeof MarkdownPro !== 'undefined') {
                    MarkdownPro.saveContent();
                    showToast('Document saved', 'success');
                }
                break;
            case 'undo':
                if (typeof MarkdownHistory !== 'undefined') MarkdownHistory.undo();
                break;
            case 'redo':
                if (typeof MarkdownHistory !== 'undefined') MarkdownHistory.redo();
                break;
            case 'bold':
            case 'italic':
            case 'strikethrough':
            case 'code':
            case 'heading':
            case 'link':
            case 'image':
            case 'list':
            case 'ordered-list':
            case 'table':
            case 'code-block':
            case 'quote':
                if (typeof MarkdownActions !== 'undefined') {
                    MarkdownActions[action]();
                }
                break;
            case 'toggle-toc':
                if (typeof MarkdownTOC !== 'undefined') MarkdownTOC.toggle();
                break;
            case 'fullscreen':
                if (typeof MarkdownFullscreen !== 'undefined') MarkdownFullscreen.toggle();
                break;
            case 'theme':
                toggleTheme();
                break;
        }
    }
    
    /**
     * Open modal
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            
            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    /**
     * Close modal
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close">×</button>
        `;
        
        container.appendChild(toast);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(toast);
        });
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(toast);
        }, 3000);
    }
    
    /**
     * Remove toast
     */
    function removeToast(toast) {
        toast.style.animation = 'slideOutRight 250ms ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 250);
    }
    
    /**
     * Toggle theme
     */
    function toggleTheme() {
        const currentTheme = MarkdownPro.state.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        MarkdownPro.state.theme = newTheme;
        document.body.setAttribute('data-theme', newTheme);
        MarkdownPro.saveState();
        
        showToast(`Switched to ${newTheme} theme`, 'info');
    }
    
    // Public API
    return {
        init,
        openModal,
        closeModal,
        showToast,
        toggleTheme
    };
})();

// Slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);