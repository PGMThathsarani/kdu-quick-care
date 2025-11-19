import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, User, FileText, AlertCircle } from 'lucide-react';

export default function Appointments({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (!doctorId) return;

    const appointmentsRef = collection(db, 'Appointments');
    const q = query(
      appointmentsRef,
      where('dr_id', '==', doctorId),
      where('Approved', '==', filter === 'approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(list);
    }, (error) => {
      console.error('Error fetching appointments:', error);
    });

    return () => unsubscribe();
  }, [doctorId, filter]);

  const handleApproval = async (appointmentId, status) => {
    try {
      const appointmentRef = doc(db, 'Appointments', appointmentId);
      await updateDoc(appointmentRef, { Approved: status });
      alert(`Appointment ${status ? 'approved' : 'rejected'}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const approveAppointment = (appointmentId) => {
    handleApproval(appointmentId, true);
  };

  const rejectAppointment = (appointmentId) => {
    handleApproval(appointmentId, false);
  };

  function formatDate(timestamp) {
    if (!timestamp) return '';
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(timestamp);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
              <p className="text-xs text-gray-500">Manage your patient appointments</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Pending
            </Button>
            <Button 
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approved
            </Button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No {filter} appointments found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === 'pending' 
                ? 'New appointment requests will appear here' 
                : 'Approved appointments will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Patient Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.st_name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(appointment.AppointmentDate)}
                        </p>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-2 ml-15">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {appointment.Title}
                          </p>
                          {appointment.Description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.Description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {filter === 'pending' && (
                      <div className="flex gap-2 mt-4 ml-15">
                        <Button 
                          onClick={() => approveAppointment(appointment.id)}
                          className="gap-2 bg-black hover:bg-gray-800"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => rejectAppointment(appointment.id)}
                          className="gap-2 border-gray-300 hover:bg-gray-50"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Approved Badge */}
                    {filter === 'approved' && (
                      <div className="flex items-center gap-2 mt-4 ml-15">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approved
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}