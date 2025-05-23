
import { extension_settings } from '../../../extensions.js';
import { accountStorage } from '../../../util/AccountStorage.js';
import { DOMPurify, Bowser, slideToggle } from '../../../../lib.js';
import {
    characters,
    online_status,
    main_api,
    api_server,
    is_send_press,
    max_context,
    saveSettingsDebounced,
    active_group,
    active_character,
    setActiveGroup,
    setActiveCharacter,
    getEntitiesList,
    buildAvatarList,
    selectCharacterById,
    eventSource,
    event_types,
    menu_type,
    substituteParams,
    sendTextareaMessage,
    getSlideToggleOptions,
} from '../../../../script.js';

const THEME_ID = 'SillyTavern-Not-A-Discord-Theme';
const THEME_NAME = 'Not A Discord Theme';
const THEME_VERSION = '1.0.3';
const THEME_AUTHOR = 'IceFog72';

let isResizing = false;

function positionAnchor() {
    if (CSS.supports('position-anchor: top left')) return;

    const menuPrefixes = ['stqrd--', 'stwid--'];
    window.lastClickedMenuTriggers = {};

    document.addEventListener('click', (e) => {
        menuPrefixes.forEach(prefix => {
            const triggerClass = `.${prefix}action`;
            const trigger = e.target.closest(`${triggerClass}.${prefix}context`) || 
                            e.target.closest(`${triggerClass}.${prefix}menuTrigger`);
            if (trigger) window.lastClickedMenuTriggers[prefix] = trigger;
        });
    }, true);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(({ addedNodes }) => {
            addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                menuPrefixes.forEach(prefix => {
                    if (node.classList?.contains(`${prefix}blocker`)) {
                        const menu = node.querySelector(`.${prefix}menu`);
                        const trigger = window.lastClickedMenuTriggers[prefix];
                        if (menu && trigger) positionMenu(trigger, menu);
                    }
                });
            });
        });
    });

    function positionMenu(trigger, menu) {
        const rect = trigger.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
        menu.style.left = 'auto';

        setTimeout(() => {
            const menuRect = menu.getBoundingClientRect();
            if (menuRect.right > window.innerWidth) menu.style.right = '10px';
            if (menuRect.bottom > window.innerHeight) {
                menu.style.top = `${rect.top - menuRect.height - 5}px`;
            }
        }, 0);
    }

    observer.observe(document.body, { childList: true, subtree: true });
}

function createHiddenWidthDiv() {
    const createDiv = (id, widthVar) => {
        const div = document.createElement('div');
        div.id = id;
        div.style.cssText = `
            position: absolute;
            visibility: hidden;
            width: var(${widthVar});
            height: 0;
            pointer-events: none;
        `;
        document.body.appendChild(div);
    };
    createDiv('hidden-width-reference', '--expression-image-lorebook-width');
    createDiv('hidden-center-panels-width-reference', '--center-panels-width');
}

function setDrawerClasses() {




    var Drawer = document.getElementById('stqrd--drawer-v2');
    var QrDrawer = document.getElementById('stqrd--qrDrawer');
    var WIPanelPin = document.getElementById('WI_panel_pin');
    var WorldInfo = document.getElementById('WorldInfo');
    var WIDrawerIcon = document.getElementById('WIDrawerIcon');

    accountStorage.setItem('WINavLockOn', $(WIPanelPin).prop('checked'));


    if ($(WIPanelPin).prop('checked') == true) 
    {
        slideToggle(WorldInfo, getSlideToggleOptions());
    }

    $(WorldInfo).addClass('pinnedOpen');
    $(WIDrawerIcon).addClass('drawerPinnedOpen');
    WorldInfo.style='display: none;';
    WorldInfo.className = 'drawer-content pinnedOpen closedDrawer';

    if (Drawer) 
    {
        Drawer.className = 'drawer-content pinnedOpen closedDrawer';
        QrDrawer.querySelector('.drawer-icon')?.classList.add('drawerPinnedOpen');
    }
}

