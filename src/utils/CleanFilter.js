export const cleanFilterObject = (obj) => {
    const cleaned = {};

    for (const key in obj) {
        const val = obj[key];

        if (Array.isArray(val)) {
            if (val.length > 0) cleaned[key] = val;
        } else if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed !== '') cleaned[key] = trimmed;
        } else if (typeof val === 'number') {
            if (!isNaN(val)) cleaned[key] = val;
        } else if (val instanceof Date) {
            cleaned[key] = val;
        } else if (val !== null && val !== undefined && val !== '') {
            cleaned[key] = val;
        }
    }

    return cleaned;
};
