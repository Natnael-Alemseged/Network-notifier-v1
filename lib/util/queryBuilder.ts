// src/common/utils/queryBuilder.ts
import { jsonToUriParam, setupParams, IncludeInputType } from './parsedQueryHelper';

interface BuildQueryProps {
    page?: number;
    pageSize?: number;
    searchKeys?: string[];
    searchQuery?: string;
    filterQuery?: any[];
    sortState?: { key: string; state: 'ASC' | 'DESC' }[];
    include?: IncludeInputType[];
    paranoid?: boolean;
}

/**
 * Generates a URL-safe type-encoded query string for backend
 */
export const buildQueryParam = (props: BuildQueryProps) => {
    const queryObj = setupParams({
        pagination: { page: props.page ?? 1, pageSize: props.pageSize ?? 10 },
        keys: props.searchKeys ?? [],
        searchQuery: props.searchQuery,
        filterQuery: props.filterQuery,
        sortState: props.sortState,
        include: props.include,
        paranoid: props.paranoid,
    });

    return encodeURIComponent(jsonToUriParam(queryObj));
};
