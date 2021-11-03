export const includes = (a: string, b: string) => {
    if (a.length < b.length) {
        return b.includes(a);
    } else {
        return a.includes(b);
    }
};
