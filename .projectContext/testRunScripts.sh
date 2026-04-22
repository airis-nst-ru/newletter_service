# this is when running from production
curl -X POST https://newletter-service.vercel.app/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: [ENCRYPTION_KEY]" \
  -d '{
    "emails": "harshita.joshi2024@nst.rishihood.edu.in shreya.suman2024@nst.rishihood.edu.in rachit.gupta2024@nst.rishihood.edu.in anurag.tiwari2024@nst.rishihood.edu.in yashika.b25572@nst.rishihood.edu.in vaidehi.sahu2024@nst.rishihood.edu.in",
    "subject": "The AIRIS Chronicle – Latest Edition"
  }'


# This is when running locally 
curl -X POST http://localhost:5001/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: [ENCRYPTION_KEY]" \
  -d '{
    "emails": "harshita.joshi2024@nst.rishihood.edu.in shreya.suman2024@nst.rishihood.edu.in rachit.gupta2024@nst.rishihood.edu.in anurag.tiwari2024@nst.rishihood.edu.in yashika.b25572@nst.rishihood.edu.in vaidehi.sahu2024@nst.rishihood.edu.in",
    "subject": "The AIRIS Chronicle – Latest Edition"
  }'

# from render production 
curl -X POST https://newletter-service.onrender.com/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: [ENCRYPTION_KEY]" \
  -d '{
    "emails": "anurag.tiwari2024@nst.rishihood.edu.in",
    "subject": "The AIRIS Chronicle – Latest Edition"
  }'