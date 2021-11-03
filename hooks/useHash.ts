/**
 * read and write url hash, response to url hash change
 */
import { useCallback, useEffect, useState } from "react";
import base64url from "base64-url";

export const useHash = () => {
    const [hash, setHash] = useState(() => {
        if (typeof window == "undefined") {
            return "";
        }
        return base64url.decode(window.location.hash);
    });
    const onHashChange = useCallback(() => {
        setHash(base64url.encode(window.location.hash));
    }, []);

    useEffect(() => {
        window.addEventListener("hashchange", onHashChange);
        return () => {
            window.removeEventListener("hashchange", onHashChange);
        };
    }, [onHashChange]);

    const _setHash = useCallback(
        (newHash: string) => {
            if (newHash !== hash) {
                window.location.hash = base64url.encode(newHash);
            }
        },
        [hash]
    );

    return [hash, _setHash] as const;
};
