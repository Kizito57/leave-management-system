import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '../../lib/axios';

export default function LeaveTypeManagement() {
  // Form management and state initialization
  const { register, handleSubmit, reset, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [editingLeaveType, setEditingLeaveType] = useState(null);

  // Fetch leave types on component mount
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Fetch leave types from the server
  const fetchLeaveTypes = async () => {
    try {
      const response = await api.get('/api/leave-types');
      setLeaveTypes(response.data.leave_types);
    } catch (error) {
      toast.error('Unable to retrieve leave types. Please try again.');
    }
  };

  // Handle form submission for creating or updating leave types
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      if (editingLeaveType) {
        // Update existing leave type
        await api.put(`/api/admin/leave-types/${editingLeaveType.id}`, data);
        toast.success('Leave type updated successfully');
        setEditingLeaveType(null);
      } else {
        // Create new leave type
        await api.post('/api/admin/leave-types', data);
        toast.success('Leave type created successfully');
      }

      reset();
      fetchLeaveTypes();
    } catch (error) {
      toast.error('Operation failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare leave type for editing
  const handleEdit = (leaveType) => {
    setEditingLeaveType(leaveType);
    setValue('name', leaveType.name);
    setValue('description', leaveType.description || '');
  };

  // Delete a leave type
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/leave-types/${id}`);
      toast.success('Leave type deleted successfully');
      fetchLeaveTypes();
    } catch (error) {
      toast.error('Failed to delete leave type');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Leave Type Creation/Editing Form */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {editingLeaveType ? 'Edit Leave Type' : 'Create Leave Type'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g., Sick Leave, Vacation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
              rows={3}
              placeholder="Provide a brief description of the leave type"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              {editingLeaveType ? 'Update Leave Type' : 'Create Leave Type'}
            </button>
            {editingLeaveType && (
              <button
                type="button"
                onClick={() => {
                  setEditingLeaveType(null);
                  reset();
                }}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Leave Types Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Existing Leave Types
        </h2>
        {leaveTypes.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No leave types have been created yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((leaveType) => (
                  <tr 
                    key={leaveType.id} 
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 font-medium">{leaveType.name}</td>
                    <td className="px-6 py-4">{leaveType.description || 'No description'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(leaveType)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(leaveType.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}