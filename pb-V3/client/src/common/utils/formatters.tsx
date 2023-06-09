export const formatUSD = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

export const formatUSDNoDecimals = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
	minimumFractionDigits: 0,
});

export const formatNumber = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const formatPct = new Intl.NumberFormat('en-US', {
	style: 'percent',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const formatPriceNumber = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	minimumFractionDigits: 8,
	maximumFractionDigits: 8,
});

export const formatPriceNumberMedium = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	minimumFractionDigits: 6,
	maximumFractionDigits: 6,
});

export const formatPriceNumberSmall = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	minimumFractionDigits: 4,
	maximumFractionDigits: 4,
});

export const formatShortDate = new Intl.DateTimeFormat('en-US', {
	day: 'numeric',
	month: 'short',
});
