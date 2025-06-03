import { eventSource, event_types, saveSettingsDebounced } from '../../../../../script.js';
import { extension_settings } from '../../../../extensions.js';

class ThemeSettingsManager {
    constructor(entries = [], jsCallbacks = {}) {
        this.entries = entries;
        this.jsCallbacks = jsCallbacks;
        this.settings = this.initializeSettings();
        this.eventHandlers = {};
    }

    initializeSettings() {
        if (!extension_settings.TSM) {
            extension_settings.TSM = {};
        }
        return extension_settings.TSM;
    }


    registerCallback(varId, callback) {
        if (typeof callback === 'function') {
            this.jsCallbacks[varId] = callback;
            console.log(`[NADTheme] Registered JS callback for: ${varId}`);
        } else {
            console.warn(`[NADTheme] Invalid callback for ${varId}. Must be a function.`);
        }
    }

    executeCallback(varId, value, oldValue) {
        if (this.jsCallbacks[varId]) {
            try {
                this.jsCallbacks[varId](value, oldValue, varId);
                console.log(`[NADTheme] Executed JS callback for: ${varId}`);
            } catch (error) {
                console.error(`[NADTheme] Error executing callback for ${varId}:`, error);
            }
        }
    }

    updateCSSVariables(savedValues) {
        Object.entries(savedValues).forEach(([varId, value]) => {
            if (!varId || varId === 'undefined') return;

            const entry = this.entries.find(e => e.varId === varId);
            
            if (!entry || entry.controlType === 'js') return;

            const unitKey = `${varId}-unit`;
            const unit = savedValues[unitKey] || '';
            const valueWithUnit = unit ? `${value}${unit}` : value;

            if (valueWithUnit !== '') {
                document.documentElement.style.setProperty(`--${varId}`, valueWithUnit);
            }
        });
    }

    handleValueChange(varId, newValue, element = null) {
        const entry = this.entries.find(e => e.varId === varId);
        if (!entry) return;

        const oldValue = this.settings.entries[varId];
        
        this.settings.entries[varId] = newValue;


        if (!entry.controlType || entry.controlType === 'css') {

            const unitKey = `${varId}-unit`;
            const unit = this.settings.entries[unitKey] || '';
            const valueWithUnit = unit ? `${newValue}${unit}` : newValue;
            
            if (valueWithUnit !== '') {
                document.documentElement.style.setProperty(`--${varId}`, valueWithUnit);
            }
        }

        if (entry.controlType === 'js' || this.jsCallbacks[varId]) {
            this.executeCallback(varId, newValue, oldValue);
        }

        saveSettingsDebounced();
        console.log(`[NADTheme] ${varId} changed: ${oldValue} → ${newValue}`);
    }

    saveSettings(entries) {
        this.settings.entries = entries;
        this.updateCSSVariables(entries);
        saveSettingsDebounced();
        console.log('[NADTheme] Settings saved:', this.settings);
    }

    initializeSettingsEntries() {
        const currentVarIds = this.entries.map(entry => entry.varId);

        Object.keys(this.settings.entries || {}).forEach(key => {
            if (!currentVarIds.includes(key) || !key || key === 'undefined') {
                console.log(`[NADTheme] Removing invalid/obsolete entry: ${key}`);
                delete this.settings.entries[key];
                
                const entry = this.entries.find(e => e.varId === key);
                if (!entry || entry.controlType !== 'js') {
                    document.documentElement.style.removeProperty(`--${key}`);
                }
            }
        });

        this.settings.entries = this.settings.entries || {};
        this.entries.forEach(entry => {
            if (!entry.varId || entry.varId === 'undefined') return;

            if (!this.settings.entries.hasOwnProperty(entry.varId)) {
                let defaultValue;
                if (entry.type === 'checkbox') {
                    defaultValue = entry.checked !== undefined ? entry.checked : (entry.default || false);
                } else if (entry.type === 'select') {
                    const defaultOption = entry.options.find(opt => opt.value === entry.default) || entry.options[0];
                    defaultValue = defaultOption.value;
                } else {
                    defaultValue = entry.default || '';
                }
                
                this.settings.entries[entry.varId] = defaultValue;
                

                if (entry.controlType === 'js' || this.jsCallbacks[entry.varId]) {
                    this.executeCallback(entry.varId, defaultValue, undefined);
                }
            } else {

                if (entry.controlType === 'js' || this.jsCallbacks[entry.varId]) {
                    this.executeCallback(entry.varId, this.settings.entries[entry.varId], undefined);
                }
            }
        });
    }

