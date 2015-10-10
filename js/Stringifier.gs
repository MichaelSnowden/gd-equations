/**
 * Stringifies an equation taken from the doc
 */
stringify = function(equation) {
    var stringified = [];

    Equation(equation);

    return stringified.join(" ");

    function Equation(equation) {
        for (var i = 0; i < equation.getNumChildren(); ++i) {
            var child = equation.getChild(i);
            switch (child.getType()) {
                case DocumentApp.ElementType.EQUATION_FUNCTION:
                    EquationFunction(child);
                    break;
                case DocumentApp.ElementType.EQUATION_SYMBOL:
                    EquationSymbol(child);
                    break;
                case DocumentApp.ElementType.TEXT:
                    stringified.push(child.getText());
                    break;
            }
        }

        function EquationFunction(func) {
            stringified.push(func.getCode().slice(1));
            stringified.push("(");
            EquationFunctionArguments(func);
            stringified.push(") ");
        }

        function EquationSymbol(sym) {
            stringified.push(sym.getCode().slice(1));
        }

        function EquationFunctionArguments(func) {
            for (var i = 0; i < func.getNumChildren(); ++i) {
                var child = func.getChild(i);
                switch (child.getType()) {
                    case DocumentApp.ElementType.EQUATION_FUNCTION:
                        EquationFunction(child);
                        break;
                    case DocumentApp.ElementType.EQUATION_SYMBOL:
                        EquationSymbol(child);
                        break;
                    case DocumentApp.ElementType.EQUATION_FUNCTION_ARGUMENT_SEPARATOR:
                        stringified.push(",");
                        break;
                    case DocumentApp.ElementType.TEXT:
                        stringified.push(child.getText());
                        break;
                }
            }
        }
    }
}