import { REQUEST_LIMIT } from '$env/static/private';
import { error } from '@sveltejs/kit';

interface RequestInfo {
	counter: number;
	lastTime: number;
}

const ipRequestInfoMap = new Map<string, RequestInfo>();
const requestLimit = parseInt(REQUEST_LIMIT);

export const handle = async ({ event, resolve }) => {
	const now = Date.now();
	const requestIp = event.getClientAddress();
	const ipInfo: RequestInfo = ipRequestInfoMap.get(requestIp) || {
		counter: 0,
		lastTime: 0
	};

	if (now - ipInfo.lastTime > 1000) {
		ipInfo.counter = 0;
	} else {
		ipInfo.counter++;
	}

	ipInfo.lastTime = now;

	ipRequestInfoMap.set(requestIp, ipInfo);

	if (ipInfo.counter >= requestLimit) {
		throw error(429, 'Too many requests');
	}

	const response = await resolve(event);
	return response;
};

export default handle;
