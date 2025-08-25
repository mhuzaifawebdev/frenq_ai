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

// GET - Get tasks from specific list
export async function GET(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    const { tasklistId } = params;
    const { searchParams } = new URL(request.url);

    console.log('Fetching tasks for list:', tasklistId);

    // Build query parameters
    const apiParams = new URLSearchParams();
    
    // Get query parameters from request
    const maxResults = searchParams.get('maxResults') || '100';
    const showCompleted = searchParams.get('showCompleted') || 'true';
    const showHidden = searchParams.get('showHidden') || 'true';
    const pageToken = searchParams.get('pageToken');

    apiParams.append('maxResults', maxResults);
    apiParams.append('showCompleted', showCompleted);
    apiParams.append('showHidden', showHidden);
    
    if (pageToken) {
      apiParams.append('pageToken', pageToken);
    }

    const url = `${GOOGLE_TASKS_API_BASE}/lists/${tasklistId}/tasks?${apiParams.toString()}`;
    console.log('Google Tasks API URL:', url);

    const data = await makeGoogleTasksRequest(url, {}, accessToken);

    return NextResponse.json({
      success: true,
      data: {
        tasks: data.items || [],
        nextPageToken: data.nextPageToken
      }
    });
  } catch (error) {
    console.error('GET /api/gtasks/[tasklistId] error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create new task in specific list
export async function POST(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    const { tasklistId } = params;

    // Get request body
    const body = await request.json();
    console.log('Creating task in list:', tasklistId, 'with data:', body);

    // Prepare task data for Google Tasks API
    const taskData = {
      title: body.title,
    };

    if (body.notes) {
      taskData.notes = body.notes;
    }

    if (body.due) {
      taskData.due = body.due;
    }

    if (body.parent) {
      taskData.parent = body.parent;
    }

    const data = await makeGoogleTasksRequest(
      `${GOOGLE_TASKS_API_BASE}/lists/${tasklistId}/tasks`,
      {
        method: 'POST',
        body: JSON.stringify(taskData),
      },
      accessToken
    );

    return NextResponse.json({
      success: true,
      data: {
        task: data
      },
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('POST /api/gtasks/[tasklistId] error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
