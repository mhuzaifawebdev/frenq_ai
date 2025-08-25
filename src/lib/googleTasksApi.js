import { AuthService } from './auth';
import { config } from './config';

const API_BASE = config.BACKEND_URL;

/**
 * Google Tasks API Service
 * Provides clean interface for all Google Tasks operations
 */
class GoogleTasksAPI {
  /**
   * Get authentication headers
   */
  static getHeaders() {
    return {
      ...AuthService.getAuthHeader(),
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated request to API
   */
  static async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/api/gtasks${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Fetch all task lists for the authenticated user
   */
  static async getTaskLists() {
    const data = await this.makeRequest('/lists');
    return data.data.taskLists || [];
  }

  /**
   * Create a new task list
   */
  static async createTaskList(listData) {
    const data = await this.makeRequest('/lists', {
      method: 'POST',
      body: JSON.stringify(listData),
    });
    return data.data.taskList;
  }

  /**
   * Update a task list
   */
  static async updateTaskList(listId, updateData) {
    const data = await this.makeRequest(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return data.data.taskList;
  }

  /**
   * Delete a task list
   */
  static async deleteTaskList(listId) {
    await this.makeRequest(`/lists/${listId}`, {
      method: 'DELETE',
    });
    return true;
  }

  /**
   * Fetch tasks from a specific list with pagination support
   */
  static async getTasks(tasklistId, options = {}) {
    const {
      maxResults = 100,
      showCompleted = true,
      showHidden = true,
      pageToken = null,
    } = options;

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      showCompleted: showCompleted.toString(),
      showHidden: showHidden.toString(),
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const data = await this.makeRequest(`/${tasklistId}?${params.toString()}`);
    return {
      tasks: data.data.tasks || [],
      nextPageToken: data.data.nextPageToken,
    };
  }

  /**
   * Fetch ALL tasks from a list (handles pagination automatically)
   */
  static async getAllTasks(tasklistId, options = {}) {
    let allTasks = [];
    let nextPageToken = null;
    let pageCount = 0;
    const maxPages = 50; // Prevent infinite loops

    do {
      try {
        const result = await this.getTasks(tasklistId, {
          ...options,
          pageToken: nextPageToken,
        });

        allTasks = [...allTasks, ...result.tasks];
        nextPageToken = result.nextPageToken;
        pageCount++;

        console.log(`Fetched page ${pageCount}, total tasks: ${allTasks.length}`);
      } catch (error) {
        console.error('Error fetching page:', error);
        break;
      }
    } while (nextPageToken && pageCount < maxPages && allTasks.length < 1000);

    return allTasks;
  }

  /**
   * Create a new task in the specified list
   */
  static async createTask(tasklistId, taskData) {
    const data = await this.makeRequest(`/${tasklistId}`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return data.data.task;
  }

  /**
   * Get a specific task
   */
  static async getTask(tasklistId, taskId) {
    const data = await this.makeRequest(`/${tasklistId}/${taskId}`);
    return data.data.task;
  }

  /**
   * Update a specific task
   */
  static async updateTask(tasklistId, taskId, updateData) {
    const data = await this.makeRequest(`/${tasklistId}/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return data.data.task;
  }

  /**
   * Delete a specific task
   */
  static async deleteTask(tasklistId, taskId) {
    await this.makeRequest(`/${tasklistId}/${taskId}`, {
      method: 'DELETE',
    });
    return true;
  }

  /**
   * Toggle task completion status
   */
  static async toggleTaskCompletion(tasklistId, taskId) {
    const data = await this.makeRequest(`/${tasklistId}/${taskId}/toggle`, {
      method: 'PATCH',
    });
    return data.data.task;
  }

  /**
   * Bulk operations for multiple tasks
   */
  static async bulkUpdateTasks(tasklistId, operations) {
    const results = [];
    
    for (const operation of operations) {
      try {
        let result;
        switch (operation.type) {
          case 'update':
            result = await this.updateTask(tasklistId, operation.taskId, operation.data);
            break;
          case 'delete':
            result = await this.deleteTask(tasklistId, operation.taskId);
            break;
          case 'toggle':
            result = await this.toggleTaskCompletion(tasklistId, operation.taskId);
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
        results.push({ success: true, operation, result });
      } catch (error) {
        results.push({ success: false, operation, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Search tasks across all lists (client-side filtering)
   */
  static async searchTasks(query, taskLists) {
    const allTasks = [];
    
    for (const list of taskLists) {
      try {
        const tasks = await this.getAllTasks(list.id);
        const tasksWithListInfo = tasks.map(task => ({
          ...task,
          listId: list.id,
          listTitle: list.title,
        }));
        allTasks.push(...tasksWithListInfo);
      } catch (error) {
        console.error(`Error fetching tasks from list ${list.title}:`, error);
      }
    }

    if (!query) return allTasks;

    const lowerQuery = query.toLowerCase();
    return allTasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.notes && task.notes.toLowerCase().includes(lowerQuery))
    );
  }
}

export default GoogleTasksAPI;
