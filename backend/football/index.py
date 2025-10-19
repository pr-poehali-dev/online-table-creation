'''
Business: API for football league standings - get teams, update stats, manage matches
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with teams standings or update confirmation
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Create database connection using simple query protocol"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT 
                    t.id,
                    t.name,
                    t.logo_emoji,
                    t.color,
                    ts.played,
                    ts.won,
                    ts.drawn,
                    ts.lost,
                    ts.goals_for,
                    ts.goals_against,
                    (ts.goals_for - ts.goals_against) as goal_difference,
                    ts.points
                FROM teams t
                LEFT JOIN team_stats ts ON t.id = ts.team_id
                ORDER BY ts.points DESC, goal_difference DESC, ts.goals_for DESC
            """)
            teams = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'teams': [dict(t) for t in teams]})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            team_id = body_data.get('team_id')
            field = body_data.get('field')
            value = body_data.get('value', 0)
            
            allowed_fields = ['played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'points']
            if field not in allowed_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid field'})
                }
            
            cur.execute(f"""
                UPDATE team_stats 
                SET {field} = {value}
                WHERE team_id = {team_id}
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
            body_data = json.loads(event.get('body', '{}'))
            team_name = body_data.get('team_name', '')
            logo_emoji = body_data.get('logo_emoji', '⚽')
            color = body_data.get('color', '#8B5CF6')
            
            team_name_escaped = team_name.replace("'", "''")
            
            cur.execute(f"""
                INSERT INTO teams (name, logo_emoji, color)
                VALUES ('{team_name_escaped}', '{logo_emoji}', '{color}')
                RETURNING id
            """)
            team_id = cur.fetchone()['id']
            
            cur.execute(f"""
                INSERT INTO team_stats (team_id, played, won, drawn, lost, goals_for, goals_against, points)
                VALUES ({team_id}, 0, 0, 0, 0, 0, 0, 0)
            """)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'team_id': team_id})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
