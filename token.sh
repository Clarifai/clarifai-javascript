LOGIN_DATA=$(curl -X POST "$API_ENDPOINT/v2/login" -H 'content-type: application/json' -d "{ \"email\": \"${CLARIFAI_USER_EMAIL}\", \"password\": \"${CLARIFAI_USER_PASSWORD}\" }")
export SESSION_TOKEN=$(echo "$LOGIN_DATA" | jq -r '.session_token')
export USER_ID=$(echo "$LOGIN_DATA" | jq -r '.v2_user_id')