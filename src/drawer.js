import { accountStorage } from '../../../../util/AccountStorage.js';
import { slideToggle } from '../../../../../lib.js';
import { getSlideToggleOptions } from '../../../../../script.js';

export function setDrawerClasses() {
    var Drawer = document.getElementById('stqrd--drawer-v2');
    var QrDrawer = document.getElementById('stqrd--qrDrawer');
    var WIPanelPin = document.getElementById('WI_panel_pin');
    var WorldInfo = document.getElementById('WorldInfo');
    var WIDrawerIcon = document.getElementById('WIDrawerIcon');

    accountStorage.setItem('WINavLockOn', $(WIPanelPin).prop('checked'));

    if ($(WIPanelPin).prop('checked') == true) {
        slideToggle(WorldInfo, getSlideToggleOptions());
    }

    $(WorldInfo).addClass('pinnedOpen');
    $(WIDrawerIcon).addClass('drawerPinnedOpen');
    WorldInfo.style='display: none;';
    WorldInfo.className = 'drawer-content pinnedOpen closedDrawer';

    if (Drawer) {
        Drawer.className = 'drawer-content pinnedOpen closedDrawer';
        QrDrawer.querySelector('.drawer-icon')?.classList.add('drawerPinnedOpen');
    }
}