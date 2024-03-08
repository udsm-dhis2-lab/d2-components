import { HttpConfig } from '../models/http-config.model';

export const HTTP_CONFIG: HttpConfig = {
    includeVersionNumber: false,
    preferPreviousApiVersion: false,
    useRootUrl: false,
    useIndexDb: false,
    fetchOnlineIfNotExist: true,
    isExternalLink: false,
};

export const DEFAULT_ROOT_URL = '../../../';

export const HTTP_HEADER_OPTIONS = {
    'Content-Type': 'application/json',
};
