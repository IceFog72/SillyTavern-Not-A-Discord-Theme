export function positionAnchor() {
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