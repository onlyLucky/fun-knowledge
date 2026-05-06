import { useCallback, useEffect, useState } from "react";

type SearchWithKeyword = { keyword: string } & Record<string, unknown>;

export function useUrlSearchState<TSearch extends SearchWithKeyword>(args: {
  search: TSearch;
  setSearch: (next: TSearch) => void;
}) {
  const { search, setSearch } = args;
  const [keywordInput, setKeywordInput] = useState(search.keyword);

  useEffect(() => {
    setKeywordInput(search.keyword);
  }, [search.keyword]);

  const resetPage = (s: TSearch, keyword: string): TSearch => {
    const next = { ...s, keyword };
    if ("offset" in next) (next as Record<string, unknown>).offset = 0;
    if ("page" in next) (next as Record<string, unknown>).page = 1;
    return next;
  };

  const commitKeyword = useCallback(() => {
    const trimmed = keywordInput.trim();
    setSearch(resetPage(search, trimmed));
  }, [keywordInput, search, setSearch]);

  const applyKeyword = useCallback(
    (kw: string) => {
      const trimmed = kw.trim();
      setKeywordInput(trimmed);
      setSearch(resetPage(search, trimmed));
    },
    [search, setSearch],
  );

  return { keywordInput, setKeywordInput, commitKeyword, applyKeyword };
}
