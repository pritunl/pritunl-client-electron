module.exports = `<div class="profile" flex layout horizontal>
  <div class="logo" layout vertical center
    style="background-color: {{logoColor}};"></div>
  <div class="info" flex>
    <div class="label">Name</div>
    <div class="name">{{name}}</div>
    <div class="label">Online For</div>
    <div class="uptime">{{status}}</div>
    <div class="label">Server Address</div>
    <div class="server-addr">{{serverAddr}}</div>
    <div class="label">Client Address</div>
    <div class="client-addr">{{clientAddr}}</div>
  </div>
  <div class="open-menu">
    <i class="fa fa-bars"></i>
  </div>
  <div class="menu-backdrop"></div>
  <div class="menu">
    <div class="connect item btn btn-success"
      layout vertical center>Connect</div>
    <div class="connect-ovpn item btn btn-success"
      layout vertical center>OVPN</div>
    <div class="connect-wg item btn btn-action"
      layout vertical center>WG</div>
    <input class="connect-user-input" type="text" tabindex="-1"
      placeholder="Enter Username">
    <input class="connect-pass-input" type="password" tabindex="-1"
      placeholder="Enter Password">
    <input class="connect-pin-input" type="password" tabindex="-1"
      placeholder="Enter Pin">
    <input class="connect-otp-input" type="text" tabindex="-1"
      placeholder="Enter OTP Code">
    <input class="connect-yubikey-input" type="password" tabindex="-1"
      placeholder="YubiKey">
    <div class="connect-confirm item btn btn-success"
      layout vertical center>Ok</div>
    <div class="connect-cancel item btn btn-danger"
      layout vertical center>Cancel</div>
    <div class="disconnect item btn btn-danger"
      layout vertical center>Disconnect</div>
    <div class="rename item btn btn-info"
      layout vertical center>Rename</div>
    <input class="rename-input" type="text" tabindex="-1"
      placeholder="Enter New Profile Name">
    <div class="rename-confirm item btn btn-success"
      layout vertical center>Ok</div>
    <div class="rename-cancel item btn btn-danger"
      layout vertical center>Cancel</div>
    <div class="delete item btn btn-danger"
      layout vertical center>Delete</div>
    <div class="delete-ask item"
      layout vertical center>Are you sure?</div>
    <div class="delete-yes item btn btn-danger"
      layout vertical center>Yes</div>
    <div class="delete-no item btn btn-success"
      layout vertical center>No</div>
    <div class="autostart item btn btn-warning"
      layout vertical center>Autostart {{autostart}}</div>
    <div class="autostart-on item btn btn-success"
      layout vertical center>On</div>
    <div class="autostart-off item btn btn-danger"
      layout vertical center>Off</div>
    <div class="view-logs item btn btn-action"
      layout vertical center>View Logs</div>
    <div class="edit-config item btn btn-default"
      layout vertical center>Edit Config</div>
  </div>
  <div class="config">
    <pre class="editor"></pre>
    <div class="btns">
      <div class="btn btn-danger cancel">Cancel</div><div
        class="btn btn-success save">Save Profile</div>
    </div>
  </div>
  <div class="logs">
    <pre class="editor"></pre>
    <div class="btns">
      <div class="btn btn-info clear">Clear</div><div
        class="btn btn-danger close">Close</div>
    </div>
  </div>
</div>`
