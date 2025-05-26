import { eventSource, event_types, getSlideToggleOptions} from '../../../../../script.js';
import { createHiddenWidthDiv } from './domUtils.js';
import { watchForChangesAndResize } from './expressionResize.js';
import { setDrawerClasses } from './drawer.js';
import { positionAnchor } from './positionAnchor.js';
import { addStyle } from './chatStyle.js';
import { drawerClickOverride } from './drawerClickOverride.js';


import ThemeSettingsManager from './themeSettingsManager.js';

export class ThemeSetup {
    constructor() {
        this.isAppReady = false;
       
        // Define your theme entries with controlType property
        this.themeEntries = [
            {
                "type": "slider",
                "varId": "NSDlistGrid-char-panel-width",
                "displayText": "Grid char panel width",
                "default": "482",
                "min": 240,
                "max": 740,
                "step": 1,
                "controlType": "css"
            },
            {
                "type": "slider",
                "varId": "NSDnormal-char-panel-width",
                "displayText": "Normal panel width",
                "default": "346",
                "min": 240,
                "max": 740,
                "step": 1,
                "controlType": "css"
            },
            {
                "type": "slider",
                "varId": "NSDbgImageOpacity",
                "displayText": "Bg Image Opacity",
                "default": "1",
                "min": 0,
                "max": 1,
                "step": 0.01,
                "controlType": "css"
            },
            {
                "type": "color",
                "varId": "NSDThemeBG1Color",
                "displayText": "Color 1",
                "default": "rgba(26, 26, 30, 1)",
                "controlType": "css"
            },
            {
                "type": "color",
                "varId": "NSDThemeBG2Color",
                "displayText": "Color 2",
                "default": "rgba(40, 40, 45, 1)",
                "controlType": "css"
            },
            {
                "type": "color",
                "varId": "NSDThemeBG3Color",
                "displayText": "Color 3",
                "default": "rgba(34, 35, 39, 1)",
                "controlType": "css"
            },
            {
                "type": "color",
                "varId": "NSDDrawer-IconColor",
                "displayText": "Drawer Icon Color",
                "default": "rgba(237, 237, 237, 1)",
                "controlType": "css"
            },
            {
                "type": "checkbox",
                "varId": "enable-animations",
                "displayText": "Enable some animations",
                "default": false,
                "controlType": "js" 
            },
            {
                "type": "checkbox",
                "varId": "enable-autoHideCharFilter",
                "displayText": "Auto hide filter/search block",
                "default": false,
                "controlType": "js" 
            },
            /*{
                "type": "select",
                "varId": "expression-visibility",
                "displayText": "Expression Visibility",
                "default": "visible",
                "options": [
                    { "label": "Visible", "value": "visible" },
                    { "label": "Hidden", "value": "hidden" },
                    { "label": "Collapse", "value": "collapse" }
                ],
                "controlType": "js" 
            },
            {
                "type": "slider",
                "varId": "animation-speed",
                "displayText": "Animation Speed",
                "default": 1,
                "min": 0.1,
                "max": 3,
                "step": 0.1,
                "controlType": "js" 
            }*/
        ];
       

        this.themeManager = new ThemeSettingsManager(this.themeEntries);
        

        this.registerCallbacks();
    }
    

    registerCallbacks() {

        this.themeManager.registerCallback('enable-animations', (value, oldValue, varId) => {
            this.toggleAnimations(value);
        });

        this.themeManager.registerCallback('enable-autoHideCharFilter', (value, oldValue, varId) => {
            this.setAutoHideCharFilter(value);
        });


        this.themeManager.registerCallback('expression-visibility', (value, oldValue, varId) => {
            this.setExpressionVisibility(value);
        });
        
        // Callback for animation-speed
        this.themeManager.registerCallback('animation-speed', (value, oldValue, varId) => {
            this.setAnimationSpeed(value);
        });
    }
    
    // JavaScript functions that will be called by the controls
    toggleAnimations(enabled) {
        console.log(`[ThemeSetup] Animations ${enabled ? 'enabled' : 'disabled'}`);
        
        if (enabled){
            jQuery.fx.off = false;
        } else {
            jQuery.fx.off = true;
        }
    }
    
    setExpressionVisibility(visibility) {
   
    }
    
    setAnimationSpeed(speed) {
      
    }

    setAutoHideCharFilter(enabled) {
      var fixedTop = document.getElementById('charListFixedTop');

        if (enabled) 
        {
            fixedTop.className='popout';
        } else {
            fixedTop.className='';
        }
    }

    async initialize() {
        eventSource.on(event_types.APP_READY, () => {
            //jQuery.fx.off = true;
            this.isAppReady = true;
           
            createHiddenWidthDiv();
            watchForChangesAndResize();
            setDrawerClasses();
            positionAnchor();
            addStyle();
            drawerClickOverride();
           
            // Add theme settings UI
            this.addThemeSettings();
        });
    }

    addThemeSettings() {
        // Add settings to a specific location - adjust selector as needed
        this.themeManager.addSettings(
            '[name="FontBlurChatWidthBlock"]', // Target selector
            'Theme Customization'              // Title
        );
    }

    // Method to update theme entries dynamically if needed
    updateThemeEntries(newEntries) {
        this.themeEntries = newEntries;
        this.themeManager.updateEntries(newEntries);
    }
   
    // Method to get current theme settings
    getCurrentSettings() {
        return this.themeManager.settings.entries;
    }
   
    // Method to reset theme to defaults
    resetTheme() {
        this.themeManager.resetToDefaults();
    }
    
    // Method to register additional callbacks after initialization
    registerAdditionalCallback(varId, callback) {
        this.themeManager.registerCallback(varId, callback);
    }
}

