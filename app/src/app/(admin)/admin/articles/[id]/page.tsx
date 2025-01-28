import dynamic from 'next/dynamic';
import { Loader } from '@/components/Loader';

const ArticlePage = dynamic(() =>
    import('@/components/ArticlePage').then((mod) => mod.ArticlePage),
    {
        loading: () => <Loader />,
    }
)
export default async function AdminArticlePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    return <ArticlePage editable={true} articleId={id} />
}