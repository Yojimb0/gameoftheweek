<slot></slot>

<style>
	:global(html) {
		& *,
		& *::before,
		& *::after {
			box-sizing: border-box;
		}

		/* Global Styles */
		& body {
			font-family: 'Roboto', sans-serif;
			/* Use the imported font */
			margin: 0;
			padding: 0;
			background-color: #f0f2f5;
			/* Light background color for the entire app */
			color: #333;
			/* Default text color */
		}

		& h1,
		& h2,
		& h3,
		& h4,
		& h5,
		& h6 {
			margin: 0;
			padding: 0;
		}
		& h1 {
			font-size: 1.4rem;
			margin-inline-end: auto;
		}
		& h2 {
			font-size: 1.2rem;
			color: #666;
		}

		& main {
			margin-inline: max(20px, calc((100% - 400px) / 2));
		}

		& .header {
			display: flex;
			align-items: center;
			gap: 10px;
			padding-block: 5px 10px;
			border-bottom: 1px solid #00000022;
			margin-block-end: 20px;
		}

		& .box {
			padding: 15px;
			background-color: #f9f9f9;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
			margin-block-end: 20px;
			& fieldset {
				border: none;
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 0;
			}
			& input {
				width: 100%;
				padding: 10px;
				margin: 10px 0;
				border: 1px solid #ccc;
				border-radius: 4px;
				transition: border-color 0.3s;
			}

			& input:focus {
				border-color: #007bff;
				outline: none;
			}
		}

		/* Button styles */
		& button {
			cursor: pointer;
			font-weight: bold;
			/* Change the cursor to pointer for buttons */
		}

		/* Input styles */
		& input,
		& textarea {
			font-family: inherit;
			/* Ensure inputs use the same font */
			font-size: 16px;
			/* Set a default font size */
		}

		/* Set some default link styles */
		& a {
			text-decoration: none;
			color: #007bff;
			/* Default link color */
			transition: color 0.3s;
		}

		& a:hover {
			color: #0056b3;
			/* Darker color on hover */
		}

		/* Utility classes for spacing */
		& .mt-1 {
			margin-top: 8px;
		}

		& .mt-2 {
			margin-top: 16px;
		}

		& .mb-1 {
			margin-bottom: 8px;
		}

		& .mb-2 {
			margin-bottom: 16px;
		}

		& .p-1 {
			padding: 8px;
		}

		& .p-2 {
			padding: 16px;
		}

		& p.error {
			color: red;
			font-weight: bold;
		}

		& button {
			padding: 8px 10px;
			color: white;
			background-color: #007bff;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			transition: all 0.3s;
			flex-shrink: 0;
		}

		& button:hover {
			background-color: #0056b3;
		}

		& .icon-button {
			border: 1px transparent solid;
			padding: 0;
			background: none;
			color: #444;
		}
		& .icon-button:hover {
			scale: 1.1;
			background: none;
			color: #444;
		}

		& .icon-button svg {
			fill: currentColor;
			display: block;
		}

		& .sign-out-button {
			margin-top: 20px;
			background-color: #dc3545;
			/* Bootstrap's danger color */
		}

		& .sign-out-button:hover {
			background-color: #c82333;
			/* Darker red on hover */
		}
	}
</style>
