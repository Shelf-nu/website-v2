import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Blog - Shelf",
    description: "Latest updates and stories from the Shelf team.",
};

export default function BlogIndexPage() {
    const posts = getAllContent("blog");

    return (
        <Container className="py-20">
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    Blog
                </h1>
                <p className="text-xl text-muted-foreground">
                    Latest updates and stories from the Shelf team.
                </p>
            </div>
            <div className="mx-auto max-w-2xl grid gap-10">
                {posts.map((post) => (
                    <article key={post.slug} className="flex flex-col items-start">
                        <div className="flex items-center gap-x-4 text-xs">
                            {post.frontmatter.date && (
                                <time dateTime={post.frontmatter.date} className="text-muted-foreground">
                                    {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            )}
                        </div>
                        <div className="group relative">
                            <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-muted-foreground">
                                <Link href={`/blog/${post.slug}`}>
                                    <span className="absolute inset-0" />
                                    {post.frontmatter.title}
                                </Link>
                            </h3>
                            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                {post.frontmatter.summary}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </Container>
    );
}
