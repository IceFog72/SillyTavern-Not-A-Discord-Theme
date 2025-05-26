import { DOMPurify, Bowser, slideToggle } from '../../../../../lib.js';
import { isMobile, initMovingUI, favsToHotswap } from '../../../../RossAscends-mods.js';

export function drawerClickOverride () {

    $('.drawer-toggle').off('click');
    $('.drawer-toggle').on('click', doNavbarIconClick);
}

function doNavbarIconClick() {
    const icon = $(this).find('.drawer-icon');
    const drawer = $(this).parent().find('.drawer-content');
    const drawerWasOpenAlready = $(this).parent().find('.drawer-content').hasClass('openDrawer');
    const targetDrawerID = $(this).parent().find('.drawer-content').attr('id');
    const pinnedDrawerClicked = drawer.hasClass('pinnedOpen');
    
    if (!drawerWasOpenAlready) {

        $('.openDrawer').not('.pinnedOpen').hide().removeClass('openDrawer').addClass('closedDrawer');
        $('.openIcon').not('.drawerPinnedOpen').removeClass('openIcon').addClass('closedIcon');
        
        icon.removeClass('closedIcon').addClass('openIcon');
        drawer.removeClass('closedDrawer').addClass('openDrawer');
        
        if (targetDrawerID === 'right-nav-panel') {
            drawer.css('display', 'flex').show();
            favsToHotswap();
            $('#rm_print_characters_block').trigger('scroll');
        } else {
            drawer.show();
        }
    } else if (drawerWasOpenAlready) {
        icon.removeClass('openIcon').addClass('closedIcon');
        drawer.hide().removeClass('openDrawer').addClass('closedDrawer');
    }
}