function buildQuery(obj) {
    return Object.entries(obj).map(([key, value]) => {
        const val = Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value;
        return `${key}=${val}`;
    }).join('&');
}

export {buildQuery};