function throttle(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

function watchForExpressionChangesAndResize() {
    const body = document.body;
    let worldInfo = document.getElementById('WorldInfo');
    let drawer = document.getElementById('stqrd--drawer-v2');
    let wrapper = document.getElementById('expression-wrapper');
    let image = document.getElementById('expression-image');
    let hiddenRef = document.getElementById('hidden-width-reference');
    let hiddenRef2 = document.getElementById('hidden-center-panels-width-reference');

    let resizeHandle, startX = 0, startWidth = 0;

    // Function to update element references
    function updateElementReferences() {
        worldInfo = document.getElementById('WorldInfo');
        drawer = document.getElementById('stqrd--drawer-v2');
        wrapper = document.getElementById('expression-wrapper');
        image = document.getElementById('expression-image');
        hiddenRef = document.getElementById('hidden-width-reference');
        hiddenRef2 = document.getElementById('hidden-center-panels-width-reference');
    }

    // Resize handle functions
    function createResizeHandle() {
        if (resizeHandle) return;
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'resizeHandle';
        resizeHandle.addEventListener('mousedown', startResize);
        document.body.appendChild(resizeHandle);
    }

    function startResize(e) {
        updateElementReferences(); // Update references before resize
        startX = e.clientX;
        startWidth = hiddenRef?.offsetWidth || 0;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    }

    function resize(e) {
        isResizing = true;
        const diff = startX - e.clientX;

        let maxWidth = getComputedStyle(body).getPropertyValue('--expression-image-lorebook-width').trim();

        if (isNaN(maxWidth)) {
            maxWidth = hiddenRef2?.clientWidth || 0;
        } else {
            maxWidth = parseInt(maxWidth, 10);
            if (isNaN(maxWidth)) return;
        }

        const hasZoomedAvatar = !!body.querySelector('.zoomed_avatar.draggable:not([style*="display: none"])');
        const hasValidExpression = wrapper && 
            image && 
            image.src && 
            image.src !== 'undefined' &&
            image.src !== window.location.href &&
            !wrapper.matches('[style*="display: none"]') &&
            !image.matches('[style*="display: none"]');
        const hasNoVisiblePanels = 
            (worldInfo?.style.display !== 'block' || worldInfo?.style.display !== '') &&
            (drawer?.style.display !== 'block' || drawer?.style.display !== '');

        const newWidth = Math.max(8, Math.min(startWidth + diff, maxWidth, window.innerWidth * 0.8));

        const worldInfoHidden = worldInfo?.style.display === 'none' || worldInfo?.style.display === '';
        const drawerHidden = drawer === null || drawer?.style.display === 'none' || drawer?.style.display === '';
        const shouldHideContent = !(hasZoomedAvatar || hasValidExpression) || body.classList.contains('waifuMode');
        
        const shouldRemoveWidth = newWidth < 128 || 
            (worldInfoHidden && (drawer === null ? true : drawerHidden) && shouldHideContent && hasNoVisiblePanels);

        if (shouldRemoveWidth) {
            body.style.removeProperty('--expression-image-lorebook-width');
        } else {
            body.style.setProperty('--expression-image-lorebook-width', `${newWidth}px`, 'important');
        }
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        isResizing = false;
    }

    // Expression changes check function
    const checkChanges = throttle(() => {
        if (isResizing) return;
        
        updateElementReferences(); // Update references before checking
        
        if (!hiddenRef) return;

        const hasZoomed = !!body.querySelector('.zoomed_avatar.draggable:not([style*="display: none"])');
        const validImage = image && image.src && image.src !== 'undefined' && image.src !== window.location.href;
        const validWrapper = wrapper && !wrapper.matches('[style*="display: none"]');
        const validExpression = validImage && validWrapper && !image.matches('[style*="display: none"]');

        const worldInfoHidden = !worldInfo || worldInfo.style.display === 'none' || worldInfo.style.display === '';
        const drawerHidden = !drawer || drawer.style.display === 'none' || drawer.style.display === '';
        const shouldHide = !(hasZoomed || validExpression) || body.classList.contains('waifuMode');
        const noVisiblePanels = worldInfoHidden && drawerHidden;

        if (parseInt(hiddenRef.offsetWidth) < 128 || (noVisiblePanels && shouldHide)) {
            body.style.removeProperty('--expression-image-lorebook-width');
        }
    }, 50);

    // Initialize resize handle
    function initResizeHandle() {
        updateElementReferences(); // Update references before init
        
        const panel = document.getElementById('sheld');
        if (panel) {
            createResizeHandle();
            const rect = panel.getBoundingClientRect();
            resizeHandle.style.display = 'block';
            resizeHandle.style.height = '100%';
            resizeHandle.style.right = `${rect.right - 4}px`;
            resizeHandle.style.top = '4px';
        }
    }

    // Set up mutation observers with dynamic element references
    function setupObservers() {
        // Observer for DOM changes to update element references
        const domObserver = new MutationObserver(() => {
            updateElementReferences();
            checkChanges();
        });

        // Observe the entire document for element additions/removals
        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Set up observers for existing elements
        function observeElement(element) {
            if (element) {
                new MutationObserver(checkChanges).observe(element, {
                    attributes: true,
                    attributeFilter: ['style', 'class', 'src']
                });
            }
        }

        // Initial observation setup
        const setupInitialObservers = () => {
            updateElementReferences();
            [worldInfo, drawer, wrapper, image, body].forEach(observeElement);
            
            // Also observe zoomed avatar if it exists
            const zoomedAvatar = document.querySelector('.zoomed_avatar');
            if (zoomedAvatar) observeElement(zoomedAvatar);
        };

        setupInitialObservers();
        
        // Re-setup observers when DOM changes significantly
        let observerTimeout;
        domObserver.observe(document.body, {
            childList: true,
            subtree: true,
            callback: () => {
                clearTimeout(observerTimeout);
                observerTimeout = setTimeout(setupInitialObservers, 100);
            }
        });
    }

    // Initialize everything
    setupObservers();
    initResizeHandle();
}


class ThemeSetup {
    constructor() {
        this.isAppReady = false;
    }

    async initialize() {
        eventSource.on(event_types.APP_READY, () => {
            this.isAppReady = true;
            createHiddenWidthDiv();
            watchForExpressionChangesAndResize();
            setDrawerClasses();
            positionAnchor();
            
        });
    }
}

const themeSetup = new ThemeSetup();
themeSetup.initialize();
