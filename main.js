window.dragOverHandler = dragOverHandler;
window.dropHandler = dropHandler;
window.handleFileInput = handleFileInput;
window.copyUnicodeToClipboard = copyUnicodeToClipboard;

const unneccessaryUnicodes = [0, 13, 32];
var unicodesResult = [];

function dropHandler(event) {
  event.preventDefault();

  const files = event.dataTransfer.files;

  if (files.length === 0) {
    console.log("No files dropped");
    return;
  }

  const file = files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const fontFace = new FontFace("customFont", event.target.result);
    fontFace
      .load()
      .then(function (loadedFont) {
        document.fonts.clear();
        document.fonts.add(loadedFont);
        output.style.fontFamily = "customFont";
      })
      .catch(function (error) {
        console.error("Error loading font: " + error);
      });

    const font = opentype.parse(event.target.result);
    document.getElementById("font-name").innerText = font.names.fullName.en;
    getAllCharactersInOrder(font);
  };

  reader.readAsArrayBuffer(file);
}

function getAllCharactersInOrder(font) {
  const glyphs = font.glyphs.glyphs;
  var allCharacters = [];
  var noUnicodeGlyphs = [];

  for (var entry in glyphs) {
    const glyph = glyphs[entry];

    if (glyph.unicode === undefined) noUnicodeGlyphs.push(glyph.name);

    for (var char of glyph.unicodes) {
      allCharacters.push(char);
    }
  }

  if (noUnicodeGlyphs.length != 0) listNoUnicodeGlpyhs(noUnicodeGlyphs);
  drawLettersFromUnicode(allCharacters);
}

function listNoUnicodeGlpyhs(missingUnicodes) {
  var container = document.getElementById("noUniCharsList");
  removeAllChildNodes(container);

  var section = document.getElementById("noUniChars");

  section.hidden = false;

  for (var char of missingUnicodes) {
    var div = document.createElement("div");
    div.className = "missingUnicode";
    div.innerText = char;
    container.appendChild(div);
  }
}

function drawLettersFromUnicode(unicodes) {
  var container = document.getElementById("output");
  removeAllChildNodes(container);
  unicodes.sort(function (a, b) {
    return a - b;
  });

  unicodesResult = unicodes;

  for (var char of unicodes) {
    var div = document.createElement("div");
    var charP = document.createElement("p");
    var charDetails = document.createElement("span");
    var charUnicode = document.createElement("span");

    charP.innerText = String.fromCharCode(char);
    charDetails.innerText = char;
    charUnicode.innerText = "u" + char.toString(16).padStart(4, "0");

    div.className = "char";
    div.appendChild(charP);
    div.appendChild(charUnicode);
    div.appendChild(charDetails);

    container.appendChild(div);
  }
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function copyUnicodeToClipboard() {
  if (unicodesResult.length !== 0) {

    const value = unicodesResult.filter(u => !unneccessaryUnicodes.includes(u));

    navigator.clipboard.writeText(`[${value.join(", ")}]`);
  } else {
    alert("please upload a font first");
  }
}

function handleFileInput(event) {
  console.log(event);
}

function dragOverHandler(event) {
  event.preventDefault();
}
