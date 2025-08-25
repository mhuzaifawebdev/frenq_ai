import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const GOOGLE_TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';

// Helper function to verify JWT token and extract user info
async function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

// Helper function to get user's Google access token from database
async function getUserGoogleToken(userId) {
  try {
    // This would typically fetch from your database
    // For now, assuming you store the Google access token
    // You'll need to implement this based on your auth system
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/google/token/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Google token');
    }

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Failed to get Google token:', error);
    throw new Error('Failed to get Google access token');
  }
}

// Helper function to make authenticated requests to Google Tasks API
async function makeGoogleTasksRequest(url, options = {}, accessToken) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Tasks API error:', response.status, errorText);
    throw new Error(`Google Tasks API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

// GET - Get all task lists
export async function GET(request) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    console.log('Fetching task lists for user:', user.id);
    
    const data = await makeGoogleTasksRequest(
      `${GOOGLE_TASKS_API_BASE}/users/@me/lists`,
      {},
      accessToken
    );

    return NextResponse.json({
      success: true,
      data: {
        taskLists: data.items || []
      }
    });
  } catch (error) {
    console.error('GET /api/gtasks/lists error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch task lists' },
      { status: 500 }
    );
  }
}

// POST - Create new task list
export async function POST(request) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    // Get request body
    const body = await request.json();
    console.log('Creating task list with data:', body);

    // Prepare task list data for Google Tasks API
    const taskListData = {
      title: body.title,
    };

    const data = await makeGoogleTasksRequest(
      `${GOOGLE_TASKS_API_BASE}/users/@me/lists`,
      {
        method: 'POST',
        body: JSON.stringify(taskListData),
      },
      accessToken
    );

    return NextResponse.json({
      success: true,
      data: {
        taskList: data
      },
      message: 'Task list created successfully'
    });
  } catch (error) {
    console.error('POST /api/gtasks/lists error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create task list' },
      { status: 500 }
    );
  }
}
