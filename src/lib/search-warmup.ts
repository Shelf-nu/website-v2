/**
 * Terms to `preload()` before a Pagefind search, so the search sees every word it should match.
 *
 * Pagefind 1.4 splits its word index into chunks and picks which chunk to fetch from the query word as
 * typed, but it matches indexed words by their stem. When a chunk boundary lands between the two, the
 * chunk holding the stem never loads. In September 2026 "workspaces" fetched the chunk that starts at
 * "workspace", not the one ending at "workspac", so /features/workspaces vanished from its own query.
 * Where the boundaries fall shifts whenever content changes, so any plural or inflected query can break
 * this way, and whether it did depended on how slowly the visitor typed.
 *
 * An English stem is almost always a prefix of its word, so preloading the word's prefixes loads the
 * stem's chunk as well. Chunks are cached, so this rarely costs more than one extra ~35 KB fetch.
 *
 * Preload one term per call. The same chunk lookup is also wrong for multi-word input: it resolves a
 * chunk for one word and silently drops the rest, which is how "asset search" lost the word "search"
 * (and /features/asset-search with it) in September 2026, once a boundary moved to sit between "se"
 * and "sh". Handing this list to `preload()` as one space-separated string ran it through that same
 * broken path, so the warmup loaded one chunk and quietly skipped the others it was written to fetch.
 *
 * Pagefind 1.5 fixes the lookup upstream, but it also re-weights ranking, so upgrading needs its own
 * re-tune against the search-quality harness (see search-quality/README.md).
 */
export function searchWarmupTerms(query: string): string[] {
    const terms = new Set<string>();
    for (const word of query.toLowerCase().split(/\s+/)) {
        // The word itself included: it is the term the search will look up, and a boundary can fall
        // between it and its longest prefix.
        for (let length = 3; length <= word.length; length++) terms.add(word.slice(0, length));
    }
    return [...terms];
}
