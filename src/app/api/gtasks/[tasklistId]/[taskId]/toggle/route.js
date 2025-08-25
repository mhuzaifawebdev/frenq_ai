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

// PATCH - Toggle task completion status
export async function PATCH(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    const { tasklistId, taskId } = params;

    console.log('Toggling task completion:', taskId, 'in list:', tasklistId);

    // First, get the current task to check its status
    const currentTask = await makeGoogleTasksRequest(
      `${GOOGLE_TASKS_API_BASE}/lists/${tasklistId}/tasks/${taskId}`,
      {},
      accessToken
    );

    // Toggle the status
    const newStatus = currentTask.status === 'completed' ? 'needsAction' : 'completed';
    const taskData = {
      id: taskId,
      status: newStatus,
    };

    // If completing the task, set completion time
    if (newStatus === 'completed') {
      taskData.completed = new Date().toISOString();
    } else {
      // If uncompleting the task, remove completion time
      taskData.completed = null;
    }

    const data = await makeGoogleTasksRequest(
      `${GOOGLE_TASKS_API_BASE}/lists/${tasklistId}/tasks/${taskId}`,
      {
        method: 'PUT',
        body: JSON.stringify(taskData),
      },
      accessToken
    );

    return NextResponse.json({
      success: true,
      data: {
        task: data,
        message: `Task marked as ${newStatus === 'completed' ? 'completed' : 'pending'}`
      }
    });
  } catch (error) {
    console.error('PATCH /api/gtasks/[tasklistId]/[taskId]/toggle error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to toggle task completion' },
      { status: 500 }
    );
  }
}
