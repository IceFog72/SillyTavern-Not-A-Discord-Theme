import { power_user} from '../../../../power-user.js';
import {
    saveSettingsDebounced,
    getRequestHeaders,
 
} from '../../../../../script.js';


export async function checkTheme() {


    const hasDiscordTheme = $('#themes option').filter(function() {
        return $(this).val().includes('Not a Discord Theme');
    }).length > 0;
    
    if (!hasDiscordTheme) {
        await importJsonTheme();
    }
}


async function importJsonTheme() {
    const themeData = {
        "name": "Not a Discord Theme",
        "blur_strength": 0,
        "main_text_color": "rgba(243, 243, 243, 1)",
        "italics_text_color": "rgba(150, 150, 150, 1)",
        "underline_text_color": "rgba(88, 101, 242, 1)",
        "quote_text_color": "rgba(59, 118, 195, 1)",
        "blur_tint_color": "rgba(18, 18, 20, 1)",
        "chat_tint_color": "rgba(26, 26, 30, 1)",
        "user_mes_blur_tint_color": "rgba(36, 36, 41, 1)",
        "bot_mes_blur_tint_color": "rgba(26, 26, 30, 1)",
        "shadow_color": "rgba(41, 41, 41, 1)",
        "shadow_width": 0,
        "border_color": "rgba(47, 47, 48, 0.5)",
        "font_scale": 1,
        "fast_ui_mode": true,
        "waifuMode": false,
        "avatar_style": 1,
        "chat_display": 1,
        "toastr_position": "toast-top-right",
        "noShadows": false,
        "chat_width": 25,
        "timer_enabled": false,
        "timestamps_enabled": true,
        "timestamp_model_icon": true,
        "mesIDDisplay_enabled": false,
        "hideChatAvatars_enabled": false,
        "message_token_count_enabled": false,
        "expand_message_actions": true,
        "enableZenSliders": false,
        "enableLabMode": false,
        "hotswap_enabled": false,
        "custom_css": "",
        "bogus_folders": false,
        "zoomed_avatar_magnification": "",
        "reduced_motion": true,
        "compact_input_area": false,
        "show_swipe_num_all_messages": "",
        "click_to_edit": false
    };
    
    const fileText = JSON.stringify(themeData);
    await importTheme(fileText);
}


async function importTheme(fileText) {
    if (!fileText) {
        return;
    }

    const parsed = JSON.parse(fileText);

    if (!parsed.name) {
        throw new Error('Missing name');
    }

    if (typeof parsed.custom_css === 'string' && parsed.custom_css.includes('@import')) {
        const template = $(await renderTemplateAsync('themeImportWarning'));
        const confirm = await callGenericPopup(template, POPUP_TYPE.CONFIRM);
        if (!confirm) {
            throw new Error('Theme contains @import lines');
        }
    }

    //power_user.themes.push(parsed);
    await saveTheme(parsed.name, getNewTheme(parsed));
    const option = document.createElement('option');
    option.selected = false;
    option.value = parsed.name;
    option.innerText = parsed.name;
    $('#themes').append(option);
    saveSettingsDebounced();
    toastr.success(parsed.name, 'Theme imported');
}

async function saveTheme(name = undefined, theme = undefined) {
    if (typeof name !== 'string') {
        const newName = await callGenericPopup('Enter a theme preset name:', POPUP_TYPE.INPUT, power_user.theme);

        if (!newName) {
            return;
        }

        name = String(newName);
    }

    if (typeof theme !== 'object') {
        theme = getThemeObject(name);
    }

    const response = await fetch('/api/themes/save', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify(theme),
    });

    if (!response.ok) {
        toastr.error('Check the server connection and reload the page to prevent data loss.', 'Theme could not be saved');
        console.error('Theme could not be saved', response);
        throw new Error('Theme could not be saved');
    }

    const existingOption = $('#themes option').filter(function() {
        return $(this).val() === name;
    });
    const themeExists = existingOption.length > 0;

    if (!themeExists) {
        themes.push(theme);
        const option = document.createElement('option');
        option.selected = true;
        option.value = name;
        option.innerText = name;
        $('#themes').append(option);
    }
    else {

        const optionIndex = $('#themes option').index(existingOption[0]);
        themes[optionIndex] = theme;
        existingOption.attr('selected', true);
    }

    power_user.theme = name;
    saveSettingsDebounced();

    return theme;
}

function getNewTheme(parsed) {
    const theme = getThemeObject(parsed.name);
    for (const key in parsed) {
        if (Object.hasOwn(theme, key)) {
            theme[key] = parsed[key];
        }
    }
    return theme;
}

function getThemeObject(name) {
    return {
        name,
        blur_strength: power_user.blur_strength,
        main_text_color: power_user.main_text_color,
        italics_text_color: power_user.italics_text_color,
        underline_text_color: power_user.underline_text_color,
        quote_text_color: power_user.quote_text_color,
        blur_tint_color: power_user.blur_tint_color,
        chat_tint_color: power_user.chat_tint_color,
        user_mes_blur_tint_color: power_user.user_mes_blur_tint_color,
        bot_mes_blur_tint_color: power_user.bot_mes_blur_tint_color,
        shadow_color: power_user.shadow_color,
        shadow_width: power_user.shadow_width,
        border_color: power_user.border_color,
        font_scale: power_user.font_scale,
        fast_ui_mode: power_user.fast_ui_mode,
        waifuMode: power_user.waifuMode,
        avatar_style: power_user.avatar_style,
        chat_display: power_user.chat_display,
        toastr_position: power_user.toastr_position,
        noShadows: power_user.noShadows,
        chat_width: power_user.chat_width,
        timer_enabled: power_user.timer_enabled,
        timestamps_enabled: power_user.timestamps_enabled,
        timestamp_model_icon: power_user.timestamp_model_icon,

        mesIDDisplay_enabled: power_user.mesIDDisplay_enabled,
        hideChatAvatars_enabled: power_user.hideChatAvatars_enabled,
        message_token_count_enabled: power_user.message_token_count_enabled,
        expand_message_actions: power_user.expand_message_actions,
        enableZenSliders: power_user.enableZenSliders,
        enableLabMode: power_user.enableLabMode,
        hotswap_enabled: power_user.hotswap_enabled,
        custom_css: power_user.custom_css,
        bogus_folders: power_user.bogus_folders,
        zoomed_avatar_magnification: power_user.zoomed_avatar_magnification,
        reduced_motion: power_user.reduced_motion,
        compact_input_area: power_user.compact_input_area,
        show_swipe_num_all_messages: power_user.show_swipe_num_all_messages,
        click_to_edit: power_user.click_to_edit,
    };
}