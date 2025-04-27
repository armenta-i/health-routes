from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Twilio connection
account_id = os.getenv('TWILIO_ID')
auth_token = os.getenv('TWILIO_KEY')
client = Client(account_id, auth_token)


# class SMSRequest(BaseModel):
#     to: str
#     body: str

# # Helper function to send SMS
# def send_sms_message(to_number: str, message_text: str):
#     try:
#         message = client.messages.create(
#             from_='+118557585706',  # your Twilio phone number
#             body=message_text,
#             to=to_number
#         )
#         return message.sid
#     except Exception as e:
#         raise Exception(f"Failed to send SMS: {str(e)}")
    
def sendCustomMessage(recipient, body):
    message = client.messages.create(
        body = body,
        from_ = '+118557585706',
        to = recipient
    )
    return message.sid

# API Endpoint to send SMS
# @app.post("/send-sms")
# async def send_sms(request: SMSRequest):
#     try:
#         sid = send_sms_message(request.to, request.body)
#         return {"message_id": sid}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# message = client.messages.create(
#     to='+15759155602'
# )
# print(message.sid)

if __name__ == "__main__":
    # Manual test
    try:
        sid = sendCustomMessage('+15759155602', "🚀 Hello this is a test SMS from the backend!")
        print(f"Message sent successfully! SID: {sid}")
    except Exception as e:
        print(f"Failed to send test SMS: {e}")

