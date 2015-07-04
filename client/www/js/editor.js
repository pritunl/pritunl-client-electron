var os = require('os');
var ace = require('./ace/ace.js');

function Editor(typ, $container) {
  this.typ = typ;
  this.editor = null;
  this.$container = $container;
}

Editor.prototype.create = function() {
  this.editor = ace.edit(this.$container[0]);
  this.editor.setTheme('ace/theme/cobalt');
  if (os.platform() === 'darwin') {
    this.editor.setFontSize(10);
  } else {
    this.editor.setFontSize(12);
  }
  this.editor.setShowPrintMargin(false);
  this.editor.setShowFoldWidgets(false);
  this.editor.getSession().setUseWrapMode(true);
  this.editor.getSession().setMode('ace/mode/text');

  if (this.typ === 'log') {
    this.scrollBottom();
  }
};

Editor.prototype.scrollBottom = function(count) {
  if (count == null) {
    count = 0;
  }
  else if (count >= 10) {
    return;
  }
  count += 1;

  var $scrollbar = this.$container.find('.ace_scrollbar');
  $scrollbar.scrollTop($scrollbar[0].scrollHeight);

  setTimeout(function() {
    this.scrollBottom(count);
  }.bind(this), 25);
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
