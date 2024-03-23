import {Explorer} from './explorer.js';

document.addEventListener('DOMContentLoaded', function () {
    const app = document.getElementById("app");

    const scalesSelector = document.createElement("select")
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 120;
    const description = document.createElement('div');
    app.appendChild(scalesSelector);
    app.appendChild(canvas);
    app.appendChild(description);

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
