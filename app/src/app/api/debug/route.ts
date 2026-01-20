import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const logFile = path.join(process.cwd(), 'debug.log');

        if (!fs.existsSync(logFile)) {
            return NextResponse.json({ message: 'No debug log file found' }, { status: 404 });
        }

        const logContent = fs.readFileSync(logFile, 'utf-8');

        return new NextResponse(logContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read debug log' }, { status: 500 });
    }
}