![App Demo](UI.png)
![App Demo](data_sheet.png)
<img width="514" height="726" alt="image" src="https://github.com/user-attachments/assets/d5526a02-2189-4a3e-9a87-f6aa9c86c9fe" />
<img width="1178" height="632" alt="image" src="https://github.com/user-attachments/assets/ad54b6b9-c5f4-4ec4-95f2-36444522e2ec" />

# german-srs-app# 🇩🇪 LingoSheet: Custom Spaced-Repetition System (SRS)

A high-performance, mobile-optimized language learning application built on the Google Workspace ecosystem. This tool automates vocabulary retention through custom JavaScript logic and a dynamic user interface.

## 🚀 Key Features
- **Smart Shuffle Engine:** A weighted randomization algorithm that prioritizes "Hard" vocabulary over mastered words.
- **Mobile-First UX:** Custom-engineered touch targets and "Button Areas" designed for one-handed thumb navigation.
- **Dynamic Cloze Deletion:** A randomized hint generator that utilizes JavaScript string manipulation to hide context-clues for enhanced recall.
- **Dual-Mode Learning:** Toggle system to switch between "Word" (vocabulary) and "Sentence" (grammar/context) modes.
- **Automated Metadata:** Tracks study dates, priority shifts, and performance metrics automatically.

## 🛠️ Technical Stack
- **Language:** JavaScript (Google Apps Script)
- **Engine:** Google V8 Runtime
- **Frontend:** Google Sheets UI with Conditional Formatting
- **Data Store:** Structured Spreadsheet DB

## 🧠 Logic Highlight: The Priority Engine
The core of the app uses a priority-based filtering system. Instead of simple randomization, the script evaluates the `Priority` column (H) to ensure low-confidence items appear more frequently, simulating professional SRS software like Anki.

## 📸 Preview
![App Demo](link-to-your-gif-here.gif)
*Caption: Demonstrating the "Shuffle" logic and the "Random Hint" generator.*

## ⚙️ Setup for Developers
1. Create a Google Sheet with columns A-M as defined in the data sheet.
2. Open `Extensions > Apps Script`.
3. Paste the provided `Code.gs` into the editor.
4. Set up an `onEdit` trigger to handle UI interactions.
