import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useUserStore } from '../../store/UserStore';
import Chat from '../common/Chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DoctorNotifications from './DoctorNotifications';
import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import Appointments from './Appointments';
import { Dialog, DialogTrigger, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { MessageSquare, Calendar, Bell, LogOut, User, Mail, Stethoscope } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, setUser } = useUserStore();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [viewAppointments, setViewAppointments] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut().then(() => {
      setUser(null);
    }).catch(err => {
      console.error('Logout failed', err);
    });
  };

  // ensure profile in store
  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    if (user && user.uid === currentUid) return;

    (async () => {
      try {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where('uid', '==', currentUid));
        const snap = await getDocs(q);
        if (!snap.empty) setUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } catch (err) {
        console.error('Error fetching doctor profile', err);
      }
    })();
  }, [setUser, user]);

  // subscribe to chats where this doctor is the participant
  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) { setChats([]); return; }

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('doctorId', '==', currentUid));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(list);
      setSelectedChatId(prev => (prev ? prev : list.length > 0 ? list[0].id : null));
    }, err => console.error('Doctor chats snapshot error', err));

    return () => unsub();
  }, [auth.currentUser?.uid]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KDU Health</h1>
                <p className="text-xs text-gray-500">Doctor Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-96">
                  <DialogTitle className="ml-5 mt-10 text-lg font-semibold mb-2 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </DialogTitle>
                  <DoctorNotifications doctorId={user?.uid} />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage 
                    src={user?.avatar || auth.currentUser?.photoURL || 'https://randomuser.me/api/portraits/men/44.jpg'} 
                    alt="doctor" 
                  />
                  <AvatarFallback className="bg-black text-white">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="font-semibold text-sm text-gray-900">{user?.firstName + ' ' + user?.lastName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {auth.currentUser?.email}
                  </div>
                </div>
              </div>

              <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="text-lg font-semibold">Confirm Logout</DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    Are you sure you want to log out of your account?
                  </DialogDescription>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)]">
          <div className="h-full flex gap-6">
            <aside className="w-80 bg-white rounded-xl shadow-sm border flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Quick Actions
                </h2>
              </div>

              <div className="p-4 space-y-2 border-b">
                <Button 
                  variant={!viewAppointments ? "default" : "outline"} 
                  onClick={() => setViewAppointments(false)}
                  className="w-full justify-start gap-3"
                >
                  <MessageSquare className="w-4 h-4" />
                  View Chats
                </Button>
                <Button 
                  variant={viewAppointments ? "default" : "outline"} 
                  onClick={() => setViewAppointments(true)}
                  className="w-full justify-start gap-3"
                >
                  <Calendar className="w-4 h-4" />
                  View Appointments
                </Button>
              </div>

              {!viewAppointments && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Active Chats
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {chats.length}
                      </span>
                    </div>
                    
                    {chats.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No active chats</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {chats.map(chat => (
                          <div 
                            key={chat.id} 
                            onClick={() => setSelectedChatId(chat.id)} 
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                              selectedChatId === chat.id 
                                ? 'bg-black text-white border-black shadow-md' 
                                : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-11 w-11 border-2 border-white/20">
                                <AvatarImage 
                                  src={chat.studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.studentName || 'Student')}`} 
                                />
                                <AvatarFallback className="bg-gray-200 text-gray-700">
                                  {(chat.studentName || 'S').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">
                                  {chat.studentName || chat.name}
                                </div>
                                <div className={`text-xs truncate mt-0.5 ${
                                  selectedChatId === chat.id ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                  {chat.lastMessage || chat.specialization || ''}
                                </div>
                              </div>
                              {chat.status && (
                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  chat.status === 'Ongoing' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {chat.status}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>

            <section className="flex-1 h-full">
              <div className="h-full bg-white rounded-xl shadow-sm border overflow-hidden">
                {viewAppointments ? (
                  <Appointments doctorId={user?.uid} />
                ) : selectedChatId ? (
                  <Chat chatId={selectedChatId} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Select a chat to view messages</p>
                    <p className="text-sm text-gray-400 mt-1">Choose a conversation from the sidebar</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}