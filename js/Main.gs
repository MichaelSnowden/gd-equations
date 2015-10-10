function VariableNode(v) {
    this.var = v;
}
VariableNode.prototype = Node;
VariableNode.prototype.toString = function() {
    return this.var;
};
VariableNode.prototype.evaluate = function(variables) {
    return variables[this.var];
};