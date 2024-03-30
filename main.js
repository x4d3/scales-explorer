document.addEventListener("DOMContentLoaded", function () {
  const app = document.getElementById("app");

  const scalesSelector = document.createElement("select");
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 150;
  const description = document.createElement("div");
  app.appendChild(scalesSelector);
  app.appendChild(canvas);
  app.appendChild(description);
  const urlParams = new URLSearchParams(window.location.search);
  const index = parseIntOrDefault(urlParams.get("index"), 0);
  const scale = urlParams.get("scale") || "Major";

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
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("index", index);
    urlParams.set("scale", scale);
    window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
  });
});

const MAJOR_INTERVALS = [2, 2, 1, 2, 2, 2, 1];
const MINOR_INTERVALS = [2, 1, 2, 2, 1, 2, 2];
const SCALES = {
  Major: {
    intervals: MAJOR_INTERVALS,
    startNote: "C",
    startKey: "C",
  },
  Minor: {
    intervals: MINOR_INTERVALS,
    startNote: "C",
    startKey: "Eb",
  },
  Dorian: {
    intervals: MAJOR_INTERVALS,
    startNote: "G",
    startKey: "F",
  },
};

const ALL_KEYS = {
  C: { root_index: 0, int_val: 0, accidentals: [] },
  Db: {
    root_index: 1,
    int_val: 1,
    accidentals: ["Bb", "Eb", "Ab", "Db", "Gb"],
  },
  D: { root_index: 1, int_val: 2, accidentals: ["F#", "C#"] },
  Eb: { root_index: 2, int_val: 3, accidentals: ["Bb", "Eb", "Ab"] },
  E: { root_index: 2, int_val: 4, accidentals: ["F#", "C#", "G#", "D#"] },
  F: { root_index: 3, int_val: 5, accidentals: ["Bb"] },
  "F#": {
    root_index: 3,
    int_val: 6,
    accidentals: ["F#", "C#", "G#", "D#", "A#", "E#"],
  },
  G: { root_index: 4, int_val: 7, accidentals: ["F#"] },
  Ab: { root_index: 5, int_val: 8, accidentals: ["Bb", "Eb", "Ab", "Db"] },
  A: { root_index: 5, int_val: 9, accidentals: ["F#", "C#", "G#"] },
  Bb: { root_index: 6, int_val: 10, accidentals: ["Bb", "Eb"] },
  B: {
    root_index: 6,
    int_val: 11,
    accidentals: ["F#", "C#", "G#", "D#", "A#"],
  },
};

const NOTES_NEXT = {
  Cbb: ["Cb", "Dbb", "Db"],
  Cb: ["Dbb", "Db", "D"],
  C: ["Db", "D", "D#"],
  "C#": ["D", "D#", "D##"],
  "C##": ["D#", "D##", "F"],

  Dbb: ["Db", "Ebb", "Eb"],
  Db: ["Ebb", "Eb", "E"],
  D: ["Eb", "E", "E#"],
  "D#": ["E", "E#", "E##"],
  "D##": ["E#", "E##", "F#"],

  Ebb: ["Eb", "Fb", "F"],
  Eb: ["Fb", "F", "Gb"],
  E: ["F", "F#", "F##"],
  "E#": ["F#", "F##", "G#"],
  "E##": ["F##", "G#", "A"],

  Fbb: ["Fb", "F", "Gb"],
  Fb: ["Gbb", "Gb", "G"],
  F: ["Gb", "G", "G#"],
  "F#": ["G", "G#", "G##"],
  "F##": ["G#", "A", "A#"],

  Gbb: ["Gb", "Abb", "Ab"],
  Gb: ["Abb", "Ab", "A"],
  G: ["Ab", "A", "A#"],
  "G#": ["A", "A#", "A##"],
  "G##": ["A#", "B", "C"],

  Abb: ["Bbb", "Bb", "B"],
  Ab: ["Bbb", "Bb", "Cb"],
  A: ["Bb", "B", "B#"],
  "A#": ["B", "B#", "C#"],
  "A##": ["C", "C#", "D"],

  Bbb: ["Bb", "B", "C"],
  Bb: ["B", "C", "Db"],
  B: ["C", "C#", "C##"],
  "B#": ["C#", "C##", "D#"],
};

const ALL_KEYS_ARRAY = Object.keys(ALL_KEYS);

class Explorer {
  constructor(canvas, scalesSelector, description, scale, index) {
    this.canvas = canvas;
    this.description = description;
    this.index = index;
    this.scale = scale;
    this.changeParamsListeners = [];
    canvas.addEventListener("click", (e) => {
      const y = e.pageY - canvas.offsetTop;
      this.updateIndex(y < canvas.height / 2 ? 1 : -1);
    });

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
    const { index, scale } = this;
    const { startNote, intervals, startKey } = SCALES[scale];
    const key = getKey(ALL_KEYS[startKey].int_val + index);
    const note = safeArrayAccess(ALL_KEYS_ARRAY, index + ALL_KEYS[startNote].root_index);
    drawScale(this.canvas, key, note, intervals);
    this.description.innerHTML = `${note} ${scale}`;
  }

  fireParamChanged() {
    const { index, scale } = this;
    this.refresh();
    this.changeParamsListeners.forEach((listener) => listener(index, scale));
  }
}

const { Renderer, Stave, StaveNote, Accidental, Formatter } = Vex.Flow;

const drawScale = (canvas, key, firstNote, intervals) => {
  const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
  const ctx = renderer.getContext();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const stave = new Stave(10, 0, canvas.width - 20);
  stave.addClef("treble").addKeySignature(key).setContext(ctx).draw();
  const { accidentals } = ALL_KEYS[key];

  const notes = generatesScale(firstNote, intervals, accidentals);
  Formatter.FormatAndDraw(ctx, stave, notes);
};

const generatesScale = (firstNote, intervals, accidentals) => {
  let note = firstNote;
  let scale = 3;
  const notes = [];
  for (let i = 0; i < 15; i++) {
    const noteLetter = note.slice(0, 1);
    const staveNote = new StaveNote({
      keys: [`${noteLetter}/${scale}`],
      duration: "4d",
    });
    if (!accidentals.includes(note)) {
      if (note.slice(-2) === "##") {
        staveNote.addModifier(new Accidental("##"));
      } else if (note.slice(-1) === "#") {
        staveNote.addModifier(new Accidental("#"));
      } else if (note.slice(-2) === "bb") {
        staveNote.addModifier(new Accidental("bb"));
      } else if (note.slice(-1) === "b") {
        staveNote.addModifier(new Accidental("b"));
      }
    }
    notes.push(staveNote);

    const interval = safeArrayAccess(intervals, i);
    const nextNote = NOTES_NEXT[note][interval - 1];
    const nextNoteLetter = nextNote.slice(0, 1);
    if ((noteLetter === "B" || noteLetter === "A") && (nextNoteLetter === "C" || nextNoteLetter === "D")) {
      scale++;
    }
    note = nextNote;
  }
  return notes;
};

const mod = (input, n) => ((input % n) + n) % n;
const safeArrayAccess = (array, index) => array[mod(index, array.length)];
const getKey = (index) => safeArrayAccess(ALL_KEYS_ARRAY, index);

const fillSelector = function (selector, elements) {
  elements.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.text = item;
    selector.add(option);
  });
};

const parseIntOrDefault = (value, defaultValue) => {
  if (value) {
    return parseInt(value);
  } else {
    return defaultValue;
  }
};
