#define MyAppName "Pritunl"
#define MyAppVersion "0.10.0"
#define MyAppPublisher "Pritunl"
#define MyAppURL "https://pritunl.com/"
#define MyAppExeName "pritunl.exe"

[Setup]
AppId={{80EC2557-82C8-4ECB-9E02-B7DB1B8F6BC7}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName={#MyAppName}
PrivilegesRequired=admin
DisableProgramGroupPage=yes
OutputDir=.\
OutputBaseFilename=pritunl-setup
SetupIconFile=..\client\www\img\logo.ico
Compression=lzma
SolidCompression=yes
CloseApplications=yes
CloseApplicationsFilter=*.exe,*.dll,*.chm
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
Source: "..\build\win\pritunl-win32\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\tuntap_win\*"; DestDir: "{app}\tuntap"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\service\service.exe"; DestDir: "{app}"; DestName: "pritunl-service.exe"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Flags: nowait

[UninstallRun]
Filename: "taskkill.exe"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runascurrentuser runhidden skipifdoesntexist
Filename: "taskkill.exe"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runascurrentuser runhidden skipifdoesntexist
Filename: "taskkill.exe"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runascurrentuser runhidden skipifdoesntexist
Filename: "timeout.exe"; Parameters: "/t 3"; Flags: runascurrentuser runhidden skipifdoesntexist
Filename: "taskkill.exe"; Parameters: "/F /IM openvpn.exe"; Flags: runascurrentuser runhidden skipifdoesntexist
Filename: "taskkill.exe"; Parameters: "/F /IM openvpn.exe"; Flags: runascurrentuser runhidden skipifdoesntexist
Filename: "taskkill.exe"; Parameters: "/F /IM openvpn.exe"; Flags: runascurrentuser runhidden skipifdoesntexist
Filename: "timeout.exe"; Parameters: "/t 3"; Flags: runascurrentuser runhidden skipifdoesntexist

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
