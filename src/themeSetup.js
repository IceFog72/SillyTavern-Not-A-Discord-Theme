import { eventSource, event_types } from '../../../../../script.js';
import { createHiddenWidthDiv } from './domUtils.js';
import { watchForExpressionChangesAndResize } from './expressionResize.js';
import { setDrawerClasses } from './drawer.js';
import { positionAnchor } from './positionAnchor.js';

export class ThemeSetup {
    constructor() {
        this.isAppReady = false;
    }

    async initialize() {
        eventSource.on(event_types.APP_READY, () => {
            jQuery.fx.off = true;
            this.isAppReady = true;
            createHiddenWidthDiv();
            watchForExpressionChangesAndResize();
            setDrawerClasses();
            positionAnchor();
        });
    }
}