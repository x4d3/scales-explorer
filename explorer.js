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
        startNote: "A",
        startKey: "A"
    },
    "Dorian": {
        intervals: MAJOR_INTERVALS,
        startNote: "G",
        startKey: "F"
    }
};

const ALL_NOTES = {
    'C': {root_index: 0, int_val: 0},
    'C#': {root_index: 1, int_val: 1},
    'D': {root_index: 1, int_val: 2},
    'D#': {root_index: 2, int_val: 3},
    'E': {root_index: 2, int_val: 4},
    'F': {root_index: 3, int_val: 5},
    'F#': {root_index: 3, int_val: 6},
    'G': {root_index: 4, int_val: 7},
    'G#': {root_index: 5, int_val: 8},
    'A': {root_index: 5, int_val: 9},
    'A#': {root_index: 6, int_val: 10},
    'B': {root_index: 6, int_val: 11},
};
const ALL_NOTES_ARRAY = Object.keys(ALL_NOTES);

const ALL_KEYS = {
    "C": [],
    "C#": ["F#", "C#", "G#", "D#", "A#", "E#", "B#"],
    "Db": ["Bb", "Eb", "Ab", "Db", "Gb"],
    "D": ["F#", "C#"],
    "Eb": ["Bb", "Eb", "Ab"],
    "E": ["F#", "C#", "G#", "D#"],
    "F": ["Bb"],
    "F#": ["F#", "C#", "G#", "D#", "A#", "E#"],
    "Gb": ["Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    "G": ["F#"],
    "Ab": ["Bb", "Eb", "Ab", "Db"],
    "A": ["F#", "C#", "G#"],
    "Bb": ["Bb", "Eb"],
    "B": ["F#", "C#", "G#", "D#", "A#"],
    "Cb": ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"]
}


const getMessage = diff => {
    if (diff > 0) {
        return " Interval up " + safeArrayAccess(DIATONIC_ACCIDENTALS, diff);
    } else if (diff == 0) {
        return "";
    } else {
        return " Interval down " + safeArrayAccess(DIATONIC_ACCIDENTALS, -diff);
    }
};
const fillSelector = function (selector, elements) {
    elements.forEach((item) => {
        const option = document.createElement("option")
        option.value = item;
        option.text = item;
        selector.add(option);
    });
};

export class Explorer {
    constructor(canvas, scalesSelector, description) {
        this.canvas = canvas;
        this.scalesSelector = scalesSelector;
        this.description = description;
        this.index = 0;

        canvas.addEventListener('click', event => {
            const y = event.pageY - canvas.offsetTop;
            this.updateIndex(y < canvas.height / 2 ? 1 : -1)
        }, false);

        fillSelector(this.scalesSelector, Object.keys(SCALES));
        scalesSelector.onchange = () => {
            this.refresh();
        };
        this.refresh();
    }

    updateIndex(increment) {
        this.index += increment;
        this.refresh();
    }

    refresh() {
        const scale = this.scalesSelector.value;
        drawScaleOnCanva(this.canvas, SCALES[scale].startKey, this.index);
    }
}

const mod = (input, n) => ((input % n) + n) % n;
const safeArrayAccess = (array, index) => array[mod(index, array.length)];

const getNote = index => safeArrayAccess(ALL_NOTES_ARRAY, index);

const drawScaleOnCanva = (canvas, keySignature, startingNoteIndex) => {
    const renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    const ctx = renderer.getContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const stave = new Vex.Flow.Stave(10, 0, canvas.width - 20);
    stave.addClef("treble").addKeySignature(keySignature).setContext(ctx).draw();
    const notes = generatesScale(startingNoteIndex);
    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
};

const generatesScale = startingNoteIndex => {
    const notes = new Array(7);
    startingNoteIndex = mod(startingNoteIndex + 3, 7) - 3;
    for (let i = 0; i < 8; i++) {
        const j = startingNoteIndex + i;
        const key = safeArrayAccess(Vex.Flow.Music.roots, j);
        const scale = 4 + Math.floor(j / 7);
        notes[i] = new Vex.Flow.StaveNote({keys: [key + "/" + scale], duration: "4d"});
    }
    return notes;
};
