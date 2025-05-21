import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';

const THEME_ID = 'SillyTavern-Not-A-Discord-Theme';
const THEME_NAME = 'Not A Discord Theme';
const THEME_VERSION = '1.0.3';
const THEME_AUTHOR = 'IceFog72';


function positionAnchor() {
// Feature detection for position-anchor
    const supportsPositionAnchor = CSS.supports('position-anchor: top left');

    // If the browser supports position-anchor, no need for our fallback
    if (supportsPositionAnchor) return;

    // Define the prefixes we want to support
    const menuPrefixes = ['stqrd--', 'stwid--'];

    // Store last clicked triggers for each prefix
    window.lastClickedMenuTriggers = {};

    // Use event delegation for dynamically created elements
    document.addEventListener('click', (e) => {
        // Check for menu triggers with any supported prefix
        menuPrefixes.forEach(prefix => {
            const triggerClass = `${prefix}action`;
            const contextClass = `${prefix}context`;
            const menuTriggerClass = `${prefix}menuTrigger`;
            
            // Check for both types of triggers
            const trigger = e.target.closest(`.${triggerClass}.${contextClass}`) || 
                            e.target.closest(`.${triggerClass}.${menuTriggerClass}`);
            
            if (trigger) {
                // Store reference to the trigger that was clicked with its prefix
                window.lastClickedMenuTriggers[prefix] = trigger;
            }
        });
    }, true); // Use capture phase to run before the plugin's handlers

    // Watch for new menu elements being added to the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    // Skip non-element nodes
                    if (node.nodeType !== 1) return;
                    
                    // Check for blocker divs with any supported prefix
                    menuPrefixes.forEach(prefix => {
                        const blockerClass = `${prefix}blocker`;
                        
                        if (node.classList && node.classList.contains(blockerClass)) {
                            const menuClass = `${prefix}menu`;
                            const menu = node.querySelector(`.${menuClass}`);
                            
                            if (menu && window.lastClickedMenuTriggers[prefix]) {
                                // Position the menu based on the last clicked trigger for this prefix
                                positionMenu(window.lastClickedMenuTriggers[prefix], menu);
                            }
                        }
                    });
                });
            }
        });
    });

    // Function to position the menu relative to its trigger
    function positionMenu(trigger, menu) {
        const triggerRect = trigger.getBoundingClientRect();
        
        // Set menu position
        menu.style.position = 'absolute';
        menu.style.top = `${triggerRect.bottom + 5}px`;
        menu.style.right = `${window.innerWidth - triggerRect.right}px`;
        menu.style.left = 'auto'; // Clear any left positioning
        
        // Make sure the menu stays on screen
        setTimeout(() => {
            const menuRect = menu.getBoundingClientRect();
            
            // If menu is going off the right edge
            if (menuRect.right > window.innerWidth) {
                menu.style.right = '10px';
            }
            
            // If menu is going off the bottom edge
            if (menuRect.bottom > window.innerHeight) {
                menu.style.top = `${triggerRect.top - menuRect.height - 5}px`;
            }
        }, 0);
    }

    // Start observing the document for added blocker/menu elements
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });

}

function updateThemeColor(color) {
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", color);
    } else {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.setAttribute("name", "theme-color");
        metaThemeColor.setAttribute("content", color);
        document.head.appendChild(metaThemeColor);
    }
}

function createHiddenWidthDiv() {
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'hidden-width-reference';
    hiddenDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: var(--expression-image-lorebook-width);
        height: 0;
        pointer-events: none;
    `;
    const hiddenDiv2 = document.createElement('div');
    hiddenDiv2.id = 'hidden-center-panels-width-reference';
    hiddenDiv2.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: var(--center-panels-width);
        height: 0;
        pointer-events: none;
    `;
    document.body.appendChild(hiddenDiv);
    document.body.appendChild(hiddenDiv2);
}

function setDrawerClasses() {

    const drawer = document.getElementById('stqrd--drawer-v2');
    const qrDrawer = document.getElementById('stqrd--qrDrawer');
    
    const wiSpButton = document.getElementById('WI-SP-button');
    if (wiSpButton) {
        const drawerToggle = wiSpButton.querySelector('.drawer-toggle');
        const wIDrawerIcon = wiSpButton.querySelector('.drawer-icon');
        
        if (drawerToggle && wIDrawerIcon && wIDrawerIcon.classList.contains('openIcon')) {
            drawerToggle.click();
        }
    }

    if (drawer) {
        drawer.className = 'drawer-content pinnedOpen closedDrawer';
    }
    
    if (qrDrawer) {
        const qrIcon = qrDrawer.querySelector('.drawer-icon');
        if (qrIcon) {
            qrIcon.classList.add('drawerPinnedOpen');
        }
    }
}

