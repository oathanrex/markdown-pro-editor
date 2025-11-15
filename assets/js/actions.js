/**
 * Actions Module
 * Markdown insertion and formatting
 */

const MarkdownActions = (function() {
    'use strict';
    
    /**
     * Initialize actions
     */
    function init() {
        // Setup modal insert buttons
        setupTableModal();
        setupHeadingModal();
    }
    
    /**
     * Setup table modal
     */
    function setupTableModal() {
        const insertBtn = document.getElementById('table-insert');
        if (insertBtn) {
            insertBtn.addEventListener('click', () => {
                const rows = parseInt(document.getElementById('table-rows').value) || 3;
                const cols = parseInt(document.getElementById('table-cols').value) || 3;
                insertTable(rows, cols);
                MarkdownUI.closeModal('table-modal');
            });
        }
    }
    
    /**
     * Setup heading modal
     */
    function setupHeadingModal() {
        const insertBtn = document.getElementById('heading-insert');
        if (insertBtn) {
            insertBtn.addEventListener('click', () => {
                const level = parseInt(document.getElementById('heading-level').value) || 2;
                heading(level);
                MarkdownUI.closeModal('heading-modal');
            });
        }
    }
    
    /**
     * Get cursor position and selection
     */
    function getCursor() {
        const editor = MarkdownPro.state.editor;
        return {
            start: editor.selectionStart,
            end: editor.selectionEnd,
            text: editor.value.substring(editor.selectionStart, editor.selectionEnd)
        };
    }
    
    /**
     * Insert text at cursor
     */
    function insertText(before, after = '', defaultText = '') {
        const editor = MarkdownPro.state.editor;
        const cursor = getCursor();
        const content = cursor.text || defaultText;
        const newText = before + content + after;
        
        const beforeCursor = editor.value.substring(0, cursor.start);
        const afterCursor = editor.value.substring(cursor.end);
        
        editor.value = beforeCursor + newText + afterCursor;
        
        // Set cursor position
        const newPos = cursor.start + before.length + content.length;
        editor.setSelectionRange(newPos, newPos);
        
        editor.focus();
        
        // Trigger update
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Insert text at line start
     */
    function insertAtLineStart(prefix) {
        const editor = MarkdownPro.state.editor;
        const cursor = getCursor();
        const value = editor.value;
        
        // Find line start
        let lineStart = cursor.start;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }
        
        const beforeLine = value.substring(0, lineStart);
        const afterLine = value.substring(lineStart);
        
        editor.value = beforeLine + prefix + afterLine;
        editor.setSelectionRange(cursor.start + prefix.length, cursor.end + prefix.length);
        editor.focus();
        
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Wrap lines with prefix/suffix
     */
    function wrapLines(prefix, suffix = '') {
        const editor = MarkdownPro.state.editor;
        const cursor = getCursor();
        
        if (!cursor.text) {
            insertText(prefix, suffix, 'text');
            return;
        }
        
        const lines = cursor.text.split('\n');
        const wrapped = lines.map(line => prefix + line + suffix).join('\n');
        
        const beforeCursor = editor.value.substring(0, cursor.start);
        const afterCursor = editor.value.substring(cursor.end);
        
        editor.value = beforeCursor + wrapped + afterCursor;
        editor.setSelectionRange(cursor.start, cursor.start + wrapped.length);
        editor.focus();
        
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Bold
     */
    function bold() {
        insertText('**', '**', 'bold text');
    }
    
    /**
     * Italic
     */
    function italic() {
        insertText('*', '*', 'italic text');
    }
    
    /**
     * Strikethrough
     */
    function strikethrough() {
        insertText('~~', '~~', 'strikethrough text');
    }
    
    /**
     * Inline code
     */
    function code() {
        insertText('`', '`', 'code');
    }
    
    /**
     * Heading
     */
    function heading(level = null) {
        if (level === null) {
            MarkdownUI.openModal('heading-modal');
            return;
        }
        
        const prefix = '#'.repeat(level) + ' ';
        insertAtLineStart(prefix);
    }
    
    /**
     * Link
     */
    function link() {
        const cursor = getCursor();
        const text = cursor.text || 'link text';
        const url = 'https://example.com';
        insertText('[', `](${url})`, text);
    }
    
    /**
     * Image
     */
    function image() {
        const cursor = getCursor();
        const alt = cursor.text || 'image description';
        const url = 'https://example.com/image.jpg';
        insertText('![', `](${url})`, alt);
    }
    
    /**
     * Unordered list
     */
    function list() {
        const cursor = getCursor();
        
        if (!cursor.text) {
            insertText('- ', '', 'List item');
            return;
        }
        
        wrapLines('- ');
    }
    
    /**
     * Ordered list
     */
    function orderedList() {
        const cursor = getCursor();
        
        if (!cursor.text) {
            insertText('1. ', '', 'List item');
            return;
        }
        
        const lines = cursor.text.split('\n');
        const numbered = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        
        const editor = MarkdownPro.state.editor;
        const beforeCursor = editor.value.substring(0, cursor.start);
        const afterCursor = editor.value.substring(cursor.end);
        
        editor.value = beforeCursor + numbered + afterCursor;
        editor.setSelectionRange(cursor.start, cursor.start + numbered.length);
        editor.focus();
        
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Table
     */
    function table() {
        MarkdownUI.openModal('table-modal');
    }
    
    /**
     * Insert table
     */
    function insertTable(rows, cols) {
        let table = '\n';
        
        // Header
        table += '| ';
        for (let c = 0; c < cols; c++) {
            table += `Header ${c + 1} | `;
        }
        table += '\n';
        
        // Separator
        table += '| ';
        for (let c = 0; c < cols; c++) {
            table += '--- | ';
        }
        table += '\n';
        
        // Rows
        for (let r = 0; r < rows; r++) {
            table += '| ';
            for (let c = 0; c < cols; c++) {
                table += 'Cell | ';
            }
            table += '\n';
        }
        
        table += '\n';
        
        const editor = MarkdownPro.state.editor;
        const cursor = getCursor();
        const beforeCursor = editor.value.substring(0, cursor.start);
        const afterCursor = editor.value.substring(cursor.end);
        
        editor.value = beforeCursor + table + afterCursor;
        editor.setSelectionRange(cursor.start + table.length, cursor.start + table.length);
        editor.focus();
        
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Code block
     */
    function codeBlock() {
        const cursor = getCursor();
        const code = cursor.text || 'code';
        insertText('```\n', '\n```', code);
    }
    
    /**
     * Blockquote
     */
    function quote() {
        const cursor = getCursor();
        
        if (!cursor.text) {
            insertText('> ', '', 'Quote');
            return;
        }
        
        wrapLines('> ');
    }
    
    // Public API
    return {
        init,
        bold,
        italic,
        strikethrough,
        code,
        heading,
        link,
        image,
        list,
        'ordered-list': orderedList,
        table,
        'code-block': codeBlock,
        quote
    };
})();