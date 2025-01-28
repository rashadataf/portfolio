import dynamic from 'next/dynamic';
import { Loader } from '@/components/Loader';

const ArticlePageComponent = dynamic(() =>
    import('@/components/ArticlePage').then((mod) => mod.ArticlePage),
    {
        loading: () => <Loader />,
    }
)
export default async function ArticlePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    return <ArticlePageComponent editable={true} articleId={id} />
}