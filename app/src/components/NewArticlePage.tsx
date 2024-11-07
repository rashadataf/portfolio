"use client";
import '@/app/prosemirror.css';
import { JSONContent } from "novel";
import { Editor } from "@/components/Editor/Editor";
import { defaultValue } from "@/app/default-value";
import { Section } from "@/components/Section";
import { useSafeState } from "@/hooks/useSafeState.hook";

export const NewArticlePage = () => {
    const [value, setValue] = useSafeState<JSONContent>(defaultValue);
    return (
        <Section id="projects" ariaLabelledBy="projects-page-heder" className="container mx-auto py-10 flex flex-col items-center">
            <h1 id="projects-page-header" className="text-4xl font-bold text-center mb-10">New Article</h1>
            <div className="flex flex-col p-6 border max-w-xl w-full gap-6 rounded-md bg-card">
                <Editor initialValue={value} onChange={setValue} />
            </div>
        </Section>
    );
}