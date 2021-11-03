import dynamic from "next/dynamic";

import "easymde/dist/easymde.min.css";

export const MDEditor = dynamic(() => import("react-simplemde-editor"), { ssr: false });
