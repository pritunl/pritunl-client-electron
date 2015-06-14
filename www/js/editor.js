var ace = require('./ace/ace.js');

var Editor = function Editor($container) {
  this.editor = null;
  this.$container = $container;
};

Editor.prototype.create = function() {
  this.editor = ace.edit(this.$container[0]);
  this.editor.setTheme('ace/theme/cobalt');
  this.editor.setFontSize(12);
  this.editor.setShowPrintMargin(false);
  this.editor.setShowFoldWidgets(false);
  this.editor.getSession().setMode('ace/mode/text');
};

Editor.prototype.destroy = function() {
  this.editor.destroy();
  this.editor = null;
  this.$container.empty();
};

Editor.prototype.get = function() {
  return this.editor.getSession().getValue();
};

Editor.prototype.set = function(data) {
  return this.editor.getSession().setValue(data);
};

Editor.prototype.push = function(data) {
  var doc = this.editor.getSession().getDocument();
  doc.insertLines(doc.getLength() - 1, [data]);
};

module.exports = {
  Editor: Editor
};
