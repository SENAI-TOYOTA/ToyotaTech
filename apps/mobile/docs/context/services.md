# Context: Services & Backend

## Overview
The application handles external API communication via the `services/` directory and interfaces with an AWS-based backend.

## Services (`services/`)
Handles the frontend side of the API communication and logic.
- `api.ts`: Likely configures the base API client (e.g., Axios instance or fetch wrappers) with interceptors for auth tokens and error handling.
- `auth.ts`: Methods for login, registration, OTP verification, and session management.
- `profile.ts`: Methods for fetching and updating user profile data.
*(Note: `news.ts` was identified as dead code and removed).*

## AWS Backend (`aws/`)
Contains the serverless infrastructure for the application, specifically handling custom authentication.
- **`lambda/auth_handler.py`**: A robust Python Lambda function handling the authentication backend (likely interfacing with Cognito, sending OTPs, etc.).
- **Scripts (`aws/scripts/`)**:
  - `deploy.ps1`: PowerShell script to package and deploy the AWS infrastructure.
  - `destroy.ps1`: PowerShell script to tear down the deployed AWS resources.
- `README.md`: Contains instructions for the AWS deployment process.
