import React, { useState, useEffect } from 'react';
import Header from './components/Header';
const AdminDashboard = () => {
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('teachers');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const [teacherResponse, studentResponse] = await Promise.all([
        fetch('http://localhost:4000/admin/teacherRequests'),
        fetch('http://localhost:4000/admin/studentRequests')
      ]);

      const teacherData = await teacherResponse.json();
      const studentData = await studentResponse.json();

      setTeacherRequests(teacherData);
      setStudentRequests(studentData);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch requests');
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const updateStatus = async (id, type, status) => {
    
    try {
      const response = await fetch(`http://localhost:4000/admin/updateRequests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status })
      });

      if (response.ok) {
        fetchRequests();// Refresh the list after the status update
      } else {
        console.error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <>
    <Header />
    <div className="container mx-auto my-48 px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-1/2 py-4 text-center font-medium ${
                activeTab === 'teachers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Teacher Requests
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-1/2 py-4 text-center font-medium ${
                activeTab === 'students'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Student Requests
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'teachers' && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Name</th>
                   <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherRequests.map((teacher) => (
                  <tr key={teacher._id} className="border-b">
                    <td className="p-3">{teacher.firstName} {teacher.lastName}</td>
                    <td className="p-3">{teacher.email}</td>
                    <td className="p-3">{teacher.status}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => updateStatus(teacher._id, 'teacher', 'accepted')}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(teacher._id, 'teacher', 'declined')}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'students' && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentRequests.map((student) => (
                  <tr key={student._id} className="border-b">
                    <td className="p-3">{student.fullname}</td>
                    <td className="p-3">{student.email}</td>
                    <td className="p-3">{student.status}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => updateStatus(student._id, 'student', 'accepted')}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(student._id, 'student', 'declined')}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
