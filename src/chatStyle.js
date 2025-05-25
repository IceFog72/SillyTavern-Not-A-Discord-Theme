import { chat_styles } from '../../../../power-user.js';

export function addStyle(){
    Object.assign(chat_styles, {
        DEFAULT: 0,
        BUBBLES: 1,
        DOCUMENT: 2,
        BIGBUBBLES : 3
    });
}