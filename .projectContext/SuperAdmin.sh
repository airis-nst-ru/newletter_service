
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

curl -X POST http://localhost:3000/api/v1/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "email": "anuragkumartiwari12@gmail.com",
  "username": "anurag_",
  "password": "anurag",
  "secretKey": "my_super_secret_signup_key",
  "accountType": "Approver"
}'