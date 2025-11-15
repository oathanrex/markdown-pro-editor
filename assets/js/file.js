/**
 * File Module
 * Import, export, drag & drop
 */

const MarkdownFile = (function() {
    'use strict';
    
    /**
     * Initialize file module
     */
    function init() {
        setupDragDrop();
        setupFileInput();
    }
    
    /**
     * Setup drag and drop
     */
    function setupDragDrop() {
        const editor = MarkdownPro.state.editor;
        
        editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            editor.style.borderColor = 'var(--accent-color)';
        });
        
        editor.addEventListener('dragleave', (e) => {
            e.preventDefault();
            editor.style.borderColor = '';
        });
        
        editor.addEventListener('drop', (e) => {
            e.preventDefault();
            editor.style.borderColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                loadFile(files[0]);
            }
        });
    }
    
    /**
     * Setup file input
     */
    function setupFileInput() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    loadFile(files[0]);
                }
                fileInput.value = ''; // Reset
            });
        }
    }
    
    /**
     * New file
     */
    function newFile() {
        if (MarkdownPro.state.isModified) {
            if (!confirm('You have unsaved changes. Create new file?')) {
                return;
            }
        }
        
        MarkdownPro.clearContent();
        
        if (typeof MarkdownUI !== 'undefined') {
            MarkdownUI.showToast('New file created', 'success');
        }
    }
    
    /**
     * Import file
     */
    function importFile() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    }
    
    /**
     * Load file
     */
    function loadFile(file) {
        const validTypes = ['text/markdown', 'text/plain', 'text/x-markdown'];
        const validExtensions = ['.md', '.txt', '.markdown'];
        
        const isValidType = validTypes.includes(file.type) || 
                           validExtensions.some(ext => file.name.endsWith(ext));
        
        if (!isValidType) {
            if (typeof MarkdownUI !== 'undefined') {
                MarkdownUI.showToast('Invalid file type. Please select a Markdown file.', 'error');
            }
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            MarkdownPro.setContent(e.target.result);
            MarkdownPro.state.currentFile = file.name;
            
            if (typeof MarkdownUI !== 'undefined') {
                MarkdownUI.showToast(`File imported successfully: ${file.name}`, 'success');
            }
        };
        
        reader.onerror = () => {
            if (typeof MarkdownUI !== 'undefined') {
                MarkdownUI.showToast('Failed to read file', 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Export markdown
     */
    function exportMarkdown() {
        const content = MarkdownPro.getContent();
        const filename = MarkdownPro.state.currentFile || 'document.md';
        
        downloadFile(content, filename, 'text/markdown');
        
        if (typeof MarkdownUI !== 'undefined') {
            MarkdownUI.showToast('Markdown exported', 'success');
        }
    }
    
    /**
     * Export HTML
     */
    function exportHTML() {
        const content = MarkdownPro.getContent();
        
        if (!content.trim()) {
            if (typeof MarkdownUI !== 'undefined') {
                MarkdownUI.showToast('Nothing to export', 'warning');
            }
            return;
        }
        
        const html = generateHTML(content);
        const filename = (MarkdownPro.state.currentFile || 'document').replace(/\.md$/, '') + '.html';
        
        downloadFile(html, filename, 'text/html');
        
        if (typeof MarkdownUI !== 'undefined') {
            MarkdownUI.showToast('HTML exported', 'success');
        }
    }
    
    /**
     * Generate complete HTML document
     */
    function generateHTML(markdown) {
        const theme = MarkdownPro.state.theme;
        const renderedHTML = typeof MarkdownPreview !== 'undefined' 
            ? MarkdownPreview.getHTML() 
            : marked.parse(markdown);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            color: ${theme === 'dark' ? '#d4d4d4' : '#24292e'};
            background-color: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
        }
        h1, h2, h3, h4, h5, h6 {
            font-weight: 600;
            line-height: 1.3;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        a { color: ${theme === 'dark' ? '#3794ff' : '#007bff'}; text-decoration: none; }
        a:hover { text-decoration: underline; }
        code {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
            font-size: 0.9em;
            padding: 0.2em 0.4em;
            background-color: ${theme === 'dark' ? '#2d2d30' : '#f6f8fa'};
            border-radius: 3px;
        }
        pre {
            padding: 1rem;
            overflow-x: auto;
            background-color: ${theme === 'dark' ? '#1e1e1e' : '#f6f8fa'};
            border: 1px solid ${theme === 'dark' ? '#3e3e42' : '#e1e4e8'};
            border-radius: 4px;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            margin: 0;
            padding-left: 1em;
            border-left: 4px solid ${theme === 'dark' ? '#3e3e42' : '#dfe2e5'};
            background-color: ${theme === 'dark' ? '#2d2d30' : '#f6f8fa'};
            padding: 0.5em 1em;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        table th, table td {
            border: 1px solid ${theme === 'dark' ? '#3e3e42' : '#d1d5da'};
            padding: 0.5em 1em;
            text-align: left;
        }
        table th {
            background-color: ${theme === 'dark' ? '#252526' : '#f6f8fa'};
            font-weight: 600;
        }
        table tr:nth-child(even) {
            background-color: ${theme === 'dark' ? '#252526' : '#f6f8fa'};
        }
        img {
            max-width: 100%;
            height: auto;
        }
        @media print {
            body { max-width: 100%; padding: 1rem; }
        }
    </style>
</head>
<body>
${renderedHTML}
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
</body>
</html>`;
    }
    
    /**
     * Download file
     */
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Public API
    return {
        init,
        newFile,
        importFile,
        exportMarkdown,
        exportHTML
    };
})();