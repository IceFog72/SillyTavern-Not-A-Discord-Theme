export function createHiddenWidthDiv() {
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

export function throttle(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}