const _never = new Promise<void>(() => {});
export const never = () => _never;
