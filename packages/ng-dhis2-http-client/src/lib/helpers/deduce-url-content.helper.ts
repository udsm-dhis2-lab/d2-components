import { getUrlParams } from './get-url-params.helper';

export function deduceUrlContent(url: string) {
    const splitedUrl = (url || '').split('?');
    const schemaPart = (splitedUrl[0] || '').split('/') || [];
    const schemaName = ((schemaPart[0] || '').split('.') || [])[0];

    const schema = {
        name:
            schemaName === 'dataStore'
                ? `dataStore_${((schemaPart[1] || '').split('.') || [])[0]}`
                : schemaName,
        id:
            schemaName === 'dataStore'
                ? (schemaPart[2] || '').replace('.json', '')
                : (schemaPart[1] || '').replace('.json', ''),
    };

    const params = getUrlParams(splitedUrl);

    return { schema, params };
}
