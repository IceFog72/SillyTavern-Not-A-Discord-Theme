import { eventSource, event_types, getSlideToggleOptions} from '../../../../../script.js';
import { createHiddenWidthDiv } from './domUtils.js';
import { watchForChangesAndResize } from './expressionResize.js';
import { setDrawerClasses } from './drawer.js';
import { positionAnchor } from './positionAnchor.js';
import { drawerClickOverride } from './drawerClickOverride.js';
import { checkTheme, resetMovablePanels } from './checkTheme.js';
import { drawerStyleChangeOverride} from './chatStyle.js';
import ThemeSettingsManager from './themeSettingsManager.js';

export class ThemeSetup {
    constructor() {
        this.isAppReady = false;
       
        this.themeEntries = [
            {
                "type": "slider",
                "varId": "NSDlistGrid-char-panel-width",
                "displayText": "Grid Char Panel Width",
                "default": "482",
                "min": 240,
                "max": 740,
                "step": 1,
                "controlType": "css"
            },
            {
                "type": "slider",
                "varId": "NSDnormal-char-panel-width",
                "displayText": "Normal Panel Width",
                "default": "346",
                "min": 240,
                "max": 740,
                "step": 1,
                "controlType": "css"
            },
            {
                "type": "slider",
                "varId": "NSDpanel-base-width",
                "displayText": "Right Panels Width",
                "default": "380",
                "min": 200,
                "max": 600,
                "step": 1,
                "controlType": "css"
            },
            {
                "type": "slider",
                "varId": "NSDMesFontSize",
                "displayText": "Message Font Size",
                "default": "15",
                "min": 8,
                "max": 36,
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
                "type": "select",
                "varId": "bigChatAvatarFactor",
                "displayText": "Big Chat Avatar Size Factor",
                "default": "4x3.4",
                "options": [
                    { "label": "4x4", "value": "4x4" },
                    { "label": "4x3.4", "value": "4x3.4" },
                    { "label": "4x3", "value": "4x3" }
                ],
                "controlType": "js" 
            },
            {
                "type": "checkbox",
                "varId": "chatBubbleBigAvatarHeight",
                "displayText": "Chat Bubble as Big Avatar Height",
                "default": false,
                "controlType": "js" 
            },
            {
                "type": "checkbox",
                "varId": "enable-animations",
                "displayText": "Enable Some Animations",
                "default": false,
                "controlType": "js" 
            },
            {
                "type": "checkbox",
                "varId": "enable-autoHideCharFilter",
                "displayText": "Auto Hide Filter/Search Block",
                "default": false,
                "controlType": "js" 
            },
            {
                "type": "color",
                "varId": "NSDThemeBG1Color",
                "displayText": "Drawer BG Color",
                "default": "rgba(26, 26, 30, 1)",
                "controlType": "css"
            },
            {
                "type": "color",
                "varId": "NSDThemeBG4Color",
                "displayText": "Secondary Theme Color",
                "default": "rgba(32, 32, 36, 1)",
                "controlType": "css"
            },
            {
                "type": "color",
                "varId": "NSDThemeBG2Color",
                "displayText": "Option Popup BG Color",
                "default": "rgba(40, 40, 45, 1)",
                "controlType": "css"
            },
            {
                "type": "color",
                "varId": "NSDThemeBG3Color",
                "displayText": "Send Form BG Color",
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

        this.themeManager.registerCallback('chatBubbleBigAvatarHeight', (value, oldValue, varId) => {
            this.toggleChatBubbleBigAvatarHeight(value);
        });

        this.themeManager.registerCallback('bigChatAvatarFactor', (value, oldValue, varId) => {
            this.setBigChatAvatarFactor(value);
        });

        this.themeManager.registerCallback('enable-autoHideCharFilter', (value, oldValue, varId) => {
            this.setAutoHideCharFilter(value);
        });


        this.themeManager.registerCallback('expression-visibility', (value, oldValue, varId) => {
            this.setExpressionVisibility(value);
        });
        
        this.themeManager.registerCallback('animation-speed', (value, oldValue, varId) => {
            this.setAnimationSpeed(value);
        });
    }
    
    toggleAnimations(enabled) {
        console.log(`[NADTheme] jQuery.fx.off Animations ${enabled ? 'enabled' : 'disabled'}`);
        
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

    toggleChatBubbleBigAvatarHeight(enabled) {
        const styleId = 'nadtheme-mes-minheight-style';
        const css = `body.big_side-avatars .mes_block { min-height: calc(var(--avatar-base-height) * var(--big-avatar-height-factor) * var(--big-avatar-char-height-factor)) !important; }`;

        let styleTag = document.getElementById(styleId);

        if (enabled) {
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = styleId;
                styleTag.textContent = css;
                document.head.appendChild(styleTag);
            }
        } else {
            if (styleTag) {
                styleTag.remove();
            }
        }
    }


    setBigChatAvatarFactor(factor){

        if (factor === '4x3') {

            document.body.style.setProperty('--big-avatar-char-width-factor', `4`, 'important');
            document.body.style.setProperty('--big-avatar-char-height-factor', `3`, 'important');

        } else if (factor === '4x4') {

            document.body.style.setProperty('--big-avatar-char-width-factor', `4`, 'important');
            document.body.style.setProperty('--big-avatar-char-height-factor', `4`, 'important');

        } else {

            document.body.style.setProperty('--big-avatar-char-width-factor', `4`, 'important');
            document.body.style.setProperty('--big-avatar-char-height-factor', `3.4`, 'important');
        }
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
            drawerStyleChangeOverride();
            drawerClickOverride();

            checkTheme();

            this.addThemeSettings();

            resetMovablePanels();
        });
    }

    addThemeSettings() {

        this.themeManager.addSettings(
            '[name="FontBlurChatWidthBlock"]',
            'Theme Customization'
        );
    }

    updateThemeEntries(newEntries) {
        this.themeEntries = newEntries;
        this.themeManager.updateEntries(newEntries);
    }
   
    getCurrentSettings() {
        return this.themeManager.settings.entries;
    }
   
    resetTheme() {
        this.themeManager.resetToDefaults();
    }
    
    registerAdditionalCallback(varId, callback) {
        this.themeManager.registerCallback(varId, callback);
    }
}

