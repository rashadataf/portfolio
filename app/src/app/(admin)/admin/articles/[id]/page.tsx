import { ArticlePage } from '@/components/ArticlePage';

// const ArticlePageComponent = dynamic(() =>
//     import('@/components/ArticlePage').then((mod) => mod.ArticlePage),
//     {
//         loading: () => <Loader />,
//     }
// )
export default async function AdminArticlePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    return <ArticlePage editable={true} articleId={id} />
}