import dynamic from 'next/dynamic';
import { Loader } from '@/components/Loader';

const ArticlePage = dynamic(() =>
    import('@/components/ArticlePage').then((mod) => mod.ArticlePage),
    {
        loading: () => <Loader />,
    }
)
export default function NewArticle() {

    return <ArticlePage editable={true} />
}