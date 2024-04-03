document.addEventListener("DOMContentLoaded", function () {
  const randomizeButton = document.getElementById("randomise");
  const scalesSelector = document.getElementById("scales-selector");

  const musicSheetDiv = document.getElementById("music-sheet");
  const descriptionDiv = document.getElementById("description");
  const urlParams = new URLSearchParams(window.location.search);
  const index = parseIntOrDefault(urlParams.get("index"), 0);
  const scaleIndex = parseIntOrDefault(urlParams.get("scale"), 0);
  const scale = SCALES_ARRAY[scaleIndex];

  const explorer = new Explorer(musicSheetDiv, scalesSelector, descriptionDiv, scale, index);
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
  randomizeButton.onclick = () => {
    explorer.randomize();
  };

  explorer.onParamsChange((index, scale) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("index", index);
    urlParams.set("scale", SCALES_ARRAY.indexOf(scale));
    window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
  });
});

const MAJOR_INTERVALS = [2, 2, 1, 2, 2, 2, 1];
const MINOR_INTERVALS = [2, 1, 2, 2, 1, 2, 2];

const INTERVAL_TYPES = {
  A2: 3,
  W: 2,
  H: 1,
};

const INTERVALS_TYPES_INVERSE = Object.entries(INTERVAL_TYPES).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

const intervalsToString = (intervals) => {
  return intervals.map((i) => INTERVALS_TYPES_INVERSE[i]).join(" - ");
};

const parseInterval = (s) => {
  return s.split("-").map((c) => INTERVAL_TYPES[c]);
};

const formatNote = (note) => {
  return note.replace("b", "♭").replace("#", "♯");
};

