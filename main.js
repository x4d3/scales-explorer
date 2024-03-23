import {Explorer} from './explorer.js';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('main');
    const scalesSelector = document.getElementById('scalesSelector');
    const description = document.getElementById('description');

    const explorer = new Explorer(canvas, scalesSelector, description);
    document.onkeydown = function (e) {
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault(); // prevent the default action (scroll / move caret)
                explorer.updateIndex(1);
                break;
            case "ArrowDown":
                e.preventDefault(); // prevent the default action (scroll / move caret)
                explorer.updateIndex(-1);
                break;
            default:
                return; // exit this handler for other keys
        }
    };
});
