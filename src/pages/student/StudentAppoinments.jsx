import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Clock3,
  XCircle,
  Stethoscope,
  CalendarCheck,
} from "lucide-react";

export default function StudentAppointments({ studentId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const appointmentsRef = collection(db, "Appointments");
    const q = query(
      appointmentsRef,
      where("st_id", "==", studentId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(appointmentsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock3,
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        label: "Pending",
      },
      approved: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-700 border-green-200",
        label: "Approved",
      },
      rejected: {
        icon: XCircle,
        color: "bg-red-100 text-red-700 border-red-200",
        label: "Rejected",
      },
      completed: {
        icon: CalendarCheck,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        label: "Completed",
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Calendar className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-lg font-medium">No Appointments</p>
        <p className="text-sm text-gray-400 mt-1">
          Your appointment requests will appear here
        </p>
      </div>
    );
  }

  const pendingAppointments = appointments.filter((a) => a.Approved === false);
  const approvedAppointments = appointments.filter((a) => a.Approved === true);
  const otherAppointments = appointments.filter(
    (a) => a.Approved !== false && a.Approved !== true
  );

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      <div className="space-y-6 p-4">
        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock3 className="w-4 h-4 text-yellow-600" />
              <h3 className="font-semibold text-sm text-gray-700">
                Pending Requests
              </h3>
              <Badge variant="secondary" className="ml-auto">
                {pendingAppointments.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {pendingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  getStatusConfig={getStatusConfig}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Approved Appointments */}
        {approvedAppointments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-sm text-gray-700">
                Approved Appointments
              </h3>
              <Badge variant="secondary" className="ml-auto">
                {approvedAppointments.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {approvedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  getStatusConfig={getStatusConfig}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Appointments */}
        {otherAppointments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-sm text-gray-700">
                Past Appointments
              </h3>
            </div>
            <div className="space-y-3">
              {otherAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  getStatusConfig={getStatusConfig}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, getStatusConfig, formatDate, formatTime }) {
  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10 border-2 border-gray-100">
            <AvatarImage
              src={
                appointment.doctorAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  appointment.doctorName || "Doctor"
                )}`
              }
            />
            <AvatarFallback className="bg-gray-100">
              <Stethoscope className="w-5 h-5 text-gray-600" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {appointment.doctorName || "Doctor"}
            </p>
            <p className="text-xs text-gray-500">
              {appointment.specialization || "General Consultation"}
            </p>
          </div>
        </div>
        <Badge className={`${statusConfig.color} border flex items-center gap-1 px-2 py-1`}>
          <StatusIcon className="w-3 h-3" />
          <span className="text-xs font-medium">{statusConfig.label}</span>
        </Badge>
      </div>

      {/* Date & Time */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{formatDate(appointment.created)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{formatTime(appointment.created) || "Time TBD"}</span>
        </div>
      </div>

      {/* Reason */}
      {appointment.reason && (
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Reason for Visit</p>
          <p className="text-sm text-gray-700">{appointment.reason}</p>
        </div>
      )}

      {/* Doctor's Note (if approved) */}
      {appointment.status === "approved" && appointment.doctorNote && (
        <div className="mt-3 bg-green-50 rounded-md p-3 border border-green-100">
          <p className="text-xs font-medium text-green-700 mb-1">Doctor's Note</p>
          <p className="text-sm text-green-900">{appointment.doctorNote}</p>
        </div>
      )}

      {/* Rejection Note (if rejected) */}
      {appointment.status === "rejected" && appointment.rejectionReason && (
        <div className="mt-3 bg-red-50 rounded-md p-3 border border-red-100">
          <p className="text-xs font-medium text-red-700 mb-1">Reason for Rejection</p>
          <p className="text-sm text-red-900">{appointment.rejectionReason}</p>
        </div>
      )}

      {/* Request Date */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Requested on {formatDate(appointment.createdAt)} at{" "}
          {formatTime(appointment.createdAt)}
        </p>
      </div>
    </div>
  );
}