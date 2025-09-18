export const nowISO = () => new Date().toISOString();

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));


