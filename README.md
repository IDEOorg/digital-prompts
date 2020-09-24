# digital-prompts
Digital prompt cards backed by content from a Google spreadsheet

:floppy_disk: ## Creating and updating your spreadsheet
The **digital-prompts** code expects a Google spreadsheet identified by a unique Google document ID. The current implementation assumes the sheet permissions are set to allow reading by anyone who has the link (no Google login required).

### Spreadsheet format
The current implementation is hardcoded to expect two sheets within the Google spreadsheet.

1. **Prompts**: Where the content of your prompts lives. 
2. **KeywordToLabel**: Defines the categories you display in the tool's navigation. 

### Prompts Sheet
Two text columns: 
* **Category Keyword** - must be one word, preferably lowercase, that uniquely identifies the category
* **Prompt** - sentence or question, preferably <100 characters to be displayed well on screen

### KeywordToLabel Sheet
Three text columns: 
* **Keyword** - one world lowercase keyword that matches those used in the Prompts sheet
* **Label** - text label displayed for each category in the navigation bar, ideally 1-2 words headline caps
* **Color** - specified as #rrggbb hex value defining the background color of that category

Please make sure that each keyword used in the *Prompts* sheet is represented in the *KeywordToLabel* sheet and vice versa. If you omit a keyword from the *KeywordToLabel* sheet, the category will never be shown in the navigation. If you have no rows in *Prompts* using a keyword in *KeywordToLabel*, you'll get a prompt that just says "undefined" for that category.