    generateHTMLForEntry(entry, savedValue) {
        const value = savedValue !== undefined ? savedValue : entry.default;
        

        switch (entry.type) {
            case 'slider':
                return this.generateSliderEntry(entry, value);
            case 'color':
                return this.generateColorEntry(entry, value);
            case 'text':
                return this.generateTextEntry(entry, value);
            case 'checkbox':
                return this.generateCheckboxEntry(entry, value);
            case 'select':
                return this.generateSelectEntry(entry, value);
            default:
                console.warn(`[NADTheme] Unknown entry type: ${entry.type}`);
                return '';
        }
    }

    generateSliderEntry(entry, value) {
        return `
            <div class="flex-container alignitemscenter">  
                <small data-i18n="${entry.displayText}">${entry.displayText}</small><br>    
                <div class="alignitemscenter flex-container flexFlowColumn flexBasis48p flexGrow flexShrink gap0">
                    <input 
                        class="neo-range-slider" 
                        type="range" 
                        id="ts-slider-${entry.varId}" 
                        name="${entry.varId}" 
                        min="${entry.min}" 
                        max="${entry.max}" 
                        value="${value}" 
                        step="${entry.step || 1}" />
                    <input 
                        class="neo-range-input" 
                        type="number" 
                        id="ts-number-${entry.varId}" 
                        name="${entry.varId}" 
                        min="${entry.min}" 
                        max="${entry.max}" 
                        value="${value}" 
                        step="${entry.step || 1}" />
                </div>
                
            </div>`;
    }

    generateColorEntry(entry, value) {
        return `
            <div class="flex-container alignitemscenter">
                <toolcool-color-picker id="ts-${entry.varId}" color="${value}" ></toolcool-color-picker>
                <small>${entry.displayText}</small>
                <div id="ts-reset-${entry.varId}" title="Reset to Default Color" class="menu_button margin0 interactable ts-color-reset" tabindex="0" style="margin-left: 8px;">
                    <i class="fa-solid fa-undo"></i>
                </div>
            </div>`;
    }

    generateTextEntry(entry, value) {
        return `
            <div class="flex-container alignitemscenter">
                <input type="text" class="text_pole wide100p widthNatural flex1 margin0" id="ts-${entry.varId}" value="${value}" />
                <small>${entry.displayText}</small><br>
            </div>`;
    }

    generateCheckboxEntry(entry, value) {
        return `
            <div class="flex-container alignitemscenter checkbox_label">
                <input id="ts-${entry.varId}" type="checkbox" ${value ? 'checked' : ''} />
                <small>${entry.displayText}</small>
            </div>`;
    }

    generateSelectEntry(entry, value) {
        const options = entry.options.map(opt => `
            <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                ${opt.label}
            </option>`).join('');

        return `
            <div class="flex-container alignitemscenter">
                <small>${entry.displayText}</small>
                <select class="widthNatural flex1 margin0" id="ts-${entry.varId}" >
                    ${options}
                </select>
            </div>`;
    }

