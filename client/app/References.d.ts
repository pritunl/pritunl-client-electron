declare module 'react-stripe-checkout' {
	import * as React from 'react';

	interface ReactStripeCheckoutProps {
		desktopShowModal?: boolean;
		triggerEvent?: string;
		label?: string;
		style?: React.CSSProperties;
		textStyle?: React.CSSProperties;
		disabled?: boolean;
		ComponentClass?: string;
		showLoadingDialog?: () => void;
		hideLoadingDialog?: () => void;
		onScriptError?: (err: any) => void;
		onScriptTagCreated?: () => void;
		reconfigureOnUpdate?: boolean;
		stripeKey: string;
		token: (token: any) => void;
		name?: string;
		description?: string;
		image?: string;
		amount?: number;
		locale?: string;
		currency?: string;
		panelLabel?: string;
		zipCode?: boolean;
		billingAddress?: boolean;
		shippingAddress?: boolean;
		email?: string;
		allowRememberMe?: boolean;
		bitcoin?: boolean;
		alipay?: boolean | string;
		alipayReusable?: boolean;
		opened?: () => void;
		closed?: () => void;
	}

	export default class ReactStripeCheckout extends React.Component<ReactStripeCheckoutProps, {}> {}
}

declare module '@novnc/novnc' {
	export default class RFB {
		constructor(target: HTMLDivElement, url: string, options?: any);
		[key:string]: any;
	}
}
