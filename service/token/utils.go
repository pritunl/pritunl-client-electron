package token

var store = map[string]*Token{}

func Get(profile string) *Token {
	return store[profile]
}

func Update(profile string, ttl int) (tokn *Token, err error) {
	tokn = store[profile]
	if tokn == nil {
		tokn = &Token{
			Profile: profile,
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
