package token

var store = map[string]*Token{}

func Get(profile, pubKey, pubBoxKey string) *Token {
	if profile == "" {
		return nil
	}

	tokn := store[profile]

	if tokn != nil && pubKey == tokn.ServerPublicKey &&
		pubBoxKey == tokn.ServerBoxPublicKey {

		return tokn
	}

	return nil
}

func Update(profile, pubKey, pubBoxKey string, ttl int) (
	tokn *Token, err error) {

	tokn = Get(profile, pubKey, pubBoxKey)
	if tokn == nil {
		tokn = &Token{
			Profile:            profile,
			ServerPublicKey:    pubKey,
			ServerBoxPublicKey: pubBoxKey,
		}

		err = tokn.Init()
		if err != nil {
			return
		}

		store[profile] = tokn
	}

	tokn.Ttl = ttl

	err = tokn.Update()
	if err != nil {
		return
	}

	return
}

func Clear(profile string) {
	delete(store, profile)
}
