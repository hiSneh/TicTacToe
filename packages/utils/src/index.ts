export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const formatPercent = (value: number): string => `${Math.round(value * 100)}%`;

export const cx = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(' ');
