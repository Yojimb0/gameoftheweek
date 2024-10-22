<script lang="ts">
	import type { PageData } from './$types';
	import { auth, db } from '../../../lib/firebase'; // Adjust the path based on your setup
	import {
		collection,
		addDoc,
		onSnapshot,
		deleteDoc,
		doc,
		updateDoc,
		setDoc
	} from 'firebase/firestore';
	import { writable } from 'svelte/store';

	export let data: PageData;

	let groupId = data.groupId; // Replace with dynamic groupId
	let newGameTitle: string | null | undefined = '';
	let newGameScore: string | null | undefined = null;
	let games = writable([]);
	let user;
	let errorMessage: string | null = null;
	let editMode = false;

	const motivationScores = writable({}); // Store for user motivation scores
	const allScores = writable({}); // Store for aggregated motivation scores from all users

	// Fetch user
	user = auth.currentUser;

	// Function to add a new game
	const addGame = async () => {
		if (!newGameTitle) {
			errorMessage = 'Game name cannot be empty.';
			return;
		}
		errorMessage = '';

		if (newGameTitle && newGameTitle.trim()) {
			if (newGameTitle.includes('boardgamegeek.com')) {
				const gameId = newGameTitle.split('/boardgame/')[1]?.split('/')[0]; // Extract BGG game ID
				if (gameId) {
					const response = await fetch(`https://api.geekdo.com/xmlapi2/thing?id=${gameId}&stats=1`);
					const xml = await response.text();
					const parser = new DOMParser();
					const xmlDoc = parser.parseFromString(xml, 'text/xml');
					newGameTitle = xmlDoc.querySelector('name')?.getAttribute('value');
					newGameScore = xmlDoc.querySelector('average')?.getAttribute('value');
				}
			}

			const groupGamesRef = collection(db, 'groups', groupId, 'games');
			await addDoc(groupGamesRef, {
				title: newGameTitle,
				score: newGameScore,
				ownerId: user.uid,
				createdAt: new Date()
			});
			newGameTitle = '';
			newGameScore = null;
		}
	};

	// Listen for game updates
	const unsubscribe = onSnapshot(collection(db, 'groups', groupId, 'games'), (snapshot) => {
		const gameList = [];
		snapshot.forEach((doc) => {
			gameList.push({ id: doc.id, ...doc.data() });
		});
		games.set(gameList);
	});

	// Function to delete a game
	const deleteGame = async (gameId) => {
		const gameDoc = doc(db, 'groups', groupId, 'games', gameId);
		await deleteDoc(gameDoc);
	};

	// Function to update motivation score
	// const updateMotivation = async (gameId: string, newScore:number) => {
	// 	const motivationDoc = doc(db, 'groups', groupId, 'games', gameId, 'motivations', user.uid);
	//     console.log('update motivations', motivationDoc)
	// 	await updateDoc(motivationDoc, { score: newScore });
	// };

	// Function to update or add motivation score
	const updateMotivation = async (gameId: string, newScore: number) => {
		try {
			const motivationDoc = doc(db, 'groups', groupId, 'games', gameId, 'motivations', user.uid);

			// Use set with merge: true to either create or update the document
			await setDoc(motivationDoc, { score: newScore }, { merge: true });

			console.log('Motivation score successfully updated/added.');
		} catch (error) {
			console.error('Error updating/adding motivation score: ', error);
		}
	};

	const handleEdit = () => {
		editMode = !editMode;
	};
</script>

<main>
	<div class="header">
		<h1>Group Page</h1>
		<button on:click={handleEdit}>Edit</button>
	</div>

	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}

	<div class="box">
		<h2>Add a New Game</h2>
		<fieldset>
			<input
				type="text"
				placeholder="Enter game title or paste BoardGameGeek link"
				bind:value={newGameTitle}
			/>
			<button on:click={addGame}>Add Game</button>
		</fieldset>
	</div>

	<!-- List of Games for the Group -->
	<h2>Games in Group</h2>
	<ul>
		{#each $games as game}
			<li>
				<div>
					<h3>{game.title}</h3>
					<!-- Slider for user's motivation score -->
					<input
						type="range"
						min="0"
						max="10"
						value={$motivationScores[game.id] || 0}
						on:input={(e) => updateMotivation(game.id, e.target.value)}
					/>
					<span>Your Score: {$motivationScores[game.id] || 0}</span>

					<!-- Display aggregated scores from all users -->
					<p>Total Motivation Score: {$allScores[game.id] || 0}</p>

					<!-- Only show delete button to the group owner -->
					{#if editMode && game.ownerId === user.uid}
						<button on:click={() => deleteGame(game.id)}>Delete</button>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</main>

<style>
	ul {
		list-style: none;
		padding: 0;
	}

	li {
		margin: 10px 0;
		background-color: #f9f9f9;
		padding: 10px;
		border-radius: 8px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}
</style>
