<script lang="ts">
	import type { PageData } from './$types';
	import { auth, db } from '../../../lib/firebase';
	import { goto } from '$app/navigation';
	import {
		collection,
		addDoc,
		deleteDoc,
		doc,
		setDoc,
		getDocs,
        getDoc,
		onSnapshot
	} from 'firebase/firestore';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	export let data: PageData;

	let groupId = data.groupId;
	let newGameTitle: string | null | undefined = '';
	let newGameScore: string | null | undefined = null;
	let games = writable([]);
    let usernames = writable({});
	let user;
	let errorMessage: string | null = null;
	let editMode = false;

	// Fetch user
	user = auth.currentUser;

	// Function to add a new game
	const addGame = async () => {
		if (!newGameTitle) {
			errorMessage = 'Game name cannot be empty.';
			return;
		}
		errorMessage = '';

		if (newGameTitle.trim()) {
			// Handle BoardGameGeek link fetch
			if (newGameTitle.includes('boardgamegeek.com')) {
				const gameId = newGameTitle.split('/boardgame/')[1]?.split('/')[0];
				if (gameId) {
					const response = await fetch(`https://api.geekdo.com/xmlapi2/thing?id=${gameId}&stats=1`);
					const xml = await response.text();
					const parser = new DOMParser();
					const xmlDoc = parser.parseFromString(xml, 'text/xml');
					newGameTitle = xmlDoc.querySelector('name')?.getAttribute('value');
					newGameScore = xmlDoc.querySelector('average')?.getAttribute('value');
				}
			}

			// Add game to Firestore
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

	// Function to delete a game
	const deleteGame = async (gameId) => {
		const gameDoc = doc(db, 'groups', groupId, 'games', gameId);
		await deleteDoc(gameDoc);
	};

	// Function to update or add motivation score
	const updateMotivation = async (gameId: string, newScore: number) => {
		try {
			const motivationDoc = doc(db, 'groups', groupId, 'games', gameId, 'motivations', user.uid);
			await setDoc(motivationDoc, { score: newScore }, { merge: true });
            fetchGamesWithMotivations(); // Fetch games and motivation scores on mount
			console.log('Motivation score successfully updated/added.');
		} catch (error) {
			console.error('Error updating/adding motivation score: ', error);
		}
	};

	// Fetch motivation scores for a game
	const fetchMotivationsForGame = async (gameId: string) => {
		try {
			const motivationsRef = collection(db, 'groups', groupId, 'games', gameId, 'motivations');
			const motivationsSnapshot = await getDocs(motivationsRef);

			const motivations = {};
			motivationsSnapshot.forEach((doc) => {
				motivations[doc.id] = doc.data().score;
			});
			return motivations;
		} catch (error) {
			console.error('Error fetching motivations: ', error);
			return {};
		}
	};

	// Fetch and track games with their motivations
	const fetchGamesWithMotivations = () => {
		onSnapshot(collection(db, 'groups', groupId, 'games'), async (snapshot) => {
			const gameList = [];
            const userMap = {};

			for (const doc of snapshot.docs) {
				const gameData = doc.data();
				const motivations = await fetchMotivationsForGame(doc.id); // Fetch motivation scores for each game
                
                // Fetch usernames for each user in motivations
				for (const userId of Object.keys(motivations)) {
					if (!userMap[userId]) {
						userMap[userId] = await fetchUsername(userId);
					}
				}

				gameList.push({
					id: doc.id,
					...gameData,
					motivations
				});
			}

			games.set(gameList); // Update the games store with motivation scores
            usernames.set(userMap);
		});
	};

	onMount(() => {
		if (!user) goto('/'); // Redirect to landing page if not authenticated
		fetchGamesWithMotivations(); // Fetch games and motivation scores on mount
	});

	const handleEdit = () => {
		editMode = !editMode;
	};

    // Fetch username for a specific user
	const fetchUsername = async (userId: string) => {
		try {
			const userDoc = await getDoc(doc(db, 'users', userId));
			if (userDoc.exists()) {
				return userDoc.data().username || userDoc.data().displayName || userDoc.data().email;
			}
		} catch (error) {
			console.error('Error fetching username: ', error);
		}
		return null;
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
						value={game.motivations[user.uid] || 0}
						on:input={(e) => updateMotivation(game.id, +e.target.value)}
					/>
					<ul>
						{#each Object.entries(game.motivations) as [userId, score]}
                            <li>{$usernames[userId] || userId}: {score}</li>
                        {/each}
					</ul>

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
