/** SRS MASTER SCRIPT*/

const UI_INDEX = 0; // Index 1 (second tab)
const DATA_INDEX = 1; // Index 0 (First tab)
const DATA_INDEX_2 = 2; // for the 2nd target-language to learn 

const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheets = ss.getSheets();
const dataSheet = sheets[DATA_INDEX];
const uiSheet = sheets[UI_INDEX];


/** Column Mapping for DATA sheet */
const COL_de = 2;
const COL_exDe = 6;     // Column
const COL_exEn = 7;     // Column
const COL_LAST_REV = 13; // Column 
const COL_COUNT = 14;    // Column 
const COL_OFFSET = 15;   // Column 
const COL_PRIO = 16;     // Column 
const COL_type = 4; // Col D

/** on the UI sheet */
const cardNumberCell = "D2";
const currentRow = uiSheet.getRange(cardNumberCell).getValue(); 
const wordSentenceTogglRow = 16;
const wordSentenceTogglCol = 1;
const shuffleSwitchRow = 14;
const genderSwitchRow = 16;
const genderSwitchCol = 3;
const exampleEnSwitchRow = 16;
const revealSwitchRow = 18;
const hintRow = 14;
const hintCol = 3;

const dailyCounterCell = "B14";
const dailyCountRange = uiSheet.getRange(dailyCounterCell);
const dailyCount = uiSheet.getRange(dailyCounterCell).getValue(); 

/**
  Picks a new card based on the highest priority scores.
 New function
 */
// function shuffleResult() {
//   const lastRow = dataSheet.getLastRow();
//   if (lastRow < 2) {
//     SpreadsheetApp.getUi().alert("Data sheet is empty!");
//     return;
//   }

//   // --- 1. SETTINGS & LIMIT CHECK ---
//   const limitEnabled = uiSheet.getRange("A14").getValue(); // Your limit toggle
//   const maxLimit = uiSheet.getRange("B14").getValue() || 5; // Your daily limit
  
//   // Read current stats from J2:P2 (Count, Countdown, VIP 1-5)
//   const statsRange = uiSheet.getRange("J2:P2");
//   const stats = statsRange.getValues()[0];
  
//   let currentCount = stats[0] || 0;
//   let countdown = stats[1] || 0;
//   const vipPool = stats.slice(2); // L2 through P2

//   if (limitEnabled && currentCount >= maxLimit) {
//     SpreadsheetApp.getUi().alert("🎉 Limit Erreicht! \n\nYou've finished your " + maxLimit + " reviews. Great job!");
//     uiSheet.getRange("J2").setValue(0); // Reset counter for next time
//     return;
//   }

//   // --- 2. MODE DETECTION ---
//   const isWType = uiSheet.getRange("A16").getValue();
//   const targetType = (isWType === true || isWType === "TRUE") ? "word" : "sentence";
//   const lastType = uiSheet.getRange("Q2").getValue(); // Internal tracker for mode switches

//   let winnerRow;

//   // --- 3. SORTING vs. CACHING LOGIC ---
//   // We refresh the pool if: countdown is 0 OR the user switched mode (word <-> sentence)
//   if (countdown <= 0 || targetType !== lastType) {
//     console.log("REFRESHING POOL: Filtering and sorting data...");
    
//     const priorities = dataSheet.getRange(2, COL_PRIO, lastRow - 1).getValues();
//     const types = dataSheet.getRange(2, COL_type, lastRow - 1).getValues();

//     let list = [];
//     for (let i = 0; i < priorities.length; i++) {
//       let pValue = priorities[i][0];
//       let typeValue = types[i][0];
//       if (pValue !== "" && !isNaN(pValue) && typeValue === targetType) {
//         list.push({ row: i + 2, val: pValue });
//       }
//     }

//     if (list.length === 0) {
//       SpreadsheetApp.getUi().alert("No matches for '" + targetType + "' found in Data sheet.");
//       return;
//     }

//     // Sort Descending (Highest Priority first)
//     list.sort((a, b) => b.val - a.val);
    
//     // Take Top 5 and pad with the first one if the list is smaller than 5
//     const top5 = list.slice(0, 5).map(item => item.row);
//     while (top5.length < 5) { top5.push(top5[0]); }

//     winnerRow = top5[Math.floor(Math.random() * top5.length)];
    
//     // Update memory variables
//     currentCount++;
//     countdown = 10;
    
//     // Batch update the stats in J2:Q2
//     uiSheet.getRange("J2:Q2").setValues([[currentCount, countdown, top5[0], top5[1], top5[2], top5[3], top5[4], targetType]]);
//   } 
//   else {
//     console.log("USING CACHE: Picking from VIP pool...");
//     winnerRow = vipPool[Math.floor(Math.random() * vipPool.length)];
    
//     currentCount++;
//     countdown--;

//     // Update the updated Count and Countdown
//     uiSheet.getRange("J2:K2").setValues([[currentCount, countdown]]);
//   }

//   // --- 4. UI CLEANUP ---
//   uiSheet.getRange("D2:G2").setValues([[winnerRow, false, false, false]]);
//   uiSheet.getRangeList(["E2", "H2", "I2"]).clearContent();

