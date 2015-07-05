function NetworkError() {
  ErrorInit.call(this, 'NetworkError', arguments);
}
NetworkError.prototype = new Error;
module.exports.NetworkError = NetworkError;

function ReadError() {
  ErrorInit.call(this, 'ReadError', arguments);
}
ReadError.prototype = new Error;
module.exports.ReadError = ReadError;

function WriteError() {
  ErrorInit.call(this, 'WriteError', arguments);
}
WriteError.prototype = new Error;
module.exports.WriteError = WriteError;

function RemoveError() {
  ErrorInit.call(this, 'RemoveError', arguments);
}
RemoveError.prototype = new Error;
module.exports.RemoveError = RemoveError;

function ProcessError() {
  ErrorInit.call(this, 'ProcessError', arguments);
}
ProcessError.prototype = new Error;
module.exports.ProcessError = ProcessError;

function ParseError() {
  ErrorInit.call(this, 'ParseError', arguments);
}
ParseError.prototype = new Error;
module.exports.ParseError = ParseError;

function AuthError() {
  ErrorInit.call(this, 'AuthError', arguments);
}
AuthError.prototype = new Error;
module.exports.AuthError = AuthError;

function TimeoutError() {
  ErrorInit.call(this, 'TimeoutError', arguments);
}
TimeoutError.prototype = new Error;
module.exports.TimeoutError = TimeoutError;

function UnsupportedError() {
  ErrorInit.call(this, 'UnsupportedError', arguments);
}
UnsupportedError.prototype = new Error;
module.exports.UnsupportedError = UnsupportedError;

function UnknownError() {
  ErrorInit.call(this, 'UnknownError', arguments);
}
UnknownError.prototype = new Error;
module.exports.UnknownError = UnknownError;
