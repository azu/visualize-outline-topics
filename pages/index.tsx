import { parseList } from "../components/outliner/parse";
import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { createTheme, Divider, List, ListItem, ListItemText } from "@mui/material";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import produce from "immer";
import { distance } from "fastest-levenshtein";
import { includes } from "../components/outliner/includes";
import { useHash } from "../hooks/useHash";

const theme = createTheme();

type OutlineList = {
    title: string;
    items: OutlineItem[];
};
type OutlineItem = {
    title: string;
    meta: {
        isHighlight: boolean;
        isUnique: boolean;
    };
};
export type OutlineProps = {
    title: string;
    items: OutlineItem[];
    onHover: (item?: OutlineItem) => void;
};
export type OutlineItemProps = OutlineItem & { onHover: (item?: OutlineItem) => void };
const OutlineItem = (props: OutlineItemProps) => {
    const onMouseEnter = useCallback(() => {
        props.onHover(props);
    }, [props]);
    const onMouseLeave = useCallback(() => {
        props.onHover();
    }, [props]);
    if (props.meta.isHighlight) {
        return (
            <ListItem
                key={props.title}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                divider={true}
                style={{
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.dark
                }}
            >
                <ListItemText primary={props.title} />
            </ListItem>
        );
    } else if (props.meta.isUnique) {
        return (
            <ListItem
                key={props.title}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                divider={true}
                style={{
                    color: theme.palette.success.contrastText,
                    backgroundColor: theme.palette.success.light
                }}
            >
                <ListItemText primary={props.title} />
            </ListItem>
        );
    } else {
        return (
            <ListItem key={props.title} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} divider={true}>
                <ListItemText primary={props.title} />
            </ListItem>
        );
    }
};
const Outline = (props: OutlineProps) => {
    return (
        <div style={{ width: "240px" }}>
            <h1>{props.title}</h1>
            <List>
                {props.items.map((item) => {
                    return <OutlineItem key={item.title} {...item} onHover={props.onHover} />;
                })}
            </List>
        </div>
    );
};

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary
}));

const DEFAULT_OUTLINE = `
## Article1 Topics

- Frontend
- JavaScript to TypeScript
- CSS
- CDN
- MicroFrontend

## Article2 Topics

- Backend
- TypeScript
- Microservices
- CDN
`.trimStart();

function App() {
    const [hash, setHash] = useHash();
    const [outlineText, setOutlineText] = useState<string>(hash || DEFAULT_OUTLINE);
    const [lists, setLists] = useState<OutlineList[]>([]);
    const onChangeTextarea: ChangeEventHandler<HTMLTextAreaElement> = useCallback((event) => {
        setOutlineText(event.target.value);
    }, []);
    useEffect(() => {
        setHash(outlineText);
    }, [outlineText, setHash]);
    useEffect(() => {
        const itemCountMap = new Map<string, number>();
        const parseResults = parseList(outlineText);
        const lists = parseResults
            .map((outline) => {
                return {
                    title: outline.title ?? "No Title",
                    items: outline.items.map((item) => {
                        itemCountMap.set(item, (itemCountMap.get(item) ?? 0) + 1);
                        return {
                            title: item,
                            meta: {
                                isHighlight: false,
                                isUnique: false
                            }
                        };
                    })
                };
            })
            .map((list) => {
                return {
                    ...list,
                    items: list.items.map((item) => {
                        const isUnique = itemCountMap.get(item.title) === 1;
                        return {
                            ...item,
                            meta: {
                                ...item.meta,
                                isUnique
                            }
                        };
                    })
                };
            });
        setLists(lists);
    }, [outlineText]);
    const onHover = useCallback((hoverItem) => {
        setLists(
            produce((lists) => {
                for (const list of lists) {
                    list.items.forEach((listItem) => {
                        if (!hoverItem) {
                            listItem.meta.isHighlight = false;
                            return;
                        }
                        const isClose =
                            includes(listItem.title, hoverItem.title) || distance(listItem.title, hoverItem.title) <= 1;
                        listItem.meta.isHighlight = isClose;
                    });
                }
            })
        );
    }, []);
    return (
        <div>
            <Head>
                <title>Visualize Outline Topics</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="canonical" href="https://visualize-outline-topics.vercel.app/" />
            </Head>

            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
                {lists.map((list, index) => {
                    return (
                        <Item key={list.title + index}>
                            <Outline {...list} onHover={onHover} />
                        </Item>
                    );
                })}
            </Stack>
            <Stack>
                <textarea
                    value={outlineText}
                    onChange={onChangeTextarea}
                    style={{ height: "500px", fontSize: "16px", padding: "0.5em" }}
                />
            </Stack>
            <Stack>
                <p>
                    <span
                        style={{
                            color: theme.palette.primary.contrastText,
                            backgroundColor: theme.palette.primary.dark
                        }}
                    >
                        　　　
                    </span>{" "}
                    is related items
                </p>
                <p>
                    <span
                        style={{
                            color: theme.palette.success.contrastText,
                            backgroundColor: theme.palette.success.light
                        }}
                    >
                        　　　
                    </span>{" "}
                    is unique item
                </p>
            </Stack>
        </div>
    );
}

export default App;
