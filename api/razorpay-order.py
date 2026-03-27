from http.server import BaseHTTPRequestHandler
import json
import razorpay
import os
import time

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                raise ValueError("Empty request body")
                
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))

            # Extract details
            order_amount = float(body.get('order_amount', 0))
            
            if order_amount <= 0:
                raise ValueError("Invalid order amount")

            # Razorpay config
            key_id = os.environ.get('RAZORPAY_KEY_ID')
            key_secret = os.environ.get('RAZORPAY_KEY_SECRET')

            if not key_id or not key_secret:
                raise ValueError("Server missing Razorpay credentials in environment variables")

            client = razorpay.Client(auth=(key_id, key_secret))

            # Razorpay expects amount in paise (multiply by 100)
            data = {
                "amount": int(order_amount * 100),
                "currency": "INR",
                "receipt": f"receipt_{int(time.time())}",
                "partial_payment": False,
            }

            razor_order = client.order.create(data=data)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'order_id': razor_order['id'],
                'amount': razor_order['amount'],
                'key_id': key_id
            }).encode('utf-8'))

        except Exception as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