const SCALES = {
  "Major Scale / Ionian mode": {
    shortcut: "MAJOR",
    intervals: MAJOR_INTERVALS,
    startNote: "C",
    startKey: "C",
    description:
      'The <b>major scale</b> (or <a href="https://en.wikipedia.org/wiki/Ionian_mode" title="Ionian mode">Ionian mode</a>) is one of the most commonly used <a href="https://en.wikipedia.org/wiki/Scale_(music)" title="Scale (music)">musical scales</a>, especially in <a href="https://en.wikipedia.org/wiki/Western_culture#Music" title="Western culture">Western music</a>. It is one of the <a href="https://en.wikipedia.org/wiki/Diatonic_scale" title="Diatonic scale">diatonic scales</a>. Like many musical scales, it is made up of seven <a href="https://en.wikipedia.org/wiki/Musical_note" title="Musical note">notes</a>: the eighth duplicates the first at double its <a href="https://en.wikipedia.org/wiki/Frequency" title="Frequency">frequency</a> so that it is called a higher <a href="https://en.wikipedia.org/wiki/Octave" title="Octave">octave</a> of the same note (from Latin "octavus", the eighth).',
    url: "https://en.wikipedia.org/wiki/Major_scale",
  },
  "Natural Minor / Aeolian mode": {
    shortcut: "Nat MINOR",
    intervals: MINOR_INTERVALS,
    startNote: "C",
    startKey: "Eb",
    description:
      'The <b>Aeolian mode</b> is a <a href="https://en.wikipedia.org/wiki/Mode_(music)" title="Mode (music)">musical mode</a> or, in modern usage, a <a href="https://en.wikipedia.org/wiki/Diatonic_scale" title="Diatonic scale">diatonic scale</a> also called the <a href="https://en.wikipedia.org/wiki/Natural_minor_scale" class="mw-redirect" title="Natural minor scale">natural minor scale</a>. On the white piano keys, it is the scale that starts with A. Its ascending <a href="https://en.wikipedia.org/wiki/Musical_interval" class="mw-redirect" title="Musical interval">interval form</a> consists of a <i>key note, whole step, half step, whole step, whole step, half step, whole step, whole step.</i> That means that, in A aeolian (or A minor), you would play A, move up a whole step (two piano keys) to B, move up a half step (one piano key) to C, then up a whole step to D, a whole step to E, a half step to F, a whole step to G, and a final whole step to a high A.\n' +
      "</p>",
    url: "https://en.wikipedia.org/wiki/Minor_scale#Natural_minor_scale",
  },
  "Harmonic Minor Scale": {
    shortcut: "Harm MINOR",
    intervals: parseInterval("W-H-W-W-H-A2-H"),
    startNote: "C",
    startKey: "Eb",
    description:
      "The harmonic minor scale (or Aeolian ♯7 scale) has the same notes as the natural minor scale except that the seventh degree is raised by one semitone, creating an augmented second between the sixth and seventh degrees.",
    url: "https://en.wikipedia.org/wiki/Minor_scale#Harmonic_minor_scale",
  },
  "Ascending Melodic Minor Scale / Jazz minor scale": {
    shortcut: "Mel MINOR",
    intervals: parseInterval("W-H-W-W-W-W-H"),
    startNote: "C",
    startKey: "Eb",
    description:
      "The jazz minor scale or ascending melodic minor scale is a derivative of the melodic minor scale, except only the ascending form of the scale is used. As the name implies, it is primarily used in jazz, although it may be found in other types of music as well. It may be derived from the major scale with a minor third, making it a synthetic scale, and features a dominant seventh chord on the fifth degree (V) like the harmonic minor scale. It can also be derived from the diatonic Dorian mode with a major seventh.",
    url: "https://en.wikipedia.org/wiki/Jazz_minor_scale",
  },
  "Dorian mode": {
    intervals: parseInterval("W-H-W-W-W-H-W"),
    startNote: "D",
    startKey: "C",
    description:
      'The Dorian mode (also called "Russian minor" by Balakirev) is a strictly <a href="/wiki/Diatonic_scale">diatonic scale</a> corresponding to the white keys of the piano from D to D.',
    url: "https://en.wikipedia.org/wiki/Dorian_mode#Modern_Dorian_mode",
  },
  "Phrygian mode": {
    intervals: parseInterval("H-W-W-W-H-W-W"),
    startNote: "E",
    startKey: "C",
    description:
      "The Phrygian mode is a musical scale derived from the natural minor scale, with a lowered second scale degree. In terms of intervals, the Phrygian mode features a minor second (m2), minor third (m3), perfect fourth (P4), perfect fifth (P5), minor sixth (m6), and minor seventh (m7). Its characteristic lowered second degree (root, minor second) gives it a distinctively exotic and somewhat dissonant quality, making it a popular choice for creating tension and adding color in various musical compositions across genres.",
    url: "https://en.wikipedia.org/wiki/Phrygian_mode#Modern_Phrygian_mode",
  },
  "Lydian mode": {
    intervals: parseInterval("W-W-W-H-W-W-H"),
    startNote: "F",
    startKey: "C",
    description:
      "The Lydian mode is the fourth mode of the major scale. It’s a bright and happy mode that’s used in many famous songs.",
    url: "https://en.wikipedia.org/wiki/Lydian_mode",
  },
  "Mixolydian mode": {
    intervals: parseInterval("W-W-H-W-W-H-W"),
    startNote: "G",
    startKey: "C",
    description:
      "The Mixolydian mode is the fifth mode of the major scale, featuring a lowered seventh degree compared to the Ionian mode (W-W-H-W-W-H-W), resulting in a major sound with a bluesy and relaxed feel commonly heard in rock, blues, and jazz improvisation.",
    url: "https://en.wikipedia.org/wiki/Mixolydian_mode",
  },
  "Locrian mode": {
    intervals: parseInterval("H-W-W-H-W-W-W"),
    startNote: "B",
    startKey: "C",
    description:
      "The Locrian mode is the seventh mode of the major scale, featuring a lowered second, third, fifth, sixth, and seventh degree compared to the Ionian mode (H-W-W-H-W-W-W), resulting in a highly dissonant and unstable sound rarely used in traditional tonal music but sometimes employed in avant-garde and experimental compositions for its tense and unresolved quality.",
    url: "https://en.wikipedia.org/wiki/Locrian_mode",
  },
  "Hungarian minor scale": {
    intervals: parseInterval("W-H-A2-H-H-A2-H"),
    startNote: "C",
    startKey: "Eb",
    description:
      'The <b>Hungarian minor scale</b>, <b>double harmonic minor scale</b>, or <b>Gypsy minor scale</b>is a type of combined <a href="https://en.wikipedia.org/wiki/Musical_scale" class="mw-redirect" title="Musical scale">musical scale</a>. It is the fourth <a href="https://en.wikipedia.org/wiki/Mode_(music)" title="Mode (music)">mode</a> of the <a href="https://en.wikipedia.org/wiki/Double_harmonic_scale" title="Double harmonic scale">double harmonic scale</a>. It is the same as the <a href="https://en.wikipedia.org/wiki/Harmonic_minor_scale" title="Harmonic minor scale">harmonic minor scale</a>, except that it has a raised fourth <a href="https://en.wikipedia.org/wiki/Scale_degree" class="mw-redirect" title="Scale degree">scale degree</a>to introduce an additional <a href="https://en.wikipedia.org/wiki/Steps_and_skips" title="Steps and skips">gap</a>, or augmented second. It is a symmetrical scale with a slightly ambiguous tonal centre, due to the many half steps.',
    url: "https://en.wikipedia.org/wiki/Hungarian_minor_scale",
  },
  "Spanish/Jewish Scale": {
    intervals: parseInterval("H-A2-H-W-H-W-W"),
    startNote: "G",
    startKey: "C",
    description:
      'The Spanish/Jewish Scale or <b>Phrygian dominant scale</b> is the fifth <a href="/wiki/Musical_mode" class="mw-redirect" title="Musical mode">mode</a> of the <a href="/wiki/Minor_scale#Harmonic_and_melodic_minor" title="Minor scale">harmonic minor scale</a>, the fifth being the <a href="/wiki/Dominant_(music)" title="Dominant (music)">dominant</a>.<sup id="cite_ref-Hunter_1-0" class="reference"><a href="#cite_note-Hunter-1">[1]</a></sup> Also called the <b>altered Phrygian scale</b>, <b>dominant flat 2 flat 6</b> (in jazz), or <b>Freygish scale</b> (also spelled Fraigish<sup id="cite_ref-W&amp;F_2-0" class="reference"><a href="#cite_note-W&amp;F-2">[2]</a></sup>). It resembles the <a href="/wiki/Phrygian_mode" title="Phrygian mode">Phrygian mode</a> but with a <a href="/wiki/Major_third" title="Major third">major third</a>, rather than a <a href="/wiki/Minor_third" title="Minor third">minor third</a>.',
    url: "https://en.wikipedia.org/wiki/Phrygian_dominant_scale",
  },
};
const SCALES_ARRAY = Object.keys(SCALES);
const ALL_KEYS = {
  C: { root_index: 0, int_val: 0, accidentals: [] },
  Db: {
    root_index: 1,
    int_val: 1,
    accidentals: ["Bb", "Eb", "Ab", "Db", "Gb"],
    equivalent: "C#",
  },
  D: { root_index: 1, int_val: 2, accidentals: ["F#", "C#"] },
  Eb: { root_index: 2, int_val: 3, accidentals: ["Bb", "Eb", "Ab"], equivalent: "D#" },
  E: { root_index: 2, int_val: 4, accidentals: ["F#", "C#", "G#", "D#"] },
  F: { root_index: 3, int_val: 5, accidentals: ["Bb"] },
  "F#": {
    root_index: 3,
    int_val: 6,
    accidentals: ["F#", "C#", "G#", "D#", "A#", "E#"],
  },
  G: { root_index: 4, int_val: 7, accidentals: ["F#"] },
  Ab: { root_index: 5, int_val: 8, accidentals: ["Bb", "Eb", "Ab", "Db"], equivalent: "G#" },
  A: { root_index: 5, int_val: 9, accidentals: ["F#", "C#", "G#"] },
  Bb: { root_index: 6, int_val: 10, accidentals: ["Bb", "Eb"], equivalent: "A#" },
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
  Eb: ["Fb", "F", "F#"],
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
  Ab: ["Bbb", "Bb", "B"],
  A: ["Bb", "B", "B#"],
  "A#": ["B", "B#", "C#"],
  "A##": ["C", "C#", "D"],

  Bbb: ["Bb", "B", "C"],
  Bb: ["Cb", "C", "C#"],
  B: ["C", "C#", "C##"],
  "B#": ["C#", "C##", "D#"],
};

