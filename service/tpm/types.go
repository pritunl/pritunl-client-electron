package tpm

type TpmCaller interface {
	Open(privKey64 string) (err error)
	Close()
	PublicKey() (pubKey64 string, err error)
	Sign(data []byte) (privKey64, sig64 string, err error)
}
