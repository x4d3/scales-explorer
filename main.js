import {Explorer} from './explorer.js';

function parseIntOrDefault(param, defaultValue) {
    if (param) {
        return parseInt(param);
    } else {
        return defaultValue;
    }
}

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
    const urlParams = new URLSearchParams(window.location.search);
    const index = parseIntOrDefault(urlParams.get('index'), 0);
    const scale = urlParams.get('scale') || 'Major';

    const explorer = new Explorer(canvas, scalesSelector, description, scale, index);
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

    explorer.onParamsChange((index, scale) => {
        console.log("params changed");
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('index', index);
        urlParams.set('scale', scale);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
    });

});