    setupEventListeners() {

        const handleInputChange = (event) => {
            const $input = $(event.target);
            const value = $input.val();
            const varId = $input.attr('name');
            const isSlider = $input.hasClass('neo-range-slider');

            if (!varId || varId === 'undefined') return;

            const $slider = isSlider ? $input : $(`#ts-slider-${varId}`);
            const $numberInput = isSlider ? $(`#ts-number-${varId}`) : $input;

            $slider.val(value);
            $numberInput.val(value);


            this.handleValueChange(varId, value, $input[0]);
        };

        const handleColorReset = (event) => {
            const resetButton = event.target.closest('.ts-color-reset');
            if (!resetButton) return;
            
            const varId = resetButton.id.replace('ts-reset-', '');
            const entry = this.entries.find(e => e.varId === varId);
            
            if (entry && entry.type === 'color') {
                const defaultValue = entry.default || '#000000';
                const colorPicker = document.querySelector(`#ts-${varId}`);
                
                if (colorPicker) {

                    colorPicker.color = defaultValue;
                    
                    this.handleValueChange(varId, defaultValue, colorPicker);
                }
            }
        };

        const handleUnitChange = (event) => {
            const $select = $(event.target);
            const varId = $select.attr('id').replace('ts-unit-', '');
            const value = $(`#ts-number-${varId}`).val();
            const unit = $select.val();
            const valueWithUnit = `${value}${unit}`;

            this.settings.entries[`${varId}-unit`] = unit;
            
        
            this.handleValueChange(varId, valueWithUnit, $select[0]);
        };

        $(document).on('input', '.neo-range-slider, .neo-range-input', handleInputChange);
        $(document).on('change', '.unit-selector', handleUnitChange);
        $(document).on('click', '.ts-color-reset', handleColorReset);


        this.eventHandlers.handleInputChange = handleInputChange;
        this.eventHandlers.handleUnitChange = handleUnitChange;
        this.eventHandlers.handleColorReset = handleColorReset;

        // Setup individual control event listeners
        this.entries.forEach(entry => {
            const inputElement = document.querySelector(`#ts-${entry.varId}`);
            if (!inputElement) return;

            const handleColorChange = (evt) => {
                const newColor = evt.detail.rgba;
                this.handleValueChange(entry.varId, newColor, inputElement);
            };

            const handleInput = (evt) => {
                const value = inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value;
                this.handleValueChange(entry.varId, value, inputElement);
            };

            if (entry.type === 'color') {
                inputElement.addEventListener('change', handleColorChange);
                this.eventHandlers[`handleColorChange_${entry.varId}`] = handleColorChange;
            } else if (entry.type !== 'slider') {
                const eventType = entry.type === 'checkbox' || entry.type === 'select' ? 'change' : 'input';
                inputElement.addEventListener(eventType, handleInput);
                this.eventHandlers[`handleInput_${entry.varId}`] = handleInput;
            }
        });
    }

    removeEventListeners() {
        if (this.eventHandlers) {
            $(document).off('input', '.neo-range-slider, .neo-range-input', this.eventHandlers.handleInputChange);
            $(document).off('change', '.unit-selector', this.eventHandlers.handleUnitChange);
            $(document).off('click', '.ts-color-reset', this.eventHandlers.handleColorReset);

            Object.keys(this.eventHandlers).forEach(key => {
                if (key.startsWith('handleColorChange_') || key.startsWith('handleInput_')) {
                    const varId = key.split('_')[1];
                    const inputElement = document.querySelector(`#ts-${varId}`);
                    if (inputElement) {
                        inputElement.removeEventListener('change', this.eventHandlers[key]);
                        inputElement.removeEventListener('input', this.eventHandlers[key]);
                    }
                }
            });

            this.eventHandlers = {};
        }
    }

    resetToDefaults() {

        const oldSettings = { ...this.settings.entries };
        
        this.settings.entries = {};
        
        this.updateCSSVariables({});
        
        this.entries.forEach(entry => {
            let defaultValue;
            if (entry.type === 'checkbox') {
                defaultValue = entry.checked !== undefined ? entry.checked : (entry.default || false);
            } else if (entry.type === 'select') {
                const defaultOption = entry.options.find(opt => opt.value === entry.default) || entry.options[0];
                defaultValue = defaultOption.value;
            } else {
                defaultValue = entry.default || '';
            }
            
            this.handleValueChange(entry.varId, defaultValue);
        });
        
        this.regenerateUI();
        console.log('[NADTheme] Settings reset to default values');
    }

    regenerateUI() {
        console.log('[NADTheme] Regenerating UI.');
        this.removeEventListeners();
        this.populateSettingsUI();
    }

