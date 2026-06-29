export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { path, ...query } = req.query;
    const endpoint = path || '';
    const params = new URLSearchParams(query).toString();
    const url = `http://203.175.125.210:2585/${endpoint}${params ? '?' + params : ''}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
