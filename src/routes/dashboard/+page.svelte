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
      if(!user) return;
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
        if(!user) return;
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
  
  {#if user}
    <h1>Welcome to your dashboard, {user.displayName}</h1>
    
    <h2>Create a Group</h2>
    <input type="text" bind:value={groupName} placeholder="Group Name" />
    <button on:click={handleCreateGroup}>Create Group</button>
  
    <h2>Join a Group</h2>
    <input type="text" bind:value={groupId} placeholder="Group ID" />
    <button on:click={handleJoinGroup}>Join Group</button>
  
    {#if errorMessage}
      <p style="color:red;">{errorMessage}</p>
    {/if}
  
    <h2>Your Groups</h2>
    <ul>
      {#each userGroups as group (group.id)}
        <li>{group.name} (ID: {group.id})</li>
      {/each}
    </ul>
  
    <button on:click={handleSignOut}>Sign Out</button>
  {:else}
    <p>Loading...</p>
  {/if}