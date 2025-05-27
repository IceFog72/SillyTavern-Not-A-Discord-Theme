import {  power_user } from '../../../../power-user.js';
import { saveSettingsDebounced } from '../../../../../script.js';

const avatar_styles = {
    ROUND: 0,
    RECTANGULAR: 1,
    SQUARE: 2,
    ROUNDED: 3,
    BIGCHATAV: 4,
};

export function drawerStyleChangeOverride () {
  Object.assign(power_user.avatar_style, avatar_styles);

    const select = $('#avatar_style');
    
    const newOption = $('<option></option>');
    newOption.val('4'); 
    newOption.text('Big Chat Avatar'); 

    select.append(newOption);

    applyAvatarStyle();
    saveSettingsDebounced();

    $('#avatar_style').off('change');
    $('#avatar_style').on('change',  function () {
        const value = $(this).find(':selected').val();
        power_user.avatar_style = Number(value);
        applyAvatarStyle();
        saveSettingsDebounced();
    });
}


function applyAvatarStyle() {
    $('body').toggleClass('big-avatars', power_user.avatar_style === avatar_styles.RECTANGULAR);
    $('body').toggleClass('square-avatars', power_user.avatar_style === avatar_styles.SQUARE);
    $('body').toggleClass('rounded-avatars', power_user.avatar_style === avatar_styles.ROUNDED);
    $('body').toggleClass('big_side-avatars', power_user.avatar_style === avatar_styles.BIGCHATAV);
    $('#avatar_style').val(power_user.avatar_style).prop('selected', true);
}


