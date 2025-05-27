package utils

import (
	"context"
)

type CancelContext struct {
	context.Context
	cancel   context.CancelFunc
	onCancel func()
}

func (c *CancelContext) OnCancel(callback func()) {
	c.onCancel = callback
}

func (c *CancelContext) Cancel() {
	c.cancel()
	if c.onCancel != nil {
		c.onCancel()
	}
}

func NewCancelContext() *CancelContext {
	ctx, cancel := context.WithCancel(context.Background())

	return &CancelContext{
		ctx,
		cancel,
		nil,
	}
}
