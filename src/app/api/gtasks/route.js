import { NextResponse } from 'next/server';

// This is the main gtasks route that provides information about available endpoints
export async function GET(request) {
  return NextResponse.json({
    success: true,
    message: 'Google Tasks API endpoints',
    endpoints: {
      'GET /api/gtasks/lists': 'Get all task lists',
      'POST /api/gtasks/lists': 'Create a new task list',
      'GET /api/gtasks/[tasklistId]': 'Get tasks from a specific list',
      'POST /api/gtasks/[tasklistId]': 'Create a new task in a specific list',
      'GET /api/gtasks/[tasklistId]/[taskId]': 'Get a specific task',
      'PUT /api/gtasks/[tasklistId]/[taskId]': 'Update a specific task',
      'DELETE /api/gtasks/[tasklistId]/[taskId]': 'Delete a specific task',
      'PATCH /api/gtasks/[tasklistId]/[taskId]/toggle': 'Toggle task completion status'
    },
    documentation: 'Use the specific endpoints above for Google Tasks operations'
  });
}
