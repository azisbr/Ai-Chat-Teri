export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { path, ...query } = req.query;
    const endpoint = path || '';
    const params = new URLSearchParams(query).toString();
    const url = `http://203.175.125.210:2585/${endpoint}${params ? '?' + params : ''}`;

    try {
        const fetchOpts = { method: req.method };

        if (req.method === 'POST') {
            // pipe raw body langsung ke server
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            fetchOpts.body = Buffer.concat(chunks);
            const ct = req.headers['content-type'];
            if (ct) fetchOpts.headers = { 'content-type': ct };
        }

        const response = await fetch(url, fetchOpts);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.startsWith('image/')) {
            const buffer = await response.arrayBuffer();
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.status(response.status).send(Buffer.from(buffer));
        } else {
            const data = await response.json();
            res.status(200).json(data);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
