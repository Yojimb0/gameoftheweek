<script lang="ts">
    import { onMount } from "svelte";
    import { type User, onAuthStateChanged } from "firebase/auth";
    import { auth, logOut, createGroup, joinGroup, getUserGroups } from "../../lib/firebase";
    import { goto } from '$app/navigation';
  
    let user: User | null = null;
    let groupName = '';
    let groupId = '';
    let userGroups: { id: string; name: string }[] = [];
    let errorMessage: string | null = null;
  
    onMount(async () => {
      const unsubscribe = onAuthStateChanged(auth, async (u: User | null) => {
        if (u) {
          user = u;
          userGroups = await getUserGroups(user.uid); // Fetch groups for the authenticated user
        } else {
          goto('/'); // Redirect to landing page if not authenticated
        }
      });
      return () => unsubscribe(); // Cleanup listener on unmount
    });
  
    const handleCreateGroup = async () => {
      if (!groupName) {
        errorMessage = "Group name cannot be empty.";
        return;
      }
      await createGroup(groupName, user.uid);
      groupName = ''; // Clear input after creating the group
      userGroups = await getUserGroups(user.uid); // Refresh the user's groups
      errorMessage = null; // Clear error message
    };
  
    const handleJoinGroup = async () => {
      if (!groupId) {
        errorMessage = "Group ID cannot be empty.";
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
  </script>
  
  <style>
    .dashboard {
      max-width: 800px;
      margin: 30px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  
    h1 {
      font-size: 2em;
      color: #333;
    }
  
    h2 {
      font-size: 1.5em;
      margin-top: 20px;
      color: #666;
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
  
    button {
      padding: 10px 15px;
      color: white;
      background-color: #007bff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
  
    button:hover {
      background-color: #0056b3;
    }
  
    ul {
      list-style-type: none;
      padding: 0;
    }
  
    li {
      background-color: #fff;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  
    p.error {
      color: red;
      font-weight: bold;
    }
  
    .sign-out {
      margin-top: 20px;
      background-color: #dc3545; /* Bootstrap's danger color */
    }
  
    .sign-out:hover {
      background-color: #c82333; /* Darker red on hover */
    }
  </style>
  
  {#if user}
    <div class="dashboard">
      <h1>Welcome to your dashboard, {user.displayName}</h1>
      
      <h2>Create a Group</h2>
      <input type="text" bind:value={groupName} placeholder="Group Name" />
      <button on:click={handleCreateGroup}>Create Group</button>
  
      <h2>Join a Group</h2>
      <input type="text" bind:value={groupId} placeholder="Group ID" />
      <button on:click={handleJoinGroup}>Join Group</button>
  
      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}
  
      <h2>Your Groups</h2>
      <ul>
        {#each userGroups as group (group.id)}
          <li>{group.name} (ID: {group.id})</li>
        {/each}
      </ul>
  
      <button class="sign-out" on:click={handleSignOut}>Sign Out</button>
    </div>
  {:else}
    <p>Loading...</p>
  {/if}
  