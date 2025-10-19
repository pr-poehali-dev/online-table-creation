'''
Business: API for collaborative spreadsheet - get cells, update cells, manage active users
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with cell data or update confirmation
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Create database connection using simple query protocol"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            # Get all cells for sheet
            params = event.get('queryStringParameters') or {}
            sheet_id = params.get('sheet_id', '1')
            
            cur.execute(f"SELECT row_index, col_index, value FROM cells WHERE sheet_id = {sheet_id}")
            cells = cur.fetchall()
            
            # Get active users
            cur.execute(f"SELECT user_name, user_color FROM active_users WHERE sheet_id = {sheet_id}")
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'cells': [dict(c) for c in cells],
                    'users': [dict(u) for u in users]
                })
            }
        
        elif method == 'POST':
            # Update cell value
            body_data = json.loads(event.get('body', '{}'))
            sheet_id = body_data.get('sheet_id', 1)
            row = body_data.get('row')
            col = body_data.get('col')
            value = body_data.get('value', '')
            
            # Escape single quotes
            value_escaped = value.replace("'", "''")
            
            # Insert or update cell
            cur.execute(f"""
                INSERT INTO cells (sheet_id, row_index, col_index, value, updated_at)
                VALUES ({sheet_id}, {row}, {col}, '{value_escaped}', CURRENT_TIMESTAMP)
                ON CONFLICT (sheet_id, row_index, col_index)
                DO UPDATE SET value = '{value_escaped}', updated_at = CURRENT_TIMESTAMP
            """)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'PUT':
            # Update active user
            body_data = json.loads(event.get('body', '{}'))
            sheet_id = body_data.get('sheet_id', 1)
            user_name = body_data.get('user_name', 'Anonymous')
            user_color = body_data.get('user_color', '#8B5CF6')
            
            # Escape single quotes
            user_name_escaped = user_name.replace("'", "''")
            
            # Update or insert active user
            cur.execute(f"""
                INSERT INTO active_users (sheet_id, user_name, user_color, last_seen)
                VALUES ({sheet_id}, '{user_name_escaped}', '{user_color}', CURRENT_TIMESTAMP)
            """)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
