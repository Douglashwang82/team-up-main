# Lessons Learned

- **API Rebuilds**: After modifying backend API schemas or logic (like adding `user_join_status`), the Docker container running the API must be rebuilt (`docker compose up --build`) for the changes to take effect locally. Simply restarting the frontend or regenerating the API client is not enough if the local backend server is running from an outdated Docker image.
