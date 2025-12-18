// src/common/utils/parsedQueryHelper.ts

export const jsonToUriParam = <T extends Record<string, any>>(jsonData: T, prefix = ''): string => {
    const params: string[] = [];

    const encodeWithType = (key: string, value: any) => {
        let typeIndicator = 's'; // default string
        if (typeof value === 'number') typeIndicator = 'n';
        else if (typeof value === 'boolean') typeIndicator = 'b';
        return `${encodeURIComponent(key)}=${encodeURIComponent(`${String(value)}:${typeIndicator}`)}`;
    };

    for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            const value = jsonData[key];
            const paramKey = prefix ? `${prefix}[${key}]` : key;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                params.push(jsonToUriParam(value, paramKey));
            } else if (Array.isArray(value)) {
                value.forEach((item: any, index: any) => {
                    const nestedKey = `${paramKey}[${index}]`;
                    if (item && typeof item === 'object') {
                        params.push(jsonToUriParam(item, nestedKey));
                    } else {
                        params.push(encodeWithType(nestedKey, item));
                    }
                });
            } else {
                params.push(encodeWithType(paramKey, value));
            }
        }
    }

    return params.join('&');
};

// Types for setupParams
export type FilterOperator = '=' | '!=' | 'ilike' | 'like' | 'between' | '>' | '>=' | '<' | '<=' | 'in' | 'or' | 'and';

export interface FilterType { key: string; operator: FilterOperator; value: string | string[] | FilterType[]; }
export interface SearchType { keys: string[]; value: string; }
export interface OrderType { key: string; value: 'ASC' | 'DESC'; literal?: boolean; }
export interface IncludeInputType { model: string; alias?: string; filter?: FilterType[]; include?: IncludeInputType[]; }

export type QueryParams = {
    offset?: number;
    limit?: number;
    filter?: FilterType[];
    search?: SearchType;
    order?: OrderType[];
    include?: IncludeInputType[];
    paranoid?: boolean;
};

export type Pagination = { page: number; pageSize?: number; };

export function setupParams(props: {
    keys: string[];
    pagination?: Pagination;
    searchQuery?: string;
    filterQuery?: FilterType[];
    sortState?: { key: string; state: 'ASC' | 'DESC' | undefined }[];
    include?: IncludeInputType[];
    paranoid?: boolean;
}): QueryParams {
    let params: QueryParams = { offset: 0, limit: 10 };

    if (props.pagination) {
        params.offset = (props.pagination.page - 1) * (props.pagination.pageSize ?? 10);
        params.limit = props.pagination.pageSize ?? 10;
    }

    if (props.include) params.include = props.include;
    if (props.paranoid) params.paranoid = props.paranoid;
    if (props.searchQuery) params.search = { keys: props.keys, value: props.searchQuery };
    if (props.filterQuery && props.filterQuery.length > 0) params.filter = props.filterQuery;
    if (props.sortState && props.sortState.length > 0) {
        const state = props.sortState.filter(s => s.state !== undefined).map(s => ({ key: s.key, value: s.state ?? 'ASC' }));
        if (state.length > 0) params.order = state;
    }

    return params;
}
