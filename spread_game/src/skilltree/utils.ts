const allEqual = (l: string[]): boolean => {
    if (l.length <= 1) return true;
    else return l[0] === l[1] && allEqual(l.slice(1));
};

export const formatDescription = <T>(
    values: T[],
    formatValue: (value: T) => string,
    delimeter: string
) => {
    const formatted = values.map(formatValue);
    if (allEqual(formatted)) return formatted[0];
    else {
        const result = formatted.reduce((res, val) => {
            if (res.length === 0) {
                return val;
            } else {
                return res + delimeter + val;
            }
        }, "");
        return result;
    }
};
