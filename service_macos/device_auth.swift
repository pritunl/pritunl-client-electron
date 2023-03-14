import CryptoKit
import LocalAuthentication
import Security
import Foundation
import Darwin.C

let userPresence = false
let inputStr = readLine()!
let inputData = inputStr.trimmingCharacters(
  in: .whitespacesAndNewlines).data(using: .utf8)!

struct Input: Codable {
  var key_data: String
}

struct Input2: Codable {
  var sign_data: String
}

struct Output: Codable {
  var key_data: String
  var public_key: String
}

struct Output2: Codable {
  var signature: String
}

let encoder = JSONEncoder()
let decoder = JSONDecoder()
let input = try decoder.decode(Input.self, from: inputData)
var output = Output(
  key_data: "",
  public_key: ""
)
var output2 = Output2(
  signature: ""
)

if !SecureEnclave.isAvailable {
  print("secure enclave not available")
  exit(1)
}

let authContext = LAContext()
let accessControl = SecAccessControlCreateWithFlags(
  kCFAllocatorDefault,
  kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
  [.privateKeyUsage],
  nil
)!

var outKeyData: String = ""
var outPubKey: String = ""
var outSignature: String = ""

var authError: Error?
let waiters = DispatchGroup()
waiters.enter()

if (userPresence) {
  authContext.evaluatePolicy(
    LAPolicy.deviceOwnerAuthentication,
    localizedReason: "authenticate device"
  ) { (success: Bool, err: Error?) -> Void in
    if err != nil {
      authError = err
      waiters.leave()
      return
    }

    do {
      var enclaveKey: SecureEnclave.P256.Signing.PrivateKey
      if input.key_data == "" {
        enclaveKey = try CryptoKit.SecureEnclave.P256.Signing.PrivateKey(
          accessControl: accessControl,
          authenticationContext: authContext
        )
      } else {
        let keyDataRep = Data(base64Encoded: input.key_data)
        enclaveKey = try CryptoKit.SecureEnclave.P256.Signing.PrivateKey(
          dataRepresentation: keyDataRep!,
          authenticationContext: authContext
        )
      }

      output.key_data = enclaveKey.dataRepresentation.base64EncodedString()
      output.public_key = enclaveKey.publicKey.derRepresentation.base64EncodedString()

      let outputData = try encoder.encode(output)
      let outputStr = String(decoding: outputData, as: UTF8.self)
      print(outputStr)
      fflush(stdout)

      let input2Str = readLine()!
      let input2Data = input2Str.trimmingCharacters(
        in: .whitespacesAndNewlines).data(using: .utf8)!
      let input2 = try decoder.decode(Input2.self, from: input2Data)

      let signDataBytes = Data(base64Encoded: input2.sign_data)
      let signature = try enclaveKey.signature(for: signDataBytes!)
      output2.signature = signature.derRepresentation.base64EncodedString()
    } catch {
      authError = error
      waiters.leave()
      return
    }

    waiters.leave()
  }

  waiters.wait()
} else {
  var enclaveKey: SecureEnclave.P256.Signing.PrivateKey
  if input.key_data == "" {
    enclaveKey = try CryptoKit.SecureEnclave.P256.Signing.PrivateKey(
      accessControl: accessControl,
      authenticationContext: authContext
    )
  } else {
    let keyDataRep = Data(base64Encoded: input.key_data)
    enclaveKey = try CryptoKit.SecureEnclave.P256.Signing.PrivateKey(
      dataRepresentation: keyDataRep!,
      authenticationContext: authContext
    )
  }

  output.key_data = enclaveKey.dataRepresentation.base64EncodedString()
  output.public_key = enclaveKey.publicKey.derRepresentation.base64EncodedString()

  let outputData = try encoder.encode(output)
  let outputStr = String(decoding: outputData, as: UTF8.self)
  print(outputStr)
  fflush(stdout)

  let input2Str = readLine()!
  let input2Data = input2Str.trimmingCharacters(
    in: .whitespacesAndNewlines).data(using: .utf8)!
  let input2 = try decoder.decode(Input2.self, from: input2Data)

  let signDataBytes = Data(base64Encoded: input2.sign_data)
  let signature = try enclaveKey.signature(for: signDataBytes!)
  output2.signature = signature.derRepresentation.base64EncodedString()
}

let output2Data = try encoder.encode(output2)
let output2Str = String(decoding: output2Data, as: UTF8.self)
print(output2Str)
fflush(stdout)

exit(0)
