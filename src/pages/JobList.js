import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import axios from 'axios';

const JobList = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Use useCallback to memoize the functions used in useEffect
  const getProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUserData(data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const getJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase.from('jobs').select('*');
      
      // If user is a hirer, only show their jobs
      if (userData && userData.user_type === 'hirer') {
        query = query.eq('user_id', user.id);
      }
      
      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (session) {
      getProfile();
      getJobs();
    }
  }, [session, getProfile, getJobs]);  // Added proper dependencies

  const createJob = async (formData) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user');

      // Create the job in Supabase
      const newJob = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        assistant_type: formData.assistantType,
        hourly_rate: formData.hourlyRate,
        time_zone: formData.timeZone,
        created_at: new Date(),
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(newJob)
        .select();

      if (error) throw error;
      
      // Send webhook to Make.com for distribution
      if (data) {
        try {
          await axios.post(process.env.REACT_APP_MAKE_WEBHOOK_URL, {
            job: data[0],
            creator: userData
          });
        } catch (webhookError) {
          console.error('Webhook failed but job was created:', webhookError);
        }
      }

      // Reset form and refresh jobs
      reset();
      setShowJobForm(false);
      getJobs();
      setMessage('Job posted successfully!');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">VA Marketplace</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/jobs" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Jobs
                </Link>
                <Link to="/account" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Account
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={signOut}
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
              {message}
            </div>
          )}
          
          {userData && userData.user_type === 'hirer' && (
            <div className="mb-6">
              {!showJobForm ? (
                <button
                  onClick={() => setShowJobForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Post New Job
                </button>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Job</h3>
                  </div>
                  <div className="border-t border-gray-200">
                    <form onSubmit={handleSubmit(createJob)} className="px-4 py-5 bg-white space-y-6 sm:p-6">
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Job Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            {...register('title', { required: true })}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                          {errors.title && <span className="text-red-500 text-xs">Job title is required</span>}
                        </div>

                        <div className="col-span-6">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Job Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            {...register('description', { required: true })}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md"
                          />
                          {errors.description && <span className="text-red-500 text-xs">Job description is required</span>}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="assistantType" className="block text-sm font-medium text-gray-700">
                            Assistant Type
                          </label>
                          <select
                            id="assistantType"
                            name="assistantType"
                            {...register('assistantType', { required: true })}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="general">General Virtual Assistant</option>
                            <option value="social-media">Social Media Manager</option>
                            <option value="content">Content Creator</option>
                            <option value="customer-service">Customer Service</option>
                            <option value="data-entry">Data Entry</option>
                            <option value="bookkeeping">Bookkeeping</option>
                            <option value="technical">Technical Assistant</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.assistantType && <span className="text-red-500 text-xs">Assistant type is required</span>}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                            Hourly Rate (starting from $5)
                          </label>
                          <input
                            type="number"
                            name="hourlyRate"
                            id="hourlyRate"
                            min="5"
                            placeholder="e.g., 15"
                            {...register('hourlyRate', { required: true, min: 5 })}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                          {errors.hourlyRate && <span className="text-red-500 text-xs">Hourly rate must be at least $5</span>}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
                            Time Zone
                          </label>
                          <input
                            type="text"
                            name="timeZone"
                            id="timeZone"
                            placeholder="e.g., UTC+1, EST"
                            {...register('timeZone', { required: true })}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                          {errors.timeZone && <span className="text-red-500 text-xs">Time zone is required</span>}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowJobForm(false)}
                          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {loading ? 'Posting...' : 'Post Job'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {userData && userData.user_type === 'hirer' ? 'Your Posted Jobs' : 'Available Jobs'}
              </h3>
              <button
                onClick={getJobs}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Refresh
              </button>
            </div>
            
            <div className="border-t border-gray-200">
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading jobs...</p>
                </div>
              ) : jobs.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <li key={job.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-indigo-600 truncate">{job.title}</h4>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ${job.hourly_rate}/hr
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {job.assistant_type}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {job.time_zone}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Posted on {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{job.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    {userData && userData.user_type === 'hirer' 
                      ? "You haven't posted any jobs yet." 
                      : "No jobs are currently available."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
