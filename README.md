# Furscript

Furscript is a lightweight scripting language designed for interactive execution in a sandboxed environment. This repository contains the Furscript editor, runtime, and basic compiler.

## Features
- **Live Execution**: Run Furscript code in real time.
- **Variable Handling**: Store and manipulate variables.
- **Basic Control Flow**: Includes loops and waits.
- **Minimalist Syntax**: Simple and easy to use.

## Installation
1. Clone this repository:
   ```sh
   git clone https://github.com/JulianTerB/furscript.git
   cd furscript
   ```
2. Open `index.html` in a browser.

## Usage
- Type Furscript code in the editor.
- Click the **Run** button to execute.
- Click the **Debug** button to analyze code execution.
- Use the console input for interactive execution.

## Syntax Guide
### Printing Output
```furscript
print("Hello, world!")
```

### Variables
```furscript
x = 10
y = x + 5
print(y)  // Outputs: 15
```

### Loops
```furscript
repeat 3
    print("Looping...")
end
```

### Wait
```furscript
print("Start")
wait(2)  // Pauses for 2 seconds
print("End")
```

### Debugging and Error Handling in Furscript

In **Furscript**, debugging is made easy with clear error messages that help guide you through troubleshooting. When an issue arises:

- **Syntax Errors:** These will be flagged in the script editor, pointing directly to the mistake. Look for misplaced characters, typos, or missing punctuation.
- **Runtime Errors:** If something goes wrong during execution, detailed error messages will appear in the output console, showing the exact location of the issue.
- **Debugging Tips:**
  - Add `print()` statements to output variable states and track flow during runtime.
  - Double-check your code for undefined variables or functions.
  - Use **Furscript’s built-in Debug Mode** for more verbose logs that highlight potential issues with more precision.

For more complex issues, checking the **Developer Console** and enabling **verbose logging** will give you deeper insights into what’s going wrong.


## How the Compiler Works
1. **Parsing**: The script is broken down into commands.
2. **Execution**: Each command is executed sequentially.
3. **Variable Substitution**: Variables are replaced with their values.
4. **Loops & Waits**: Repeat blocks and delays are processed.

## Contributing
Contributions are welcome. Open an issue or create a pull request.

## License
MIT License. See `LICENSE` for details.

