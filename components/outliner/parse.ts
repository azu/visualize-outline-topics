import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import { toString } from "mdast-util-to-string";
import { selectAll } from "unist-util-select";
import { findAfter } from "unist-util-find-after";

const u = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
export const parseList = (content?: string): { title: string; items: string[] }[] => {
    if (!content) {
        return [];
    }
    const ast = u.parse(content);
    const titles = selectAll("heading", ast);
    return titles.map((titleNode) => {
        const nextList = findAfter(ast, titleNode, "list");
        const items = selectAll("listItem", nextList);
        return {
            title: toString(titleNode),
            items: [
                ...new Set(
                    items.map((item) => {
                        // ignore list > list
                        return toString((item as any).children[0]);
                    })
                ).values()
            ]
        };
    });
};
