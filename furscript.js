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
}
