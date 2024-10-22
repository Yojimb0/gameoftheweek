<script lang="ts">
	import { onMount } from 'svelte';
	import { type User, onAuthStateChanged } from 'firebase/auth';
	import { auth, logOut, createGroup, joinGroup, getUserGroups, db } from '../../lib/firebase';
	import { goto } from '$app/navigation';
	import { doc, getDoc, setDoc } from 'firebase/firestore';

	let user: User | null = null;
	let groupName = '';
	let groupId = '';
	let userGroups: { id: string; name: string }[] = [];
	let errorMessage: string | null = null;

	let username = '';
	let usernameDialog: HTMLDialogElement;

	const toggleDialog = () => {
		if (usernameDialog.open) usernameDialog.close();
		else usernameDialog.showModal();
	};

	// onMount(async () => {
	//   const unsubscribe = onAuthStateChanged(auth, async (u: User | null) => {
	//     if (u) {
	//       user = u;
	//       userGroups = await getUserGroups(user.uid); // Fetch groups for the authenticated user
	//     } else {
	//       goto('/'); // Redirect to landing page if not authenticated
	//     }
	//   });
	//   return () => unsubscribe(); // Cleanup listener on unmount
	// });
	onMount(async () => {
		user = auth.currentUser; // Get the current user
		if (user) {
			const userDocRef = doc(db, 'users', user.uid);
			const docSnap = await getDoc(userDocRef);
			userGroups = await getUserGroups(user.uid); // Fetch groups for the authenticated user
			if (docSnap.exists()) {
				username = docSnap.data().username || 'No username set';
			}
		} else {
			goto('/'); // Redirect to landing page if not authenticated
		}
	});

	const handleCreateGroup = async () => {
		if (!groupName) {
			errorMessage = 'Group name cannot be empty.';
			return;
		}
		await createGroup(groupName, user.uid);
		groupName = ''; // Clear input after creating the group
		userGroups = await getUserGroups(user.uid); // Refresh the user's groups
		errorMessage = null; // Clear error message
	};

	const handleJoinGroup = async () => {
		if (!groupId) {
			errorMessage = 'Group ID cannot be empty.';
			return;
		}
		await joinGroup(groupId, user.uid);
		groupId = ''; // Clear input after joining the group
		userGroups = await getUserGroups(user.uid); // Refresh the user's groups
		errorMessage = null; // Clear error message
	};

	const handleSignOut = async (): Promise<void> => {
		await logOut();
		goto('/'); // Go back to landing page after signing out
	};

	// Function to set the username
	const setUsername = async () => {
		if (!username.trim()) {
			alert('Username cannot be empty.');
			return;
		}

		try {
			const userDocRef = doc(db, 'users', user.uid);
			await setDoc(userDocRef, { username }, { merge: true });
			toggleDialog(); // Close the dialog after setting username
		} catch (error) {
			console.error('Error setting username:', error);
			alert('Could not set username. Please try again.');
		}
	};
</script>

<main>
	{#if user}
		<div class="actions">
			<h1>
				Welcome {username || user?.displayName || user?.email}
			</h1>
			<button class="icon-button" on:click={toggleDialog}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 -960 960 960"
					width="24px"
					fill="#5f6368"
				>
					<path
						d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"
					/>
				</svg>
			</button>
			<button class="sign-out" on:click={handleSignOut}>Sign Out</button>
		</div>

		<dialog bind:this={usernameDialog}>
			<h2>Set Your Username</h2>
			<input type="text" bind:value={username} placeholder="Enter a custom username" />
			<button on:click={setUsername}>Set Username</button>
			<button on:click={toggleDialog}>Close</button>
		</dialog>

		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}

		<div class="box">
			<h2>Your Groups</h2>
			<ul>
				{#each userGroups as group (group.id)}
					<li><strong>{group.name}</strong> <span>{group.id}</span></li>
				{/each}
			</ul>
		</div>

		<div class="box">
			<h2>Create a Group</h2>
			<fieldset>
				<input type="text" bind:value={groupName} placeholder="Group Name" />
				<button on:click={handleCreateGroup}>Create Group</button>
			</fieldset>

			<h2>Join a Group</h2>
			<fieldset>
				<input type="text" bind:value={groupId} placeholder="Group ID" />
				<button on:click={handleJoinGroup}>Join Group</button>
			</fieldset>
		</div>
	{:else}
		<p>Loading...</p>
	{/if}
</main>

<style>
	.actions {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-block: 5px 10px;
		border-bottom: 1px solid #00000022;
		margin-block-end: 20px;
	}
	h1 {
		font-size: 1.4rem;
		margin-inline-end: auto;
	}
	h2 {
		font-size: 1.2rem;
		color: #666;
	}

	fieldset{
		border:none;
		display: flex;
		align-items: center;
		gap:10px;
		padding:0;
	}
	input {
		width: 100%;
		padding: 10px;
		margin: 10px 0;
		border: 1px solid #ccc;
		border-radius: 4px;
		transition: border-color 0.3s;
	}

	input:focus {
		border-color: #007bff;
		outline: none;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		background-color: #fff;
		padding: 10px;
		border-bottom: 1px solid #00000011;
		display: flex;
		align-items: center;

		& strong {
			margin-inline-end: auto;
		}
		& span {
			color: #00000066;
		}
	}

	/* Dialog styling */
	dialog {
		border: none; /* Remove default border */
		border-radius: 8px; /* Rounded corners */
		padding: 20px; /* Padding inside the dialog */
		/*max-width: 400px; /* Maximum width of the dialog */
		/*background: white; /* White background */
		/*box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* Subtle shadow */
		font-family: Arial, sans-serif; /* Change font if needed */
	}

	/* Style for the backdrop */
	dialog::backdrop {
		background: #00000055; /* Semi-transparent backdrop */
	}
</style>
