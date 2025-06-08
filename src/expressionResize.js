import { throttle } from './domUtils.js';


export function watchForChangesAndResize() {
    const body = document.body;
    let worldInfo = document.getElementById('WorldInfo');
    let drawer = document.getElementById('stqrd--drawer-v2');
    let wrapper = document.getElementById('expression-wrapper');
    let image = document.getElementById('expression-image');
    let hiddenRef = document.getElementById('hidden-width-reference');
    let hiddenRef2 = document.getElementById('hidden-center-panels-width-reference');
    let isResizing = false;
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

    let pendingResizeWrites = [];
    let resizeScheduled = false;
    let frameCounter = 0;

    function scheduleResizeWrites() {
        if (!resizeScheduled) {
            resizeScheduled = true;
            requestAnimationFrame(() => {
                frameCounter++;
                // Only run writes every 2nd frame (i.e., skip every other frame)
                //if (frameCounter % 2 === 0) {
                    while (pendingResizeWrites.length) {
                        const write = pendingResizeWrites.shift();
                        write();
                    }
                //}
                resizeScheduled = false;
            });
        }
    }

    function resize(e) {
        isResizing = true;
        // Read values
        const diff = startX - e.clientX;
        pendingResizeWrites.push(() => {

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

            const worldInfoHidden = worldInfo?.classList.contains('closedDrawer');
            const drawerHidden = drawer === null || drawer?.classList.contains('closedDrawer');
            const shouldHideContent = !(hasZoomedAvatar || hasValidExpression) || body.classList.contains('waifuMode');
            const shouldRemoveWidth = newWidth < 128 || 
                (worldInfoHidden && (drawer === null ? true : drawerHidden) && shouldHideContent && hasNoVisiblePanels);

            // Batch the write
        
            if (shouldRemoveWidth) {
                body.style.removeProperty('--expression-image-lorebook-width');
            } else {
                body.style.setProperty('--expression-image-lorebook-width', `${newWidth}px`, 'important');
            }
        });

        scheduleResizeWrites();
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        isResizing = false;
        frameCounter = 0;
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

        const worldInfoHidden = worldInfo?.classList.contains('closedDrawer');
        const drawerHidden = drawer === null || drawer?.classList.contains('closedDrawer');
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