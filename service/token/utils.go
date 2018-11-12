package token

var store = map[string]*Token{}

func Get(profile, pubKey string) *Token {
	tokn := store[profile]

	if profile == "" || pubKey == "" {
		return nil
	}

	if tokn != nil && pubKey == tokn.ServerPublicKey {
		return tokn
	}

	return nil
}

func Update(profile, pubKey string, ttl int) (tokn *Token, err error) {
	tokn = Get(profile, pubKey)
	if tokn == nil {
		tokn = &Token{
			Profile:         profile,
			ServerPublicKey: pubKey,
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
