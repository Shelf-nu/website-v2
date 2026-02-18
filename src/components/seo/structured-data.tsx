import React from "react";

/**
 * Renders one or more JSON-LD script tags for structured data.
 * Accepts a single schema object or an array of schemas.
 */
export function StructuredData({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
    const schemas = Array.isArray(data) ? data : [data];

    return (
        <>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
}
