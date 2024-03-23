//Do re mi fa sol l si do

const MAJOR_INTERVALS = [2, 2, 1, 2, 2, 2, 1];
const MINOR_INTERVALS = [2, 1, 2, 2, 1, 2, 2];

const SCALES = {
    "Major": {
        intervals: MAJOR_INTERVALS,
        startNote: "C",
        startKey: "C"
    },
    "Minor": {
        intervals: MINOR_INTERVALS,
        startNote: "C",
        startKey: "Eb"
    },
    "Dorian": {
        intervals: MAJOR_INTERVALS,
        startNote: "G",
        startKey: "F"
    }
};

const ALL_KEYS = {
    'C': {root_index: 0, int_val: 0, accidentals: []},
    'Db': {root_index: 1, int_val: 1, accidentals: ["Bb", "Eb", "Ab", "Db", "Gb"]},
    'D': {root_index: 1, int_val: 2, accidentals: ["F#", "C#"]},
    'Eb': {root_index: 2, int_val: 3, accidentals: ["Bb", "Eb", "Ab"]},
    'E': {root_index: 2, int_val: 4, accidentals: ["F#", "C#", "G#"]},
    'F': {root_index: 3, int_val: 5, accidentals: ["Bb"]},
    'F#': {root_index: 3, int_val: 6, accidentals: ["F#", "C#", "G#", "D#", "A#", "E#"]},
    'G': {root_index: 4, int_val: 7, accidentals: ["F#"]},
    'Ab': {root_index: 5, int_val: 8, accidentals: ["Bb", "Eb", "Ab", "Db"]},
    'A': {root_index: 5, int_val: 9, accidentals: ["F#", "C#", "G#"]},
    'Bb': {root_index: 6, int_val: 10, accidentals: ["Bb", "Eb"]},
    'B': {root_index: 6, int_val: 11, accidentals: ["F#", "C#", "G#", "D#", "A#"]},
};

const ALL_KEYS_ARRAY = Object.keys(ALL_KEYS);

const fillSelector = function (selector, elements) {
    elements.forEach((item) => {
        const option = document.createElement("option")
        option.value = item;
        option.text = item;
        selector.add(option);
    });
};

export class Explorer {
    constructor(canvas, scalesSelector, description, scale, index) {
        this.canvas = canvas;
        this.description = description;
        this.index = index;
        this.scale = scale;
        this.changeParamsListeners = [];
        canvas.addEventListener('click', event => {
            const y = event.pageY - canvas.offsetTop;
            this.updateIndex(y < canvas.height / 2 ? 1 : -1)
        }, false);

        fillSelector(scalesSelector, Object.keys(SCALES));
        scalesSelector.onchange = () => {
            this.scale = scalesSelector.value;
            this.fireParamChanged();
        };
        scalesSelector.value = scale;
        this.refresh();
    }

    updateIndex(increment) {
        this.index += increment;
        this.fireParamChanged();

    }

    onParamsChange(listener) {
        this.changeParamsListeners.push(listener);
    }

    refresh() {
        const {index, scale} = this;
        const {startNote, intervals, startKey} = SCALES[scale];
        console.log("startNote", startNote, "intervals", intervals, "startKey", startKey);

        const key = getKey(ALL_KEYS[startKey].int_val + index);
        const note = safeArrayAccess(ALL_KEYS_ARRAY, index + ALL_KEYS[startNote].root_index)
        const noteIndex = ALL_KEYS[note].root_index;

        drawScaleOnCanva(this.canvas, key, noteIndex, intervals);
        this.description.innerHTML = `${note} ${scale}`;
    }

    fireParamChanged() {
        const {index, scale} = this;
        this.refresh();
        this.changeParamsListeners.forEach(listener => listener(index, scale));
    }
}

const mod = (input, n) => ((input % n) + n) % n;
const safeArrayAccess = (array, index) => array[mod(index, array.length)];

const getKey = index => safeArrayAccess(ALL_KEYS_ARRAY, index);

const drawScaleOnCanva = (canvas, key, noteIndex, intervals) => {
    const renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    const ctx = renderer.getContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const stave = new Vex.Flow.Stave(10, 0, canvas.width - 20);
    stave.addClef("treble").addKeySignature(key).setContext(ctx).draw();
    const notes = generatesScale(noteIndex);
    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
};

const generatesScale = startingNoteIndex => {
    const notes = new Array(7);
    for (let i = 0; i < 8; i++) {
        const j = startingNoteIndex + i;
        const key = safeArrayAccess(Vex.Flow.Music.roots, j);
        const scale = 4 + Math.floor(j / 7);
        notes[i] = new Vex.Flow.StaveNote({keys: [key + "/" + scale], duration: "4d"});
    }
    return notes;
};
