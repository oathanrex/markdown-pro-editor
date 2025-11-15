/**
 * Shortcuts Module
 * Keyboard shortcuts and Vim mode
 */

const MarkdownShortcuts = (function() {
    'use strict';
    
    /**
     * Initialize shortcuts
     */
    function init() {
        document.addEventListener('keydown', handleKeydown);
    }
    
    /**
     * Handle keydown events
     */
    function handleKeydown(e) {
        const editor = MarkdownPro.state.editor;
        const isEditor = document.activeElement === editor;
        
        // Vim mode shortcuts
        if (MarkdownPro.state.vimMode && isEditor) {
            handleVimMode(e);
        }
        
        // Global shortcuts
        handleGlobalShortcuts(e);
        
        // Editor shortcuts
        if (isEditor) {
            handleEditorShortcuts(e);
        }
    }
    
    /**
     * Handle global shortcuts
     */
    function handleGlobalShortcuts(e) {
        const ctrl = e.ctrlKey || e.metaKey;
        
        // Ctrl+S: Save
        if (ctrl && e.key === 's') {
            e.preventDefault();
            if (typeof MarkdownAutosave !== 'undefined') {
                MarkdownAutosave.save(false);
            }
            return;
        }
        
        // Ctrl+N: New file
        if (ctrl && e.key === 'n') {
            e.preventDefault();
            if (typeof MarkdownFile !== 'undefined') {
                MarkdownFile.newFile();
            }
            return;
        }
        
        // Ctrl+O: Import file
        if (ctrl && e.key === 'o') {
            e.preventDefault();
            if (typeof MarkdownFile !== 'undefined') {
                MarkdownFile.importFile();
            }
            return;
        }
        
        // F11: Fullscreen
        if (e.key === 'F11') {
            e.preventDefault();
            if (typeof MarkdownFullscreen !== 'undefined') {
                MarkdownFullscreen.toggle();
            }
            return;
        }
        
        // Ctrl+/: Toggle TOC
        if (ctrl && e.key === '/') {
            e.preventDefault();
            if (typeof MarkdownTOC !== 'undefined') {
                MarkdownTOC.toggle();
            }
            return;
        }
    }
    
    /**
     * Handle editor shortcuts
     */
    function handleEditorShortcuts(e) {
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        
        // Ctrl+Z: Undo
        if (ctrl && !shift && e.key === 'z') {
            e.preventDefault();
            if (typeof MarkdownHistory !== 'undefined') {
                MarkdownHistory.undo();
            }
            return;
        }
        
        // Ctrl+Shift+Z or Ctrl+Y: Redo
        if ((ctrl && shift && e.key === 'z') || (ctrl && e.key === 'y')) {
            e.preventDefault();
            if (typeof MarkdownHistory !== 'undefined') {
                MarkdownHistory.redo();
            }
            return;
        }
        
        // Ctrl+B: Bold
        if (ctrl && e.key === 'b') {
            e.preventDefault();
            if (typeof MarkdownActions !== 'undefined') {
                MarkdownActions.bold();
            }
            return;
        }
        
        // Ctrl+I: Italic
        if (ctrl && e.key === 'i') {
            e.preventDefault();
            if (typeof MarkdownActions !== 'undefined') {
                MarkdownActions.italic();
            }
            return;
        }
        
        // Ctrl+K: Link
        if (ctrl && e.key === 'k') {
            e.preventDefault();
            if (typeof MarkdownActions !== 'undefined') {
                MarkdownActions.link();
            }
            return;
        }
        
        // Ctrl+D: Duplicate line
        if (ctrl && e.key === 'd') {
            e.preventDefault();
            duplicateLine();
            return;
        }
        
        // Tab: Indent
        if (e.key === 'Tab' && !ctrl) {
            e.preventDefault();
            if (shift) {
                outdent();
            } else {
                indent();
            }
            return;
        }
        
        // Ctrl+/: Comment
        if (ctrl && e.key === '/') {
            e.preventDefault();
            comment();
            return;
        }
    }
    
    /**
     * Handle Vim mode
     */
    function handleVimMode(e) {
        // Basic Vim navigation
        if (e.key === 'Escape') {
            MarkdownPro.state.editor.blur();
            return;
        }
    }
    
    /**
     * Indent selected lines
     */
    function indent() {
        const editor = MarkdownPro.state.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;
        
        // Find line boundaries
        let lineStart = start;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }
        
        let lineEnd = end;
        while (lineEnd < value.length && value[lineEnd] !== '\n') {
            lineEnd++;
        }
        
        // Get lines
        const beforeLines = value.substring(0, lineStart);
        const lines = value.substring(lineStart, lineEnd);
        const afterLines = value.substring(lineEnd);
        
        // Indent each line
        const indented = lines.split('\n').map(line => '    ' + line).join('\n');
        
        editor.value = beforeLines + indented + afterLines;
        editor.setSelectionRange(start + 4, end + (indented.length - lines.length));
        
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Outdent selected lines
     */
    function outdent() {
        const editor = MarkdownPro.state.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;
        
        // Find line boundaries
        let lineStart = start;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }
        
        let lineEnd = end;
        while (lineEnd < value.length && value[lineEnd] !== '\n') {
            lineEnd++;
        }
        
        // Get lines
        const beforeLines = value.substring(0, lineStart);
        const lines = value.substring(lineStart, lineEnd);
        const afterLines = value.substring(lineEnd);
        
        // Outdent each line
        const outdented = lines.split('\n').map(line => {
            if (line.startsWith('    ')) {
                return line.substring(4);
            } else if (line.startsWith('\t')) {
                return line.substring(1);
            }
            return line;
        }).join('\n');
        
        editor.value = beforeLines + outdented + afterLines;
        
        const delta = lines.length - outdented.length;
        editor.setSelectionRange(Math.max(lineStart, start - 4), end - delta);
        
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Duplicate current line
     */
    function duplicateLine() {
        const editor = MarkdownPro.state.editor;
        const start = editor.selectionStart;
        const value = editor.value;
        
        // Find line boundaries
        let lineStart = start;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }
        
        let lineEnd = start;
        while (lineEnd < value.length && value[lineEnd] !== '\n') {
            lineEnd++;
        }
        
        // Get line content
        const line = value.substring(lineStart, lineEnd);
        
        // Insert duplicate
        const beforeLine = value.substring(0, lineEnd);
        const afterLine = value.substring(lineEnd);
        
        editor.value = beforeLine + '\n' + line + afterLine;
        editor.setSelectionRange(lineEnd + 1, lineEnd + 1 + line.length);
        
        editor.dispatchEvent(new Event('input'));
    }
    
    /**
     * Comment/uncomment lines
     */
    function comment() {
        const editor = MarkdownPro.state.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;
        
        // Find line boundaries
        let lineStart = start;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }
        
        let lineEnd = end;
        while (lineEnd < value.length && value[lineEnd] !== '\n') {
            lineEnd++;
        }
        
        // Get lines
        const beforeLines = value.substring(0, lineStart);
        const lines = value.substring(lineStart, lineEnd);
        const afterLines = value.substring(lineEnd);
        
        // Toggle comments
        const lineArray = lines.split('\n');
        const allCommented = lineArray.every(line => line.startsWith('<!-- ') && line.endsWith(' -->'));
        
        let result;
        if (allCommented) {
            // Uncomment
            result = lineArray.map(line => {
                if (line.startsWith('<!-- ') && line.endsWith(' -->')) {
                    return line.substring(5, line.length - 4);
                }
                return line;
            }).join('\n');
        } else {
            // Comment
            result = lineArray.map(line => `<!-- ${line} -->`).join('\n');
        }
        
        editor.value = beforeLines + result + afterLines;
        editor.setSelectionRange(start, start + result.length);
        
        editor.dispatchEvent(new Event('input'));
    }
    
    // Public API
    return {
        init
    };
})();