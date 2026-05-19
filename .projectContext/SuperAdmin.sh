
# Curl command to create a super admin
curl -X POST http://localhost:3000/api/v1/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "email": "[EMAIL_ADDRESS]",
  "username": "[USER NAME]",
  "password": "[PASSWORD]",
  "secretKey": "[SECRET KEY]",
  "accountType": "Editor"
}'

