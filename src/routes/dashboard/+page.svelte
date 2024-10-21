<script lang="ts">
    import { onMount } from "svelte";
    import { type User, onAuthStateChanged } from "firebase/auth";
    import { auth, logOut } from "../../lib/firebase";
    import { goto } from '$app/navigation';
  
    let user: User | null = null; // Use Firebase's `User` type, or null when not authenticated
  
    onMount(() => {
      const unsubscribe = onAuthStateChanged(auth, (u: User | null) => {
        if (u) {
          user = u; // Set the user when authenticated
        } else {
          goto('/'); // Redirect to landing page if not authenticated
        }
      });
      return () => unsubscribe(); // Cleanup listener on unmount
    });
  
    const handleSignOut = async (): Promise<void> => {
      await logOut();
      goto('/'); // Go back to landing page after signing out
    };
  </script>
  
  {#if user}
    <h1>Welcome to your dashboard, {user.displayName}</h1>
    <p>Here you can add games, check the weekly game results, and more!</p>
    <button on:click={handleSignOut}>Sign Out</button>
  {:else}
    <p>Loading...</p> <!-- This shows a loading message while waiting for the auth state to resolve -->
  {/if}