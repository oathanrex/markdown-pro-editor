/**
 * Table of Contents Module
 * Auto-generate TOC with scroll spy
 */

const MarkdownTOC = (function() {
    'use strict';
    
    let tocContainer;
    let tocContent;
    let headings = [];
    
    /**
     * Initialize TOC
     */
    function init() {
        tocContainer = document.getElementById('toc-container');
        tocContent = document.getElementById('toc-content');
        
        if (!tocContainer || !tocContent) return;
        
        // Setup close button
        const closeBtn = document.getElementById('toc-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', toggle);
        }
        
        // Setup scroll spy
        const preview = MarkdownPro.state.preview;
        if (preview) {
            preview.addEventListener('scroll', updateScrollSpy);
        }
        
        // Initial update
        update();
    }
    
    /**
     * Update TOC
     */
    function update() {
        if (!tocContent) return;
        
        const preview = MarkdownPro.state.preview;
        headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (headings.length === 0) {
            tocContent.innerHTML = '<p class="toc-empty">No headings found</p>';
            return;
        }
        
        // Generate TOC
        const list = document.createElement('ul');
        list.className = 'toc-list';
        
        headings.forEach((heading, index) => {
            // Add ID to heading if not exists
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            const level = parseInt(heading.tagName.substring(1));
            const item = document.createElement('li');
            item.className = 'toc-item';
            
            const link = document.createElement('a');
            link.className = 'toc-link';
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.setAttribute('data-level', level);
            link.setAttribute('data-index', index);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToHeading(heading);
            });
            
            item.appendChild(link);
            list.appendChild(item);
        });
        
        tocContent.innerHTML = '';
        tocContent.appendChild(list);
        
        // Update scroll spy
        updateScrollSpy();
    }
    
    /**
     * Scroll to heading
     */
    function scrollToHeading(heading) {
        const preview = MarkdownPro.state.preview;
        const offsetTop = heading.offsetTop - preview.offsetTop;
        
        preview.scrollTo({
            top: offsetTop - 20,
            behavior: 'smooth'
        });
    }
    
    /**
     * Update scroll spy
     */
    function updateScrollSpy() {
        if (headings.length === 0) return;
        
        const preview = MarkdownPro.state.preview;
        const scrollTop = preview.scrollTop;
        const links = tocContent.querySelectorAll('.toc-link');
        
        let activeIndex = 0;
        
        // Find active heading
        headings.forEach((heading, index) => {
            const offsetTop = heading.offsetTop - preview.offsetTop;
            if (scrollTop >= offsetTop - 50) {
                activeIndex = index;
            }
        });
        
        // Update active link
        links.forEach((link, index) => {
            if (index === activeIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    /**
     * Toggle TOC visibility
     */
    function toggle() {
        if (!tocContainer) return;
        
        const isActive = tocContainer.classList.contains('active');
        
        if (isActive) {
            tocContainer.classList.remove('active');
            MarkdownPro.state.tocVisible = false;
        } else {
            tocContainer.classList.add('active');
            MarkdownPro.state.tocVisible = true;
            update();
        }
        
        MarkdownPro.saveState();
    }
    
    // Public API
    return {
        init,
        update,
        toggle
    };
})();