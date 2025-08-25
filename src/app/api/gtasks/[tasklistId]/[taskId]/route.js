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

// GET - Get specific task details
export async function GET(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    const { tasklistId, taskId } = params;

    console.log('Fetching task:', taskId, 'from list:', tasklistId);

    const data = await makeGoogleTasksRequest(
      `${GOOGLE_TASKS_API_BASE}/lists/${tasklistId}/tasks/${taskId}`,
      {},
      accessToken
    );

    return NextResponse.json({
      success: true,
      data: {
        task: data
      }
    });
  } catch (error) {
    console.error('GET /api/gtasks/[tasklistId]/[taskId] error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT - Update specific task
export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    const { tasklistId, taskId } = params;

    // Get request body
    const body = await request.json();
    console.log('Updating task:', taskId, 'in list:', tasklistId, 'with data:', body);

    // Prepare task data for Google Tasks API
    const taskData = {
      id: taskId,
    };

    if (body.title !== undefined) {
      taskData.title = body.title;
    }

    if (body.notes !== undefined) {
      taskData.notes = body.notes;
    }

    if (body.due !== undefined) {
      taskData.due = body.due;
    }

    if (body.status !== undefined) {
      taskData.status = body.status;
    }

    if (body.completed !== undefined) {
      taskData.completed = body.completed;
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
        task: data
      },
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('PUT /api/gtasks/[tasklistId]/[taskId] error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific task
export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    const accessToken = await getUserGoogleToken(user.id);

    const { tasklistId, taskId } = params;

    console.log('Deleting task:', taskId, 'from list:', tasklistId);

    await makeGoogleTasksRequest(
      `${GOOGLE_TASKS_API_BASE}/lists/${tasklistId}/tasks/${taskId}`,
      {
        method: 'DELETE',
      },
      accessToken
    );

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/gtasks/[tasklistId]/[taskId] error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
