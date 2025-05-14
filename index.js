 

import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';


 
const THEME_ID = 'SillyTavern-Not-A-Discord-Theme';
const THEME_NAME = 'Not A Discord Theme';
const THEME_VERSION = '1.0.0';
const THEME_AUTHOR = 'IceFog72';
 

class ThemeSetup {
    constructor() {
        // this.settings = extension_settings[THEME_ID];
        // this.themesDirectory = '/user/themes';
        // this.themeFolder = `${this.themesDirectory}/${THEME_ID}`;
    }

    async initialize() {

        (function() {
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
            })();
        //console.log(`[${THEME_NAME}] Initializing setup...`);
        //eventSource.on(event_types.APP_READY, this.onAppReady.bind(this));
    
        //await this.ensureThemeFiles();

        //if (!this.settings.initialized) {
        //    this.settings.initialized = true;
        //    saveSettingsDebounced();
        //}
        
        //console.log(`[${THEME_NAME}] Setup complete`);
    }
    
    async onAppReady() {
        //console.log(`[${THEME_NAME}] App ready event received`);
        //await this.updateThemeFiles();
    }
    
    async ensureThemeFiles() {

        
    }
    
    async updateThemeFiles() {
       
    }
    
    async createFile(filename, content) {
      
    }
    
    async updateFileIfChanged(filename, newContent) {
      
    }
    
    
}

const themeSetup = new ThemeSetup();
await themeSetup.initialize();


//window.themeSetup = themeSetup;

//export default themeSetup;