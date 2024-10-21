<script>
    import { signInWithGoogle } from "../lib/firebase";
    import { goto } from '$app/navigation'; // for redirecting to the dashboard
    
    let user = null;
  
    const handleSignIn = async () => {
      user = await signInWithGoogle();
      if (user) {
        goto("/dashboard"); // Redirect to dashboard after sign-in
      }
    };
  </script>
  
  <style>
    /* Simple landing page styling */
    .hero {
      background-image: url('/hero.jpeg');
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      background-size: cover;
      background-position: center;
    }
    button {
      padding: 10px 20px;
      font-size: 1.2em;
      cursor: pointer;
    }
  </style>
  
  <div class="hero">
    <div>
      <h1>Welcome to WeekPlay</h1>
      <p>Find your next favorite board game with friends every week.</p>
      <button on:click={handleSignIn}>Sign In with Google</button>
    </div>
  </div>