const ALL_KEYS_ARRAY = Object.keys(ALL_KEYS);

const isFlat = (note) => note.slice(1, 2) === "b";

const isSharp = (note) => note.slice(1, 2) === "#";

class Explorer {
  constructor(musicSheetDiv, scalesSelector, descriptionDiv, scale, index) {
    this.musicSheetDiv = musicSheetDiv;
    this.descriptionDiv = descriptionDiv;
    this.scalesSelector = scalesSelector;
    this.index = index;
    this.scale = scale;
    this.changeParamsListeners = [];
    musicSheetDiv.addEventListener("click", (e) => {
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

  randomize() {
    this.index = Math.floor(Math.random() * 24) - 12;
    this.scale = SCALES_ARRAY[Math.floor(Math.random() * SCALES_ARRAY.length)];
    this.scalesSelector.value = this.scale;
    this.fireParamChanged();
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
    const { titleDiv, musicSheetDiv, descriptionDiv, index, scale } = this;
    const { shortcut, startNote, intervals, startKey, description, url } = SCALES[scale];

    const relativeIndex = ALL_KEYS[startKey].int_val + index;
    const key = getKey(relativeIndex);
    const { accidentals } = ALL_KEYS[key];
    let firstNote = safeArrayAccess(ALL_KEYS_ARRAY, index + ALL_KEYS[startNote].int_val);
    const octave = 4 + Math.floor((index - ALL_KEYS[firstNote].int_val) / 12);

    if (isFlat(firstNote) && accidentals.some(isSharp)) {
      firstNote = ALL_KEYS[firstNote].equivalent;
    }

    musicSheetDiv.innerHTML = "";
    const renderer = new Renderer(musicSheetDiv, Renderer.Backends.SVG);
    const context = renderer.getContext();
    renderer.resize(600, 200);
    const stave = new Stave(0, 25, 600);
    stave.addClef("treble").addKeySignature(key).setContext(context).draw();
    const notes = generatesScale(firstNote, intervals, accidentals, octave);
    Formatter.FormatAndDraw(context, stave, notes);

    if (shortcut) {
      const title = document.createElement("div");
      title.innerHTML = `${formatNote(firstNote)} ${shortcut}`;
      title.style.position = "absolute";
      musicSheetDiv.insertBefore(title, musicSheetDiv.firstChild);
    }
    descriptionDiv.innerHTML = `<h3>${intervalsToString(intervals)}</h3> ${description} <p></p><a href="${url}" >Learn more</a></p>`;
  };
}

const { Renderer, Stave, Stem, StaveNote, Accidental, Formatter, Voice } = Vex.Flow;

function parseNote(note) {
  return {
    noteLetter: note.slice(0, 1),
    accidental: note.slice(1),
  };
}

const generatesScale = (firstNote, intervals, accidentals, octave) => {
  let note = firstNote;
  const notes = [];
  for (let i = 0; i < 15; i++) {
    const { noteLetter, accidental } = parseNote(note);
    const staveNote = new StaveNote({
      keys: [`${noteLetter}/${octave}`],
      duration: "w",
    });
    if (!accidentals.includes(note)) {
      if (accidental) {
        staveNote.addModifier(new Accidental(accidental));
      } else {
        if (accidentals.includes(`${note}b`) || accidentals.includes(`${note}#`)) {
          staveNote.addModifier(new Accidental("n"));
        }
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
  if (value && isNumber(value)) {
    return parseInt(value);
  } else {
    return defaultValue;
  }
};

const isNumber = (value) => !isNaN(value);
