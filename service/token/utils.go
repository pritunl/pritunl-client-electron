package token

import (
	"sync"
)

var (
	store     = map[string]*Token{}
	storeLock = sync.Mutex{}
)

func Get(profile, pubKey, pubBoxKey string) *Token {
	if profile == "" {
		return nil
	}

	storeLock.Lock()
	tokn := store[profile]
	storeLock.Unlock()

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

		storeLock.Lock()
		store[profile] = tokn
		storeLock.Unlock()
	}

	tokn.Ttl = ttl

	_, err = tokn.Update()
	if err != nil {
		return
	}

	return
}

func Clear(profile string) {
	storeLock.Lock()
	delete(store, profile)
	storeLock.Unlock()
}
