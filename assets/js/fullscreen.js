/**
 * Fullscreen Module
 * Fullscreen and distraction-free mode
 */

const MarkdownFullscreen = (function() {
    'use strict';
    
    let isFullscreen = false;
    
    /**
     * Initialize fullscreen module
     */
    function init() {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    }
    
    /**
     * Toggle fullscreen
     */
    function toggle() {
        if (!isFullscreen) {
            enter();
        } else {
            exit();
        }
    }
    
    /**
     * Enter fullscreen
     */
    function enter() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        isFullscreen = true;
        MarkdownPro.state.fullscreen = true;
    }
    
    /**
     * Exit fullscreen
     */
    function exit() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        isFullscreen = false;
        MarkdownPro.state.fullscreen = false;
    }
    
    /**
     * Handle fullscreen change
     */
    function handleFullscreenChange() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement) {
            isFullscreen = false;
            MarkdownPro.state.fullscreen = false;
        }
    }
    
    // Public API
    return {
        init,
        toggle,
        enter,
        exit
    };
})();