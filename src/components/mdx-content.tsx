import { MDXRemote } from "next-mdx-remote/rsc";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import type { ComponentPropsWithoutRef, JSX } from "react";

type HtmlProps<T extends keyof JSX.IntrinsicElements> = ComponentPropsWithoutRef<T>;

const components = {
    h1: (props: HtmlProps<"h1">) => (
        <h1 className="mt-8 scroll-m-20 text-4xl font-bold tracking-tight text-foreground lg:text-5xl" {...props} />
    ),
    h2: (props: HtmlProps<"h2">) => {
        // Generate ID from text content if not provided
        const id = props.id || props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        return (
            <h2
                id={id}
                className="mt-12 scroll-m-20 border-b border-border/40 pb-2 text-3xl font-semibold tracking-tight first:mt-0"
                {...props}
            />
        );
    },
    h3: (props: HtmlProps<"h3">) => {
        const id = props.id || props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        return <h3 id={id} className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight" {...props} />;
    },
    h4: (props: HtmlProps<"h4">) => (
        <h4 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight" {...props} />
    ),
    p: (props: HtmlProps<"p">) => (
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground" {...props} />
    ),
    ul: (props: HtmlProps<"ul">) => (
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2 marker:text-orange-500" {...props} />
    ),
    ol: (props: HtmlProps<"ol">) => (
        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 marker:text-orange-500" {...props} />
    ),
    li: (props: HtmlProps<"li">) => <li className="leading-7 text-muted-foreground" {...props} />,
    blockquote: (props: HtmlProps<"blockquote">) => (
        <blockquote
            className="mt-6 border-l-4 border-orange-500 pl-6 italic text-foreground bg-orange-50/50 py-3 pr-4 rounded-r-lg"
            {...props}
        />
    ),
    a: (props: HtmlProps<"a">) => (
        <Link className="font-medium text-foreground underline decoration-orange-500/30 decoration-2 underline-offset-4 hover:decoration-orange-500 transition-all" {...(props as ComponentPropsWithoutRef<typeof Link>)} />
    ),
    img: (props: HtmlProps<"img">) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            className="rounded-xl border border-border/50 bg-muted shadow-sm my-8"
            alt={props.alt}
            {...props}
        />
    ),
    hr: (props: HtmlProps<"hr">) => <hr className="my-8 md:my-12 border-border/40" {...props} />,
    table: (props: HtmlProps<"table">) => (
        <div className="my-6 w-full overflow-y-auto rounded-lg border border-border/40 shadow-sm">
            <table className="w-full" {...props} />
        </div>
    ),
    tr: (props: HtmlProps<"tr">) => (
        <tr className="m-0 border-t border-border/40 p-0 even:bg-muted/30" {...props} />
    ),
    th: (props: HtmlProps<"th">) => (
        <th
            className="border-none px-4 py-3 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right bg-muted/50"
            {...props}
        />
    ),
    td: (props: HtmlProps<"td">) => (
        <td
            className="border-none px-4 py-3 text-left [&[align=center]]:text-center [&[align=right]]:text-right text-muted-foreground"
            {...props}
        />
    ),
    pre: (props: HtmlProps<"pre">) => (
        <pre
            className="mb-4 mt-6 overflow-x-auto rounded-xl border border-border/40 bg-zinc-950 py-4 shadow-lg"
            {...props}
        />
    ),
    code: (props: HtmlProps<"code">) => (
        <code
            className="relative rounded bg-muted/80 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-orange-800"
            {...props}
        />
    ),
    Button,
    Link,
    Image,
};

export function MDXContent({ source }: { source: string }) {
    return (
        <div className="prose prose-zinc dark:prose-invert max-w-none">
            <MDXRemote source={source} components={components} />
        </div>
    );
}
