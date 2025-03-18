// main.js

import {
    majorScale,
    naturalMinorScale,
    harmonicMinorScale,
    melodicMinorScale,
    chromaticScale,
    dorianScale,
    phrygianScale,
    lydianScale,
    mixolydianScale,
  } from "./scaleLogic.js";
  
  // We'll load Tone.js and piano-chart in <script> tags in HTML, 
  // so they'll be available as global variables Tone and PianoChart.
  // For VexFlow, we might also rely on a global, or import from a module build. 
  // For simplicity, let's assume VexFlow is loaded as a global 'Vex'.
  
  
  //////////////////////
  // HELPER: RENDER STAFF WITH VEXFLOW
  //////////////////////
  function renderStaff(scaleText, containerId) {
    // scaleText is e.g. "C major is: C, D, E, F, G, A, B"
    // We'll parse the notes after the colon to get them in an array.
    // Then we feed them into VexFlow. 
    // We'll store them as something like ["c/4","d/4","e/4", ...].
  
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // clear old
  
    // parse out the portion after the colon
    let pieces = scaleText.split(" is: ");
    if (pieces.length < 2) {
      container.innerHTML = "<p>Cannot parse scale: " + scaleText + "</p>";
      return;
    }
    let justNotes = pieces[1].trim(); // e.g. "C, D, E, F, G, A, B"
    let noteArray = justNotes.split(",").map(n => n.trim()); // e.g. ["C","D","E","F","G","A","B"]
  
    // set up vexflow
    const VF = Vex.Flow;
    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(600, 160);
    const context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
  
    // stave
    const stave = new VF.Stave(10, 20, 580);
    stave.addClef("treble").setContext(context).draw();
  
    // convert noteArray to VexFlow StaveNotes
    // We'll guess everything around 4th octave, but you could refine 
    // (like if "B" then "b/3" or "b/4"?).
    // For now let's do a naive approach: 
    function toVexKey(noteName) {
      // "C" -> "c", "C#"-> "c#", "Db"->"db", etc. Then add "/4"
      let lower = noteName.toLowerCase(); // "c", "c#", "db" ...
      return lower + "/4";
    }
  
    const vexNotes = noteArray.map(n => new VF.StaveNote({
      clef: "treble",
      keys: [toVexKey(n)],
      duration: "q"
    }));
  
    // create voice
    const voice = new VF.Voice({ num_beats: vexNotes.length, beat_value: 4 });
    voice.addTickables(vexNotes);
  
    // format
    new VF.Formatter().joinVoices([voice]).format([voice], 550);
  
    // draw
    voice.draw(context, stave);
  }
  
  //////////////////////
  // HELPER: PLAY NOTES WITH TONE
  //////////////////////
  function playScale(scaleText) {
    // Parse the note array from the scale text, then 
    // schedule them in Tone.js at half-second intervals.
  
    let pieces = scaleText.split(" is: ");
    if (pieces.length < 2) return;
    let justNotes = pieces[1].trim();
    let noteArray = justNotes.split(",").map(n => n.trim());
  
    const synth = new Tone.Synth().toDestination();
    let now = Tone.now();
  
    noteArray.forEach((note, i) => {
      // map note e.g. "C#" to "C#4" for Tone. 
      // This is naive, but you can get fancier if you want correct octaves. 
      let pitch = note + "4";
      synth.triggerAttackRelease(pitch, "8n", now + i * 0.5);
    });
  }
  
  //////////////////////
  // HELPER: HIGHLIGHT PIANO KEYS
  //////////////////////
  let piano = null;
  export function initPianoChart(divId) {
    // if we included piano-chart via a <script> in HTML, 
    // then `window.PianoChart` is available
    piano = new window.PianoChart({
      element: document.getElementById(divId),
      octaves: 2,
      startOctave: 3,
    });
  }
  
  // highlight keys from a scale text
  function highlightKeys(scaleText) {
    if (!piano) return;
    // parse note array
    let pieces = scaleText.split(" is: ");
    if (pieces.length < 2) return;
    let justNotes = pieces[1].trim();
    let noteArray = justNotes.split(",").map(n => n.trim());
  
    // We'll map each note to e.g. "c#4", "d4", etc. 
    // Then call piano.highlight([...], 'blue')
    let newHighlights = [];
    noteArray.forEach(n => {
      newHighlights.push(n.toLowerCase() + "4"); // e.g. "c#4"
    });
    // Clear old highlights first
    piano.resetHighlights();
    // Now highlight
    piano.highlight(newHighlights, "blue");
  }
  
  //////////////////////
  // HOOK INTO SCALES PAGE
  //////////////////////
  const scaleForm = document.getElementById("scaleForm");
  if (scaleForm) {
    scaleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let root = document.getElementById("scaleRoot").value;
      let scaleType = document.getElementById("scaleType").value;
  
      let output = "";
      switch(scaleType) {
        case "major":
          output = majorScale(root);
          break;
        case "naturalMinor":
          output = naturalMinorScale(root);
          break;
        case "harmonicMinor":
          output = harmonicMinorScale(root);
          break;
        case "melodicMinor":
          output = melodicMinorScale(root);
          break;
        case "chromatic":
          output = chromaticScale(root);
          break;
      }
  
      let resultDiv = document.getElementById("scaleResult");
      resultDiv.textContent = output;
  
      // Render staff
      renderStaff(output, "scaleStaff");
  
      // highlight piano
      highlightKeys(output);
    });
  
    // PLAY button
    const playBtn = document.getElementById("playScaleBtn");
    playBtn.addEventListener("click", () => {
      let text = document.getElementById("scaleResult").textContent;
      if (text) {
        // Start Tone context
        Tone.start();
        playScale(text);
      }
    });
  }
  
  //////////////////////
  // HOOK INTO MODES PAGE
  //////////////////////
  const modeForm = document.getElementById("modeForm");
  if (modeForm) {
    modeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let root = document.getElementById("modeRoot").value;
      let modeType = document.getElementById("modeType").value;
      let output = "";
  
      switch(modeType) {
        case "dorian":
          output = dorianScale(root);
          break;
        case "phrygian":
          output = phrygianScale(root);
          break;
        case "lydian":
          output = lydianScale(root);
          break;
        case "mixolydian":
          output = mixolydianScale(root);
          break;
      }
  
      let resultDiv = document.getElementById("modeResult");
      resultDiv.textContent = output;
  
      // Render staff
      renderStaff(output, "modeStaff");
  
      // highlight piano
      highlightKeys(output);
    });
  
    // PLAY
    const playModeBtn = document.getElementById("playModeBtn");
    playModeBtn.addEventListener("click", () => {
      let text = document.getElementById("modeResult").textContent;
      if (text) {
        Tone.start();
        playScale(text);
      }
    });
  }
  