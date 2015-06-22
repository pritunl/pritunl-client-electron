function NetworkError() {
  ErrorInit.call(this, 'NetworkError', arguments);
}
NetworkError.prototype = new Error;
module.exports.NetworkError = NetworkError;

function WriteError() {
  ErrorInit.call(this, 'WriteError', arguments);
}
WriteError.prototype = new Error;
module.exports.WriteError = WriteError;

function ParseError() {
  ErrorInit.call(this, 'ParseError', arguments);
}
ParseError.prototype = new Error;
module.exports.ParseError = ParseError;
