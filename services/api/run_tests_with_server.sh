#!/bin/bash
cd "$(dirname "$0")"

# Activate venv if exists
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment not found. Please set one up."
    # Fallback to system python? No, better fail or try to use current path.
fi

# Install requirements if needed (suppress output to keep it clean)
echo "Ensuring dependencies are installed..."
pip install -r requirements.txt > /dev/null 2>&1

# Start server in background
export FLASK_APP=app
export BOOTSTRAP_DB=1

# Kill any existing process on 8080 just in case
lsof -ti:8080 | xargs kill -9 2>/dev/null

echo "Starting server..."
# Using flask run is effectively same as gunicorn for this purpose but simpler with reloading off
flask run -p 8080 > server_log.txt 2>&1 &
SERVER_PID=$!

echo "Server started with PID $SERVER_PID. Waiting for health check..."

# Wait for server
max_retries=30
count=0
while ! curl -s http://localhost:8080/health > /dev/null; do
    sleep 1
    count=$((count+1))
    if [ $count -ge $max_retries ]; then
        echo "Server failed to start. Check server_log.txt"
        cat server_log.txt
        kill $SERVER_PID
        exit 1
    fi
    echo -n "."
done
echo ""
echo "Server is up at http://localhost:8080"

# Run tests
echo "Running tests..."
python3 test_routes.py

TEST_EXIT_CODE=$?

# Kill server
kill $SERVER_PID

exit $TEST_EXIT_CODE
