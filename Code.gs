/** SRS MASTER SCRIPT*/

const DATA_INDEX = 0; // Index 0 (First tab)
const UI_INDEX = 1; // Index 1 (second tab)

// Column Mapping for DATA SHEET
const COL_exDe = 7;     // Column
const COL_exEn = 6;     // Column
const COL_LAST_REV = 13; // Column 
const COL_COUNT = 14;    // Column 
const COL_OFFSET = 15;   // Column 
const COL_PRIO = 16;     // Column 

const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheets = ss.getSheets();
const dataSheet = sheets[DATA_INDEX];
const uiSheet = sheets[UI_INDEX];

/** on the UI sheet */
const cardNumberCell = "D2";
const toggleRow = 16;
const toggleCol = 1;
const shuffleSwitchRow = 12;
const genderSwitchRow = 14;
const exampleEnSwitchRow = 16;
const revealSwitchRow = 18;
const hintRow = 12;
const hintCol = 3;

/**
 * Picks a new card based on the highest priority scores.
 */
function shuffleResult() {
  const lastRow = dataSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("Data sheet is empty!");
    return;
  }

  // --- NEW: Get the Filter Value from UI (Cell A16) for word / sentence toggle---
  const isWType = uiSheet.getRange("A16").getValue(); // TRUE or False
  const targetType = (isWType === true || isWType === "TRUE") ? "w" : "s"; // Decide which category to look for using a shortcut called a "Ternary Operator":
  // If isWType is true, targetType becomes "w" (word). If false, it becomes "s" (sentence).
  console.log("DEBUG: Checkbox is " + isWType + " | Target Type is: " + targetType);

  // Get Priority values from Column H (8)
  const priorities = dataSheet.getRange(2, COL_PRIO, lastRow - 1).getValues();
  const types = dataSheet.getRange(2, 4, lastRow - 1).getValues(); // column D

  let list = []; // Get an empty basket ready to hold the winners
  for (let i = 0; i < priorities.length; i++) { // Start walking down the list, checking one item at a time
    let pValue = priorities[i][0]; // Grab the priority number for the item we are looking at right now
    let typeValue = types[i][0].toString().trim().toLowerCase();; // Grab the name, clean up any messy spaces, and make it all small letters
    // --- NEW: Check if it's a number AND matches your "w" vs "s" filter ---
    if (pValue !== "" && !isNaN(pValue) && typeValue === targetType) { // The Security Guard: Is it not empty? Is it a real number? And is it the specific type we want?
      list.push({ row: i + 2, val: pValue }); // If it passed the test, save its row number and score into our basket!
    }
  }

  if (list.length === 0) {
    let sampleType = types[0] ? types[0][0] : "Empty";
    SpreadsheetApp.getUi().alert(
      "ERROR: No matches found.\n\n" +
      "1. Script is looking for: '" + targetType + "'\n" +
      "2. First row in Data (Col I) actually has: '" + sampleType + "'\n" +
      "3. Ensure Column I contains exactly 'w' or 's'."
    );
    return;
  }

  // Sort by highest priority and pick from top 5 for variety
  list.sort((a, b) => b.val - a.val); // Line them up! Put the ones with the biggest numbers at the very front of the line.
  const topPool = list.slice(0, 5); // Take only the first 5 people in line (the best ones) and put them in a special VIP group.
  const winner = topPool[Math.floor(Math.random() * topPool.length)]; // Close your eyes, reach into the VIP group, and pick one lucky winner at random!

  /** explanation of the code above (for myself)
   In JavaScript, the .sort() function doesn't automatically know how you want to sort things (especially objects), so it asks for your help.
The (a, b) are simply placeholders for "two items from the list that we are comparing right now."
Here is the step-by-step breakdown of how the computer thinks:
1. The Setup
Imagine the computer holding two items from your list in its hands:
Left hand: Item a (e.g., score of 10)
Right hand: Item b (e.g., score of 50)
It asks you: "Which one should come first?"
2. The Rule
You answer by giving it a formula: b.val - a.val. The computer calculates the result and follows this simple rule:
If the result is Positive (+): Put b before a.
If the result is Negative (-): Put a before b.
If the result is Zero (0): Keep them where they are.

   The Cheat Sheet
a - b = Ascending (Smallest to Biggest) -> Think "A" for Ascending
b - a = Descending (Biggest to Smallest) -> The reverse
   */
  // Update UI hidden cells
  uiSheet.getRange("D2:G2").setValues([[winner.row, false, false, false]]);
  // uiSheet.getRange("D2").setValue(winner.row); // Store the Row ID
  // uiSheet.getRange("E2").setValue(false);      // Reset toReveal to False
  // uiSheet.getRange("F2").setValue(false); // my own added 
  // uiSheet.getRange("G2").setValue(false); // added

  // This turns off Reveal (E2), turns off Hint (H2), and wipes the old hint (I2)
  uiSheet.getRangeList(["E2", "H2", "I2"]).clearContent();

  console.log("SUCCESS: shuffleResult ran to the end for Row: " + winner.row);
  switchOff();
}