function watchForExpressionChanges() {
    const observer = new MutationObserver(() => {
        const body = document.body;
        const worldInfo = document.getElementById('WorldInfo');
        const drawer = document.getElementById('stqrd--drawer-v2');
        const expressionWrapper = document.getElementById('expression-wrapper');
        const expressionImage = document.getElementById('expression-image');
        const editorPanel = document.querySelector('.stqrd--editorPanel');

        // Check for conditions that require removing the width property
        const hasZoomedAvatar = !!body.querySelector('.zoomed_avatar.draggable:not([style*="display: none"])');
        const hasValidExpression = expressionWrapper && 
            expressionImage && 
            expressionImage.src && 
            expressionImage.src !== 'undefined' &&
            expressionImage.src !== window.location.href &&
            !expressionWrapper.matches('[style*="display: none"]') &&
            !expressionImage.matches('[style*="display: none"]');
        const hasNoVisiblePanels = 
            (worldInfo?.style.display !== 'block' || worldInfo?.style.display !== '') &&
            (drawer?.style.display !== 'block' || drawer?.style.display !== '');


        const hiddenRef = document.getElementById('hidden-width-reference');
        const currentWidth = hiddenRef?.offsetWidth || 0;

        // Merge conditions - remove width if either both panels are hidden OR we have avatar/expression with no panels
        if (((((worldInfo?.style.display === 'none' || worldInfo?.style.display === '') && (drawer?.style.display === 'none' || drawer?.style.display === '') && (!(hasZoomedAvatar || hasValidExpression) || body.classList.contains('waifuMode')) && hasNoVisiblePanels)) || currentWidth < 128) && 
            body.style.getPropertyValue('--expression-image-lorebook-width')) {
            body.style.removeProperty('--expression-image-lorebook-width');
        }
    });


    const elements = [
        document.getElementById('WorldInfo'),
        document.getElementById('stqrd--drawer-v2'),
        document.getElementById('expression-wrapper'),
        document.querySelector('.zoomed_avatar'),
        document.body  // needed for waifuMode class
    ].filter(Boolean); // Remove null elements
    elements.forEach(element => {
        observer.observe(element, {
            attributes: true,
            attributeFilter: ['style', 'class', 'src'],
            childList: false,
            subtree: false
        });
    });
}


class ThemeSetup {
    constructor() {
        this.isAppReady = false;
    }

    async initialize() {
        eventSource.on(event_types.APP_READY, () => {
            this.isAppReady = true;
            
            createHiddenWidthDiv();
            watchForExpressionChanges();
            setDrawerClasses();
            positionAnchor();
            var bgcolor= getComputedStyle(document.documentElement).getPropertyValue('--NSDSmartThemeBGColor');
            updateThemeColor(bgcolor);
            
            (function() {
                let resizeHandle = null;
                let startWidth = 0;
                let startX = 0;
                let currentPanel = null;
                let maxWidth= 0;

                function createResizeHandle() {
                    if (resizeHandle) return;
                    
                    resizeHandle = document.createElement('div');
                    resizeHandle.className = 'resizeHandle';

                    document.body.appendChild(resizeHandle);
                    
                    // Add drag functionality
                    resizeHandle.addEventListener('mousedown', startResize);
                }

                
                function setImportantCssVar(element, variableName, value) {
                    const regex = new RegExp(`\\s*${variableName}:.*?;`, 'i');
                    const newRule = `${variableName}: ${value} !important;`;
                    
                    // Check if the variable is already defined
                    if (regex.test(element.style.cssText)) {
                        // Replace the existing variable
                        element.style.cssText = element.style.cssText.replace(regex, newRule);
                    } else {
                        // Append the new variable
                        element.style.cssText += newRule;
                    }
                }
                
                function startResize(e) {
                    startX = e.clientX;
                    // Get width from hidden reference div
                    const hiddenRef = document.getElementById('hidden-width-reference');
                    startWidth = hiddenRef.offsetWidth;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                    
                    // Prevent text selection while resizing
                    e.preventDefault();
                }

                function resize(e) {
                    if (!currentPanel) return;
                    
                    const diff = startX - e.clientX;
                    const hiddenRef2 = document.getElementById('hidden-center-panels-width-reference');
                    maxWidth = hiddenRef2.clientWidth;
                    const newWidth = Math.max(8, Math.min(startWidth + diff, maxWidth, window.innerWidth * 0.8));
                    
                    setImportantCssVar(document.body, '--expression-image-lorebook-width', `${newWidth}px`);
                }

                function stopResize() {
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
                }

                const sheld = document.getElementById('sheld');

                currentPanel = sheld;
                positionResizeHandle(sheld);
              
                function positionResizeHandle(panel) {
                    createResizeHandle();
                    
                    // Position the handle
                    const rect = panel.getBoundingClientRect();
                    resizeHandle.style.display = 'block';
                    resizeHandle.style.height = `100%`;
                    resizeHandle.style.right = `${rect.right - 4}px`;
                    resizeHandle.style.top = `4px`;
                }


            })();
        });
    }
}

const themeSetup = new ThemeSetup();
themeSetup.initialize();