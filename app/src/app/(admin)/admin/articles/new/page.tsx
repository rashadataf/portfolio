import dynamic from 'next/dynamic';
import { Loader } from '@/components/Loader';

const NewArticlePage = dynamic(() =>
    import('@/components/NewArticlePage').then((mod) => mod.NewArticlePage),
    {
        loading: () => <Loader />,
    }
)
export default function NewArticle() {

    return <NewArticlePage />
}