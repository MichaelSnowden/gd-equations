function getEquations(stringified) {
    if (stringified == undefined) {
        stringified = true;
    }

    var body = DocumentApp.getActiveDocument().getBody();

    var searchType = DocumentApp.ElementType.EQUATION;
    var searchResult = null;
    var equations = [];


    // Search until all equations are found
    while (searchResult = body.findElement(searchType, searchResult)) {
        var equation = searchResult.getElement().asEquation();
        if (stringified) {
            equations.push(stringify(equation));
        } else {
            equations.push(equation);
        }
    }

    return equations;
}