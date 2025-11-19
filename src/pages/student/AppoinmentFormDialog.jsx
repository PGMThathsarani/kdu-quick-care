import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { ChevronDownIcon } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { se } from 'date-fns/locale';

export default function AppoinmentFormDialog({ studentId, studentName, doctorId, doctorName }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newAppointment = {
        Title: title,
        Description: description,
        AppointmentDate: appointmentDate,
        Approved: false,
        created: serverTimestamp(),
        st_id: studentId,
        st_name: studentName,
        dr_id: doctorId,
        dr_name: doctorName,
    };
    await addDoc(collection(db, 'Appointments'), newAppointment);

    const newNotification = {
      doctorId: doctorId,
      message: `Student ${studentName} has requested an appointment.`,
      read: false,
      studentAvatar: "", // You can add avatar URL if available
      studentId: studentId,
      studentName: studentName,
      tag: "#ent-specialist", // Adjust or make dynamic if needed
      timestamp: serverTimestamp(),
      type: "doctor-notify",
    };

    await addDoc(collection(db, 'notifications'), newNotification);

    //   alert('Appointment created successfully!');
      setTitle('');
      setDescription('');
      setAppointmentDate(null);
      setDialogOpen(false); // Close dialog after successful submission
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment.');
    } finally {
      setLoading(false);
      setConfirmationOpen(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className={'cursor-pointer'}>Request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details below to create an appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <strong>Student:</strong> {studentName}
            </div>
            <div className="text-sm">
              <strong>Doctor:</strong> {doctorName}
            </div>
          </div>
          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              Appointment Date
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                  disabled={loading}
                >
                  {appointmentDate ? appointmentDate.toLocaleDateString() : 'Select date'}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setAppointmentDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={loading}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            variant="default"
            onClick={() => setConfirmationOpen(true)}
            disabled={loading || !title || !description || !appointmentDate}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>

      {confirmationOpen && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this appointment?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center flex-row justify-end gap-4">
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={loading}
            >
              Confirm
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConfirmationOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}