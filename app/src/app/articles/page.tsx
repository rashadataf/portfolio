// import { Metadata } from "next";
// import dynamic from "next/dynamic";
// import { Loader } from "@/components/Loader";

// export const metadata: Metadata = {
//     title: "Rashad Ataf's Articles - Insights in Full Stack Development",
//     description: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights.",
//     keywords: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights, Zim Connections",
//     alternates: {
//         canonical: "https://www.rashadataf.tech/articles"
//     }
// }

// const ArticlesPage = dynamic(() =>
//     import('@/components/ArticlesPage').then((mod) => mod.ArticlesPage),
//     {
//         loading: () => <Loader />,
//     }
// )

// export default function Articles() {
//     return <ArticlesPage />
// }
"use client";
import Editor from "@/components/editor/advanced-editor";
import { JSONContent } from "novel";
import { useState } from "react";
import { defaultValue } from "../default-value";

export default function Articles() {
    const [value, setValue] = useState<JSONContent>(defaultValue);
    console.log(value);
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="flex flex-col p-6 border max-w-xl w-full gap-6 rounded-md bg-card">
                <div className="flex justify-between">
                    <h1 className="text-4xl font-semibold"> Novel Example</h1>
                </div>
                <Editor initialValue={value} onChange={setValue} />
            </div>
        </main>
    );
}