    setupButtons() {
        document.getElementById('ts-reset-defaults')?.addEventListener('click', () => {
            this.resetToDefaults();
        });

        $(document).on('click', '.ts-inline-drawer-maximize', () => {
            const icon = $('.ts-inline-drawer-maximize').find('.inline-drawer-icon, .floating_panel_maximize');
            icon.toggleClass('fa-window-maximize fa-window-restore');
            
            const drawer = $('#ts-drawer');
            const movingDivs = $('#movingDivs');

            const colorValues = {};
            this.entries.forEach(entry => {
                if (entry.type === 'color') {
                    const colorPicker = document.querySelector(`#ts-${entry.varId}`);
                    if (colorPicker) {
                        colorValues[entry.varId] = colorPicker.color;
                    }
                }
            });

            if (drawer.hasClass('inline-drawer')) {
                drawer.data('original-parent', drawer.parent());
                drawer.appendTo(movingDivs)
                    .removeClass('inline-drawer')
                    .addClass('ts-drawer-content maximized')
                    .css({
                        'display': 'flex',
                        'opacity': '1'
                    });
            } else {
                drawer.appendTo(drawer.data('original-parent'))
                    .removeClass('ts-drawer-content maximized')
                    .addClass('inline-drawer')
                    .css({
                        'display': '',
                        'opacity': ''
                    });
            }

            setTimeout(() => {
                this.entries.forEach(entry => {
                    if (entry.type === 'color' && colorValues[entry.varId]) {
                        const colorPicker = document.querySelector(`#ts-${entry.varId}`);
                        if (colorPicker) {
                            colorPicker.color = colorValues[entry.varId];
                        }
                    }
                });
            }, 100); 
        });
    }

    populateSettingsUI() {
        const row1 = document.querySelector('#ts-row-1');
        const row2 = document.querySelector('#ts-row-2');

        if (!row1 || !row2) {
            console.error('[NADTheme] Row containers not found!');
            return;
        }

        if (!this.entries || this.entries.length === 0) {
            this.settings.entries = {};
            this.updateCSSVariables({});
            console.warn('[NADTheme] No entries provided');

            row1.innerHTML = '<div class="flex-container flexFlowColumn"><p class="alert-message">No theme settings available.</p></div>';
            row2.innerHTML = '';
            return;
        }

        this.initializeSettingsEntries();

        row1.innerHTML = '';
        row2.innerHTML = '';

        this.entries.forEach((entry, index) => {
            const savedValue = this.settings.entries[entry.varId];
            const inputHTML = this.generateHTMLForEntry(entry, savedValue);

            if (index < this.entries.length / 2) {
                row1.insertAdjacentHTML('beforeend', inputHTML);
            } else {
                row2.insertAdjacentHTML('beforeend', inputHTML);
            }
        });

        this.setupEventListeners();
    }

    addSettings(targetSelector = '[name="FontBlurChatWidthBlock"]', title = 'Theme Settings') {
        const html = `
            <div id="ts-drawer" class="inline-drawer wide100p flexFlowColumn">
                <div class="inline-drawer-toggle inline-drawer-header userSettingsInnerExpandable">
                    <b>${title}</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div id="ts-drawer-content" class="inline-drawer-content">
                    <div class="flex-container ts-container flexFlowColumn">
                        <div class="flex-container ts-flex-container" >
                            <div id="ts-row-1" class="flex-container flexFlowColumn" style="flex: 1; flex-direction: column;">
                            </div>
                            <div id="ts-row-2" class="flex-container flexFlowColumn" style="flex: 1; flex-direction: column;">
                            </div>
                        </div>
                        <div class="flex-container ts-button-container">
                            <div id="ts-reset-defaults" title="Reset to Defaults" data-i18n="[title]Reset to Defaults" class="menu_button margin0 interactable" tabindex="0">
                                <i class="fa-solid fa-undo"></i>
                            </div>
                            <div id="floatingPromptMaximize" class="ts-inline-drawer-maximize">
                                <i class="floating_panel_maximize fa-fw fa-solid fa-window-maximize"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr>`;

        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.insertAdjacentHTML('beforeend', html);
            this.populateSettingsUI();
            this.setupButtons();
            
            // Initialize CSS variables with current settings
            this.updateCSSVariables(this.settings.entries || {});
        } else {
            console.error(`[NADTheme] Target element not found: ${targetSelector}`);
        }
    }

    updateEntries(newEntries) {
        this.entries = newEntries;
        this.regenerateUI();
    }
}

export default ThemeSettingsManager;