/**
 * Reveals the German sentence on the UI.
 */
function revealAnswer() {
  uiSheet.getRange("E2").setValue(true);
}

/**
 * Updates the data and triggers the next shuffle.
 */
function updateValue(points) {
  const currentRow = uiSheet.getRange("D2").getValue();
  if (!currentRow) return;

  // 1. Update Last Review Date (E)
  dataSheet.getRange(currentRow, COL_LAST_REV).setValue(new Date());

  // 2. Increment Times Studied (F)
  const currentCount = dataSheet.getRange(currentRow, COL_COUNT).getValue() || 0;
  dataSheet.getRange(currentRow, COL_COUNT).setValue(currentCount + 1);

  // 3. Add points to Manual Offset (G)
  const currentOffset = dataSheet.getRange(currentRow, COL_OFFSET).getValue() || 0;
  dataSheet.getRange(currentRow, COL_OFFSET).setValue(currentOffset + points);

  // 4. Move to next card
  shuffleResult();
}

// Button Triggers
function btn_Easy() { updateValue(-15); }
function btn_Good() { updateValue(-5); }
function btn_Hard() { updateValue(5); }
function btn_Impossible() { updateValue(15); }

// my own edition: add a button to give hints
function showGender() {
  uiSheet.getRange("F2").setValue(true);
}

// my own edition: add a button to give hints 2 (example sentence)
function showExample() {
  uiSheet.getRange("G2").setValue(true);
}

// 1/21: new function for toggling multiple switches unticked
function switchOff() {
  uiSheet.getRangeList(["D14", "D16", "D18", "C12"]).setValue(false); // better than repeating getRange() 3 times
}

// 1/23
/**
 * Takes a string and replaces random words with underscores.
 * @param {string} text - The original sentence.
 * @param {number} difficulty - Chance of hiding a word (0.4 = 40%).
 */
// 1. function for the new button "Hint?"
function showHint() {
  const currentRow = uiSheet.getRange("D2").getValue(); // Using D2 as per your formula
  if (!currentRow) return;

  // 1. Get the original sentence for sentence questions (Column C is 3)
  const originalSentence = dataSheet.getRange(currentRow, 3).getValue();

  // 2. Generate the random hint
  const hint = createRandomHint(originalSentence);

  // 3. Batch Update: Put hint in I2 and turn on the H2 switch
  // This triggers the formula in A5 to show the hint instantly
  uiSheet.getRange("I2").setValue(hint);
  uiSheet.getRange("H2").setValue(true);
}

// renewed due to the updated formula in A9
function createRandomHint(text) {
  if (!text) return "";
  let words = text.split(" ");
  return words.map(word => (Math.random() < 0.4 && word.length > 2) ? "___" : word).join(" ");
}


// for Mobile
/**
 * This function runs automatically every time a cell is edited.
 * It acts as the "Mobile Button" handler.
 */
function onEdit(e) {
  const range = e.range;
  const val = range.getValue();
  const row = range.getRow();
  const col = range.getColumn();

  // A. the switch / toggle
  if (row == toggleRow && col == toggleCol) {
    shuffleResult();
    // NOTE: We do NOT put 'range.setValue(false)' here. 
    // This allows the checkbox to stay ticked!
    return;
  }

  // B. Gate Keeper: Only run if the cell was checked (TRUE)
  if (val !== true) return;

  // C. The Buttons:
  if (row == 20) {
    if (col == 1) btn_Easy();      // F20: Easy
    if (col == 2) btn_Good();      // D10: Good
    if (col == 3) btn_Hard();      // E10: Hard
    if (col == 4) btn_Impossible();// F10: Impossible    
    // Auto-uncheck the box so it's ready to be "clicked" again
    range.setValue(false);
    switchOff();
  }

  // side buttons
  if (col == 4) {
    if (row == shuffleSwitchRow) {
      shuffleResult();
      range.setValue(false);
      switchOff();
    }
    if (row == genderSwitchRow) showGender();
    // range.setValue(false); // ... maybe not needed?
    if (row == exampleEnSwitchRow) showExample();
    if (row == revealSwitchRow) revealAnswer();
  }

  if (row == hintRow && col == hintCol) showHint();

  // self debug
  console.log("SUCCESS: onEdit ran to the end for Row: " + winner.row);
}
