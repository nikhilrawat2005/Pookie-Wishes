from http.server import BaseHTTPRequestHandler
import json
import requests
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
            order_id = body.get('order_id', f"order_{int(time.time())}")
            order_amount = float(body.get('order_amount', 0))
            customer_email = body.get('customer_email', 'unknown@email.com')
            customer_phone = body.get('customer_phone', '9999999999')
            customer_name = body.get('customer_name', 'Guest')
            return_url = body.get('return_url', '')

            if order_amount <= 0:
                raise ValueError("Invalid order amount")

            # Cashfree config
            app_id = os.environ.get('CASHFREE_APP_ID')
            secret = os.environ.get('CASHFREE_SECRET_KEY')
            env = os.environ.get('CASHFREE_ENVIRONMENT', 'sandbox')

            if not app_id or not secret:
                raise ValueError("Server missing Cashfree credentials in environment variables")

            url = "https://sandbox.cashfree.com/pg/orders" if env == 'sandbox' else "https://api.cashfree.com/pg/orders"

            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "x-api-version": "2023-08-01",
                "x-client-id": app_id,
                "x-client-secret": secret
            }

            payload = {
                "order_amount": order_amount,
                "order_currency": "INR",
                "customer_details": {
                    "customer_id": f"cust_{int(time.time())}_{order_id[-6:]}",
                    "customer_email": customer_email,
                    "customer_phone": str(customer_phone),
                    "customer_name": customer_name
                },
                "order_meta": {
                    "return_url": return_url + "?order_id={order_id}"
                }
            }

            response = requests.post(url, json=payload, headers=headers)
            response_data = response.json()

            if response.status_code == 200 and 'payment_session_id' in response_data:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'payment_session_id': response_data['payment_session_id'],
                    'order_id': response_data.get('order_id', order_id),
                    'environment': env
                }).encode('utf-8'))
            else:
                error_msg = response_data.get('message', 'Unknown Error')
                raise Exception(f"Cashfree API Error: {error_msg}")

        except Exception as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
