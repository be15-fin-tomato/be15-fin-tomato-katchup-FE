export const validateRequiredFields = (form, requiredFields, toast) => {
    for (const field of requiredFields) {
        const value = form[field.key];

        const isEmpty =
            value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
            toast.error(`'${field.label}'을(를) 입력해주세요.`);
            return false;
        }
    }
    return true;
};