//   console.log("SUCCESS: Row " + winnerRow + " selected. Count: " + currentCount);
//   switchOff();
// }


// Old function
function shuffleResult() {
  const lastRow = dataSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("Data sheet is empty!");
    return;
  }

  // --- NEW: Get the Filter Value from UI (Cell A16) for word / sentence toggle---
  const isWType = uiSheet.getRange("A16").getValue(); // TRUE or False
  const targetType = (isWType === true || isWType === "TRUE") ? "word" : "sentence"; // Decide which category to look for using a shortcut called a "Ternary Operator":
  // If isWType is true, targetType becomes "word" (word). If false, it becomes "sentence" (sentence).
  console.log("DEBUG: Checkbox is " + isWType + " | Target Type is: " + targetType);

  // Get Priority values from Column H (8)
  const priorities = dataSheet.getRange(2, COL_PRIO, lastRow - 1).getValues();
  const types = dataSheet.getRange(2, COL_type, lastRow - 1).getValues(); // column D

  let list = []; // Get an empty basket ready to hold the winners
  for (let i = 0; i < priorities.length; i++) { // Start walking down the list, checking one item at a time
    let pValue = priorities[i][0]; // Grab the priority number for the item we are looking at right now
    let typeValue = types[i][0]; // Grab the name, clean up any messy spaces, and make it all small letters
    // --- NEW: Check if it's a number AND matches your "word" vs "sentence" filter ---
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
      "3. Ensure Column I contains exactly 'word' or 'sentence'."
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

//const lastRow = dataSheet.getLastRow();
 // console.log("last row:", lastRow);

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
  uiSheet.getRangeList(["C16", "D16", "D18", "C14"]).setValue(false); // better than repeating getRange() 3 times
}

// 1/23
/**
 * Takes a string and replaces random words with underscores.
 * @param {string} text - The original sentence.
 * @param {number} difficulty - Chance of hiding a word (0.4 = 40%).
 */

/** old */
// 1. function for the new button "Hint?"
// function showHint() {
//   if (!currentRow) return;

//   // 1. Get the original sentence for sentence questions (Column C is 3)
//   const originalSentence = dataSheet.getRange(currentRow, 3).getValue();

//   // 2. Generate the random hint
//   const hint = createRandomHint(originalSentence);

//   // 3. Batch Update: Put hint in I2 and turn on the H2 switch
//   // This triggers the formula in A5 to show the hint instantly
//   uiSheet.getRange("I2").setValue(hint);
//   uiSheet.getRange("H2").setValue(true);
// }

/**new (2/6) */
function showHint() {
  const currentRow = uiSheet.getRange(cardNumberCell).getValue(); 
  if (!currentRow) return;

  // 1. READ the checkbox value (is it checked or not?)
  const isWordMode = uiSheet.getRange(wordSentenceTogglRow, wordSentenceTogglCol).getValue();

  let hint = "";

  // 2. Use the checkbox value (true/false) to decide the logic
  if (isWordMode === true) { 
    // WORD MODE: Get Column B (2)
    const word = dataSheet.getRange(currentRow, COL_de).getValue().toString().trim(); // 3 = Column C
    hint = word.charAt(0) + "...";
    // console.log("DEBUG: Word hint is " + hint);
  } 
  else {
    // SENTENCE MODE: Get Column C (3)
    const originalSentence = dataSheet.getRange(currentRow, COL_de).getValue();
    hint = createRandomHint(originalSentence);
    // console.log("DEBUG: Sentence hint generated");
  }

  // 3. Update the UI
  uiSheet.getRange("I2").setValue(hint);
  uiSheet.getRange("H2").setValue(true);
}

// renewed due to the updated formula in A9
function createRandomHint(text) {
  if (!text) return "";
  let words = text.split(" ");
  return words.map(word => (Math.random() < 0.6 && word.length > 3) ? "___" : word).join(" ");
}

// daily counter (3/7)
function resetOnDateChange() {
  const props = PropertiesService.getScriptProperties();      // [web:20]
  const lastDate = props.getProperty('last_run_date');        // Read the last stored run date string, e.g. "2026-03-07"
  const today = new Date(); // Get the current date and time as a Date object
  const todayKey = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd'); // Convert today's Date into a yyyy-MM-dd string in the script's time zone

  // Only run reset logic if date changed
  if (lastDate !== todayKey) {
     uiSheet.getRange(dailyCounterCell).setValue(0);
    // Update stored date
    props.setProperty('last_run_date', todayKey);
  }
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
  if (row == wordSentenceTogglRow && col == wordSentenceTogglCol) {
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
    // currentCount++; edit
    dailyCountRange.setValue(dailyCount + 1);
    switchOff();
  }

  // side buttons
  if (col == 4) {
    if (row == shuffleSwitchRow) {
      shuffleResult();
      range.setValue(false);
      switchOff();
    }

    // range.setValue(false); // ... maybe not needed?
    if (row == exampleEnSwitchRow) showExample();
    if (row == revealSwitchRow) revealAnswer();
  }

  if (row == genderSwitchRow && col == genderSwitchCol) showGender();

  if (row == hintRow && col == hintCol) showHint();

  // self debug
  // console.log("SUCCESS: onEdit ran to the end for Row: " + winner.row);
}
