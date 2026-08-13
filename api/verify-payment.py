from http.server import BaseHTTPRequestHandler
import json
import os
import hmac
import hashlib
import razorpay

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _reply(self, status, payload):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                raise ValueError("Empty request body")

            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))

            razorpay_order_id = body.get('razorpay_order_id')
            razorpay_payment_id = body.get('razorpay_payment_id')
            razorpay_signature = body.get('razorpay_signature')
            order_id = body.get('order_id')  # our own Firestore doc id, e.g. "order107"
            expected_amount = body.get('expected_amount')  # in rupees, from our own order record

            if not (razorpay_order_id and razorpay_payment_id and razorpay_signature and order_id):
                raise ValueError("Missing required verification fields")

            key_id = os.environ.get('RAZORPAY_KEY_ID')
            key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
            if not key_id or not key_secret:
                raise ValueError("Server missing Razorpay credentials in environment variables")

            client = razorpay.Client(auth=(key_id, key_secret))

            # 1. Verify the HMAC signature Razorpay sent back — this proves the payment
            #    response actually came from Razorpay and wasn't forged client-side.
            generated_signature = hmac.new(
                key_secret.encode('utf-8'),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(generated_signature, razorpay_signature):
                raise ValueError("Signature verification failed")

            # 2. Double-check directly against Razorpay's API that the payment is
            #    'captured' and the amount matches what we expected for this order.
            payment = client.payment.fetch(razorpay_payment_id)

            if payment.get('status') != 'captured':
                raise ValueError(f"Payment not captured (status: {payment.get('status')})")

            if payment.get('order_id') != razorpay_order_id:
                raise ValueError("Payment/order mismatch")

            if expected_amount is not None:
                expected_paise = int(round(float(expected_amount) * 100))
                if int(payment.get('amount', 0)) != expected_paise:
                    raise ValueError("Payment amount mismatch")

            # If we get here, the payment is genuinely verified.
            # NOTE: This endpoint intentionally does NOT write to Firestore itself —
            # do that write using the Firebase Admin SDK (server-side, trusted) in
            # whichever backend/function has admin credentials, using this verified
            # result as the trigger. Never let the browser set status:'paid' directly.
            self._reply(200, {
                'success': True,
                'verified': True,
                'order_id': order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'amount_paise': payment.get('amount'),
            })

        except Exception as e:
            self._reply(400, {'success': False, 'verified': False, 'error': str(e)})
