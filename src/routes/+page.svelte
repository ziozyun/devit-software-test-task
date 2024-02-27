<script lang="ts">
	import { writable } from 'svelte/store';

	let requestsPerSecond = 0;
	let result = writable<number[]>([]);
	let disabled = false;
	const totalRequests = 1000;
	let requestsExecuted = 0;

	const executeRequest = async (id: number) => {
		try {
			const response = await fetch('/api', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			const { data } = await response.json();

			result.update((list) => [...list, data.id]);
		} catch (error: any) {
			console.error(`Error for request ${id}: ${error.message}`);
		}
	};

	const executeRequestsSequentially = () => {
		if (requestsExecuted >= totalRequests) {
		  disabled = false;
			console.log('All requests executed');
			return;
		}

		const batchPromises = [];
		const batchStart = requestsExecuted + 1;
		const batchEnd = Math.min(requestsExecuted + requestsPerSecond, totalRequests);

		for (let i = batchStart; i <= batchEnd; i++) {
			const requestPromise = executeRequest(i);
			batchPromises.push(requestPromise);
			requestsExecuted++;
		}

		Promise.all(batchPromises).finally(() => {
			setTimeout(executeRequestsSequentially, 1000);
		});
	};

	const onSubmit = async () => {
		if (requestsPerSecond < 1 || requestsPerSecond > 100) {
			return alert('Enter a value between 1 and 100');
		}

		disabled = true;

		requestsExecuted = 0;
		result.update(() => []);

		executeRequestsSequentially();
	};
</script>

<div class="container mx-auto my-2 p-2">
	<form on:submit|preventDefault={onSubmit}>
		<fieldset class="mb-2 flex items-center">
			<label class="mr-2" for="request-count">Request count: </label>
			<input
				class="rounded border px-2"
				id="request-count"
				name="request-count"
				type="number"
				placeholder="0-100"
				min="0"
				max="100"
				required
				bind:value={requestsPerSecond}
			/>
		</fieldset>
		<button
			class="rounded bg-green-200 px-2 py-1 hover:bg-green-300 disabled:bg-slate-200"
			{disabled}>Start</button
		>
	</form>
	<ul>
		{#each $result as index}
			<li>{index}</li>
		{/each}
	</ul>
</div>
