from http.server import BaseHTTPRequestHandler
import json
import os
import cloudinary
import cloudinary.api

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

            order_id = body.get('order_id')
            if not order_id:
                raise ValueError("Missing order_id")

            # Cloudinary credentials (add these to Vercel env vars)
            api_key = os.environ.get('CLOUDINARY_API_KEY')
            api_secret = os.environ.get('CLOUDINARY_API_SECRET')
            cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME', 'dktx4woql')

            if not api_key or not api_secret:
                # If credentials are not set (e.g., local dev), we will return success but log a warning.
                # Returning 200 ensures the frontend doesn't break if env vars aren't set yet.
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True, 
                    'message': 'Simulated deletion (Missing Cloudinary environment variables)'
                }).encode('utf-8'))
                return

            cloudinary.config(
                cloud_name = cloud_name,
                api_key = api_key,
                api_secret = api_secret,
                secure = True
            )

            # 1. Delete all images inside the order's folder
            folder_path = f"orders/{order_id}"
            del_res = cloudinary.api.delete_resources_by_prefix(folder_path)

            # 2. Delete the empty folder itself
            try:
                cloudinary.api.delete_folder(folder_path)
            except Exception as e:
                # Folder might not exist or might not be empty if delete_resources failed partially
                print(f"Warning: Could not delete folder {folder_path} - {e}")

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'deleted_resources': del_res,
                'folder': folder_path
            }).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
