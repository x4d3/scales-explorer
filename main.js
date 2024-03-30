document.addEventListener("DOMContentLoaded", function () {
  const app = document.getElementById("app");

  const scalesSelector = document.createElement("select");
  const canvas = document.createElement("div");
  canvas.classList.add("music-sheet");
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

const INTERVAL_TYPES = {
  W: 2,
  H: 1,
};
const parseInterval = (s) => {
  return s.split("-").map((c) => INTERVAL_TYPES[c]);
};

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
    intervals: parseInterval("W-H-W-W-W-H-W"),
    startNote: "D",
    startKey: "C",
    description:
      "Commonly used in many famous tracks, it’s also a music mode popular in film scores, creating soundtracks that both sound massive and intriguing.",
  },
  Locrian: {
    intervals: parseInterval("H-W-W-H-W-W-W"),
    startNote: "B",
    startKey: "C",
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
      const rect = e.target.getBoundingClientRect();
      const y = e.clientY - rect.top; //y position within the element.
      this.updateIndex(y < rect.height / 2 ? 1 : -1);
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

  fireParamChanged() {
    const { index, scale } = this;
    this.refresh();
    this.changeParamsListeners.forEach((listener) => listener(index, scale));
  }

  refresh = () => {
    const { canvas, description, index, scale } = this;
    const { startNote, intervals, startKey } = SCALES[scale];
    const key = getKey(ALL_KEYS[startKey].int_val + index);
    const firstNote = safeArrayAccess(ALL_KEYS_ARRAY, index + ALL_KEYS[startNote].int_val);

    canvas.innerHTML = "";
    const renderer = new Renderer(canvas, Renderer.Backends.SVG);
    const context = renderer.getContext();
    renderer.resize(800, 200);

    const stave = new Stave(10, 40, 600);
    stave.addClef("treble").addKeySignature(key).setContext(context).draw();
    const { accidentals } = ALL_KEYS[key];
    const octave = 3 + Math.floor(index / 12);
    const notes = generatesScale(firstNote, intervals, accidentals, octave);

    // Create a voice in 4/4 and add above notes
    const voice = new Voice({ num_beats: notes.length, beat_value: 4 });
    voice.addTickables(notes);

    // Format and justify the notes to 400 pixels.
    new Formatter().joinVoices([voice]).format([voice], 480);

    // Render voice
    voice.draw(context, stave);

    description.innerHTML = `${firstNote} ${scale}`;
  };
}

const { Renderer, Stave, StaveNote, Accidental, Formatter, Voice } = Vex.Flow;

const generatesScale = (firstNote, intervals, accidentals, octave) => {
  let note = firstNote;
  const notes = [];
  for (let i = 0; i < 15; i++) {
    const noteLetter = note.slice(0, 1);
    const staveNote = new StaveNote({
      keys: [`${noteLetter}/${octave}`],
      duration: "q",
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
      octave++;
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
