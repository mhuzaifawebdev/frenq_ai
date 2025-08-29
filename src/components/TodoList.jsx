'use client'

import React, { useEffect, useState } from 'react';
import {ListTodo, Plus,Search,Check,X,Edit3,Calendar,Trash2,ChevronDown,ChevronRight,CheckCircle,AlertCircle,Clock,User,ArrowLeft,Minimize2,Maximize2,RefreshCw,Pin,Filter,ArrowUpDown} from 'lucide-react';
import { AuthService, useAuth } from '../lib/auth';
import { config } from '../lib/config';

const GoogleTasksWidget = () => {
  // Use auth hook
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  // API utility function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/gtasks${endpoint}`, {
        ...options,
        headers: {
          ...AuthService.getAuthHeader(),
          'Content-Type': 'application/json',
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
  };

  // Loading and messages
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState(null); 
  const [togglingTasks, setTogglingTasks] = useState(new Set());
  const [loadingTaskLists, setLoadingTaskLists] = useState(false);

  // UI state
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExpandedTaskForm, setShowExpandedTaskForm] = useState(false);
  const [showTaskListDropdown, setShowTaskListDropdown] = useState(false);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Task Lists states
  const [taskLists, setTaskLists] = useState([]);
  const [selectedTaskList, setSelectedTaskList] = useState('@default');

  // Tasks states
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Filters and sorting
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('updated');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    notes: '',
    due: '',
    parent: ''
  });

  const [editForm, setEditForm] = useState({
    title: '',
    notes: '',
    due: ''
  });

  // Initialize component
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTaskLists();
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-dropdown-root')) {
        setShowFilterDropdown(false);
      }
      
      // Enhanced logic for task list dropdown
      const isInsideDropdown = e.target.closest('.tasklist-dropdown-root');
      console.log('Click outside handler:', { isInsideDropdown: !!isInsideDropdown, target: e.target }); // Debug log
      
      if (!isInsideDropdown) {
        console.log('Closing dropdown from outside click'); // Debug log
        // Use setTimeout to avoid state conflicts
        setTimeout(() => {
          setShowTaskListDropdown(false);
          setShowCreateListForm(false);
        }, 0);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAuthenticated, authLoading]);

  // Fetch tasks when authentication is ready and we have task lists
  useEffect(() => {
    if (isAuthenticated && taskLists.length > 0 && selectedTaskList) {
      fetchTasks(selectedTaskList);
    }
  }, [isAuthenticated, taskLists.length, selectedTaskList]);

  // Apply filters when tasks or filter criteria change
  useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Sort tasks
    filtered = getSortedTasks(filtered);

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, filterStatus, sortBy, sortOrder]);

  // Utility functions
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh both task lists and tasks in parallel for better performance
      await Promise.all([
        fetchTaskLists(),
        fetchTasks(selectedTaskList)
      ]);
      showMessage('success', 'Refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      showMessage('error', 'Failed to refresh');
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Task Lists API
  const fetchTaskLists = async () => {
    if (!isAuthenticated) return;
    
    setLoadingTaskLists(true);
    try {
      const data = await apiCall('/lists');
      setTaskLists(data.data.taskLists || []);
    } catch (error) {
      console.error('Fetch task lists error:', error);
      showMessage('error', error.message);
    } finally {
      setLoadingTaskLists(false);
    }
  };

  const createTaskList = async () => {
    if (!isAuthenticated || !newListTitle.trim()) {
      showMessage('error', 'Please enter a list title');
      return;
    }
    
    setLoadingTaskLists(true);
    try {
      const data = await apiCall('/lists', {
        method: 'POST',
        body: JSON.stringify({ title: newListTitle.trim() }),
      });
      
      const newList = data.data.taskList;
      showMessage('success', `List "${newList.title}" created successfully`);
      setNewListTitle('');
      setShowCreateListForm(false);
      
      // Refresh task lists and select the new one
      await fetchTaskLists();
      setSelectedTaskList(newList.id);
    } catch (error) {
      console.error('Create task list error:', error);
      showMessage('error', error.message);
    } finally {
      setLoadingTaskLists(false);
    }
  };

  const switchTaskList = async (taskListId) => {
    if (taskListId !== selectedTaskList) {
      setSelectedTaskList(taskListId);
      setShowTaskListDropdown(false);
      // fetchTasks will be called by useEffect when selectedTaskList changes
    }
  };

  // Tasks API
  const fetchTasks = async (tasklistId = selectedTaskList) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      console.log('Fetching tasks from list:', tasklistId);
      
      const params = new URLSearchParams({
        maxResults: '100',
        showCompleted: 'true',
        showHidden: 'true'
      });
      
      const data = await apiCall(`/${tasklistId}?${params.toString()}`);
      const allTasks = data.data.tasks || [];
      
      setTasks(allTasks);
      setSelectedTaskList(tasklistId);
      showMessage('success', `Loaded ${allTasks.length} tasks`);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!isAuthenticated || !taskForm.title.trim()) {
      showMessage('error', 'Please enter a task title');
      return;
    }
    
    setLoading(true);
    try {
      const taskData = {
        title: taskForm.title.trim(),
      };

      if (taskForm.notes.trim()) {
        taskData.notes = taskForm.notes.trim();
      }

      if (taskForm.due) {
        taskData.due = new Date(taskForm.due).toISOString();
      }

      if (taskForm.parent) {
        taskData.parent = taskForm.parent;
      }

      await apiCall(`/${selectedTaskList}`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      
      showMessage('success', 'Task created successfully');
      setTaskForm({ title: '', notes: '', due: '', parent: '' });
      setShowExpandedTaskForm(false);
      fetchTasks(selectedTaskList);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    if (!isAuthenticated || togglingTasks.has(taskId)) return;
    
    // Add task to toggling set
    setTogglingTasks(prev => new Set(prev).add(taskId));
    
    try {
      await apiCall(`/${selectedTaskList}/${taskId}/toggle`, {
        method: 'PATCH',
      });
      fetchTasks(selectedTaskList);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      // Remove task from toggling set
      setTogglingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const deleteTask = async (taskId) => {
    if (!isAuthenticated || !confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    try {
      await apiCall(`/${selectedTaskList}/${taskId}`, {
        method: 'DELETE',
      });
      showMessage('success', 'Task deleted successfully');
      fetchTasks(selectedTaskList);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, updateData) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      await apiCall(`/${selectedTaskList}/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      showMessage('success', 'Task updated successfully');
      setEditingTask(null);
      fetchTasks(selectedTaskList);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // UI Helper functions
  const getSortedTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'due': {
          const aDate = a.due ? new Date(a.due).getTime() : Infinity;
          const bDate = b.due ? new Date(b.due).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        }
        case 'updated':
        default: {
          const aDate = new Date(a.updated).getTime();
          const bDate = new Date(b.updated).getTime();
          comparison = aDate - bDate;
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const getSelectedTaskListTitle = () => {
    if (selectedTaskList === '@default') return 'My Tasks';
    const list = taskLists.find(list => list.id === selectedTaskList);
    return list ? list.title : 'Unknown List';
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      notes: task.notes || '',
      due: task.due ? new Date(task.due).toISOString().slice(0, 16) : ''
    });
  };

  const saveEdit = () => {
    if (!editForm.title.trim()) {
      showMessage('error', 'Task title cannot be empty');
      return;
    }

    const updateData = {
      title: editForm.title.trim(),
      notes: editForm.notes.trim()
    };

    if (editForm.due) {
      updateData.due = new Date(editForm.due).toISOString();
    } else {
      updateData.due = null;
    }

    updateTask(editingTask, updateData);
  };

  const toggleTaskExpansion = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const stats = getTaskStats();

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl p-6 text-center">
        <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-white font-medium mb-2">Google Tasks</h3>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl p-6 text-center">
        <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-white font-medium mb-2">Google Tasks</h3>
        <p className="text-gray-400 text-sm mb-4">Please login to access your tasks</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
          Login Required
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c1c]/50 backdrop-blur-md border border-gray-700/30 rounded-2xl hover:bg-[#1c1c1c]/30 transition-all duration-300 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-medium flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          Google Tasks
        </h2>

        {/* Search Bar - Only show when not minimized */}
        {!isMinimized && (
          <div className="relative flex-1 mx-3 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors"
            title="Refresh lists and tasks"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Debug button for completed tasks */}
          {/* <button
            onClick={testCompletedTasksAPI}
            className="p-2 bg-green-800/50 hover:bg-green-700 rounded-full transition-colors"
            title="Test Completed Tasks API"
          >
            <Check className="w-4 h-4 text-green-400" />
          </button> */}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-800/30 rounded transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? 
              <Maximize2 className="w-4 h-4 text-gray-400" /> : 
              <Minimize2 className="w-4 h-4 text-gray-400" />
            }
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-md mb-4 text-sm ${
          message.type === 'success' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Main Content - Hide when minimized */}
      {!isMinimized && (
        <>
          {/* Task List Selector and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {/* Task List Dropdown */}
              <div className="relative tasklist-dropdown-root">
                <button
                  onClick={() => setShowTaskListDropdown(!showTaskListDropdown)}
                  className="flex items-center gap-2 text-white text-sm bg-gray-800/50 px-3 py-2 rounded-lg hover:bg-gray-800/70 transition-colors min-w-[150px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4" />
                    <span className="truncate">{getSelectedTaskListTitle()}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTaskListDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTaskListDropdown && (
                  <div 
                    className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 min-w-[200px] max-w-[300px]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Current Lists */}
                    <div className="max-h-[200px] overflow-y-auto">
                      {taskLists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => switchTaskList(list.id)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                            selectedTaskList === list.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                          }`}
                        >
                          <ListTodo className="w-3 h-3" />
                          <span className="truncate">{list.title}</span>
                          {selectedTaskList === list.id && <Check className="w-3 h-3 text-green-400 ml-auto" />}
                        </button>
                      ))}
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-gray-600 my-1"></div>
                    
                    {/* Create New List */}
                    {!showCreateListForm ? (
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Create New List button clicked'); // Debug log
                          setShowCreateListForm(true);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        Create New List
                      </button>
                    ) : (
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && createTaskList()}
                          placeholder="List name"
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={createTaskList}
                            disabled={loadingTaskLists || !newListTitle.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            {loadingTaskLists ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Create
                          </button>
                          <button
                            onClick={() => {
                              setShowCreateListForm(false);
                              setNewListTitle('');
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                <User className="w-3 h-3" />
                {user?.name}
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-3 text-xs">
              <span className="text-gray-400">{stats.total} total</span>
              <span className="text-green-400">{stats.completed} completed</span>
              <span className="text-blue-400">{stats.pending} pending</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Filters */}
              <div className="relative filter-dropdown-root">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 text-white text-sm bg-gray-800/50 px-3 py-1 rounded hover:bg-gray-800/70 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>{filterStatus === 'all' ? 'All' : filterStatus === 'needsAction' ? 'Pending' : 'Completed'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 min-w-[120px]">
                    {[
                      { value: 'all', label: 'All Tasks' },
                      { value: 'needsAction', label: 'Pending' },
                      { value: 'completed', label: 'Completed' }
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setFilterStatus(filter.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          filterStatus === filter.value ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-gray-800/30 rounded transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className={`w-4 h-4 text-gray-400 transition-transform ${
                  sortOrder === 'asc' ? 'rotate-180' : ''
                }`} />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800/50 border border-gray-600/50 text-sm text-white px-2 py-1 rounded"
              >
                <option value="updated">Updated</option>
                <option value="title">Title</option>
                <option value="due">Due Date</option>
              </select>
            </div>
          </div>

          {/* Quick Add Task */}
          <div className="mb-4">
            {!showExpandedTaskForm ? (
              /* Simple Add Form */
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && createTask()}
                  onFocus={() => setShowExpandedTaskForm(true)}
                  placeholder="Add a new task..."
                  className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                />
                <button
                  onClick={() => setShowExpandedTaskForm(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-1"
                  title="Add details"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={createTask}
                  disabled={loading || !taskForm.title.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            ) : (
              /* Expanded Add Form */
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium text-sm">New Task</h4>
                  <button
                    onClick={() => {
                      setShowExpandedTaskForm(false);
                      setTaskForm({ title: '', notes: '', due: '', parent: '' });
                    }}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Task Title */}
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title *"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  autoFocus
                />
                
                {/* Task Notes */}
                <textarea
                  rows={2}
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes (optional)"
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-md px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 resize-none"
                />
                
                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={taskForm.due}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due: e.target.value }))}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {taskForm.due && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        Due: {new Date(taskForm.due).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setTaskForm(prev => ({ ...prev, due: '' }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={createTask}
                    disabled={loading || !taskForm.title.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Task
                  </button>
                  <button
                    onClick={() => {
                      setShowExpandedTaskForm(false);
                      setTaskForm({ title: '', notes: '', due: '', parent: '' });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredTasks.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                {searchQuery || filterStatus !== 'all' ? 'No matching tasks found' : 'No tasks yet'}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                  {editingTask === task.id ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                      <textarea
                        rows={2}
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={editForm.due}
                        onChange={(e) => setEditForm(prev => ({ ...prev, due: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex items-start gap-3">
                        {/* Completion Checkbox */}
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          disabled={togglingTasks.has(task.id)}
                          className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            togglingTasks.has(task.id)
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : task.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-500 hover:border-green-500'
                          } ${togglingTasks.has(task.id) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {togglingTasks.has(task.id) ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            task.status === 'completed' && <Check className="w-3 h-3" />
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium text-sm ${
                              task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                            }`}>
                              {task.title}
                            </h4>
                            
                            <div className="flex items-center gap-1">
                              {task.notes && (
                                <button
                                  onClick={() => toggleTaskExpansion(task.id)}
                                  className="text-gray-400 hover:text-white p-1"
                                >
                                  {expandedTasks.has(task.id) ? 
                                    <ChevronDown className="w-4 h-4" /> : 
                                    <ChevronRight className="w-4 h-4" />
                                  }
                                </button>
                              )}
                              <button
                                onClick={() => startEdit(task)}
                                className="text-blue-400 hover:text-blue-300 p-1"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Task Metadata */}
                          {(task.due || task.updated) && (
                            <div className="flex gap-3 mt-1 text-xs text-gray-500">
                              {task.due && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(task.due).toLocaleDateString()}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(task.updated).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {/* Expanded Notes */}
                          {task.notes && expandedTasks.has(task.id) && (
                            <div className="mt-2 p-2 bg-gray-900/50 rounded border border-gray-700">
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{task.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Filter Status Indicator */}
          {(filterStatus !== 'all' || searchQuery) && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              Showing {filteredTasks.length} of {tasks.length} tasks
              {filterStatus !== 'all' && ` (${filterStatus === 'needsAction' ? 'Pending' : 'Completed'})`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <span>{stats.pending} pending tasks</span>
          <span>{stats.completed} completed</span>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(156, 163, 175, 0.9);
        }
      `}</style>
    </div>
  );
};

export default GoogleTasksWidget;