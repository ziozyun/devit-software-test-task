import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const delay = Math.floor(Math.random() * 1001);
	await new Promise((resolve) => setTimeout(resolve, delay));

	const data = await request.json();

	return json({ data });
}
