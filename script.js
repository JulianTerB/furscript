var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");
editor.session.setUseWorker(false);
editor.renderer.setShowGutter(false);
async function runFurscript() {
    const code = editor.getValue();
    const outputElement = document.getElementById("output");
    outputElement.innerHTML = "";

    try {
        const compiledCode = compileFurscript(code);
        await executeFurscript(compiledCode);
    } catch (error) {
        outputElement.innerHTML += `<div style="color: red;">Error: ${error.message}
            <div style="font-size: 12px; opacity: 0.6;">Line: Unknown</div>
        </div>`;
    }
}

function debugFurscript() {
    const code = editor.getValue();
    const outputElement = document.getElementById("output");
    outputElement.innerHTML = "";
    const compiledCode = compileFurscript(code);

    outputElement.innerHTML += "<div class='debug'>Debugging Furscript...</div>";
    outputElement.innerHTML += "<div class='debug'>Variables: " + JSON.stringify(compiledCode.variables) + "</div>";
}

// === Furscript Compiler === //
function compileFurscript(code) {
    const lines = code.split("\n");
    const variables = {};
    let commands = [];
    let repeatCount = 0;
    let repeatCommands = [];

    lines.forEach((line, index) => {
        line = line.split('//')[0].trim();
        if (!line) return;

        try {
            if (line === "clear") {
                addCommand({ type: "clear", line: index + 1 });
            } else if (line.startsWith("print(")) {
                handlePrint(line, index);
            } else if (line.startsWith("wait(")) {
                handleWait(line, index);
            } else if (line.match(/^repeat (.+)$/)) {
                handleRepeatStart(line);
            } else if (repeatCount > 0 && line === "end") {
                handleRepeatEnd();
            } else if (line.includes("=")) {
                handleAssignment(line, index);
            }
        } catch (e) {
            logError(e, index + 1);
        }
    });

    return { variables, commands };

    function addCommand(cmd) {
        if (repeatCount > 0) {
            repeatCommands.push(cmd);
        } else {
            commands.push(cmd);
        }
    }

    function handlePrint(line, index) {
        const match = line.match(/print\((.*?)\)/);
        if (match) {
            let expr = match[1];
            addCommand({ type: "print", value: expr, line: index + 1 });
        }
    }

    function handleWait(line, index) {
        const match = line.match(/wait\((\d+)\)/);
        if (match) {
            addCommand({ type: "wait", time: parseInt(match[1]), line: index + 1 });
        }
    }

    function handleRepeatStart(line) {
        let repeatVal = line.match(/^repeat (.+)$/)[1];
        if (variables.hasOwnProperty(repeatVal)) {
            repeatVal = variables[repeatVal];
        }
        repeatCount = parseInt(repeatVal);
        repeatCommands = [];
    }

    function handleRepeatEnd() {
        for (let i = 0; i < repeatCount; i++) {
            commands = commands.concat(repeatCommands);
        }
        repeatCount = 0;
        repeatCommands = [];
    }

    function handleAssignment(line, index) {
        const parts = line.split("=");
        const key = parts[0].trim();
        const expr = parts.slice(1).join("=").trim();
        const value = evaluateExpression(expr, variables);
        variables[key] = value;
        addCommand({ type: "assign", key, value, line: index + 1 });
    }

    function logError(error, line) {
        document.getElementById("output").innerHTML += `<div style="color: red;">Error: ${error.message}
            <div style="font-size: 12px; opacity: 0.6;">Line: ${line}</div></div>`;
    }
}

// === Furscript Executor === //
async function executeFurscript(compiledCode) {
    const { variables, commands } = compiledCode;
    const outputElement = document.getElementById("output");
    let activeWaits = [];

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        try {
            if (cmd.type === "clear") {
                outputElement.innerHTML = "";
            } else if (cmd.type === "print") {
                const result = evaluatePrintExpression(cmd.value, variables);
                outputElement.innerHTML += `<div>${result}</div>`;
            } else if (cmd.type === "wait") {
                activeWaits.push(new Promise(resolve => setTimeout(resolve, cmd.time * 1000)));
            }
        } catch (e) {
            outputElement.innerHTML += `<div style="color: red;">Error: ${e.message}
                <div style="font-size: 12px; opacity: 0.6;">Line: ${cmd.line || "Unknown"}</div></div>`;
        }
    }

    await Promise.all(activeWaits);
}

// === Expression Evaluators === //
function evaluateExpression(expr, variables) {
    expr = expr.trim();
    expr = expr.replace(/\$([a-zA-Z_]\w*)/g, (m, varName) => {
        return variables.hasOwnProperty(varName) ? variables[varName] : m;
    });
    let parts = expr.split('+').map(s => s.trim());
    let operands = parts.map(part => {
        if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
            return part.slice(1, -1);
        }
        if (variables.hasOwnProperty(part)) {
            return variables[part];
        }
        let num = Number(part);
        if (!isNaN(num)) return num;
        return part;
    });
    let allNumbers = operands.every(op => typeof op === "number");
    if (allNumbers) {
        return operands.reduce((a, b) => a + b, 0);
    } else {
        return operands.join('');
    }
}

function evaluatePrintExpression(expr, variables) {
    expr = expr.trim();
    expr = expr.replace(/\s*\+\s*/g, "");
    expr = expr.replace(/\$([a-zA-Z_]\w*)/g, (m, varName) => {
        return variables.hasOwnProperty(varName) ? variables[varName] : m;
    });
    for (let varName in variables) {
        let re = new RegExp("\\b" + varName + "\\b", "g");
        expr = expr.replace(re, variables[varName]);
    }
    return expr;
}

// === Input Handling === //
function handleEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const commandInput = document.getElementById("console-input");
        const command = commandInput.value;
        commandInput.value = "";
        runFurscript(command);
    }
}
