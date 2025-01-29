import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query;
    if (!filename || Array.isArray(filename)) {
        return res.status(400).json({ error: "Invalid file request" });
    }

    const filePath = path.join(process.cwd(), "uploads", filename);

    if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "image/*"); 
        return fs.createReadStream(filePath).pipe(res);
    } else {
        return res.status(404).json({ error: "File not found" });
    }
}
