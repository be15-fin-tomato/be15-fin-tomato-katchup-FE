export const cleanFilterObject = (obj) => {
    const cleaned = {};

    for (const key in obj) {
        const val = obj[key];

        if (key === 'manager' && val?.id) {
            cleaned.managerId = val.id;
            continue;
        }

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
            if (typeof val === 'object') {
                for (const nestedKey in val) {
                    const nestedVal = val[nestedKey];
                    if (nestedVal !== '' && nestedVal !== null && nestedVal !== undefined) {
                        cleaned[`${key}${capitalize(nestedKey)}`] = nestedVal;
                    }
                }
            } else {
                cleaned[key] = val;
            }
        }
    }

    return cleaned;
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
