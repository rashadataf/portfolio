import { FileManager } from '@/components/FileManager';
import { getUploadedFiles } from '@/modules/file/file.controller';

export default async function FilesAdminPage() {
    const res = await getUploadedFiles();
    const files = res.success ? res.data : [];

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Files</h1>
            <FileManager initialFiles={files} />
        </div>
    );
}
