function highlightEquationAtIndex(i) {
    var equations = getEquations(false);
    var style = {};
    // unhighlight all the other elements
    for (var j = 0; j < equations.length; ++j) {
        highlight(equations[j], '#ffffff');
    }
    // highlight the given element
    highlight(equations[i], '#ffff00');

    function highlight(equation, color) {
        var style = {};
        style[DocumentApp.Attribute.BACKGROUND_COLOR] = color;
        equation.setAttributes(style);
    }
}
