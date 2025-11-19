import React, { useEffect, useState } from "react";
import { doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/UserStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import Chat from "../common/Chat";
import StudentNotifications from "./StudentNotifications";
import AppoinmentFormDialog from "./AppoinmentFormDialog";
import StudentAppointments from "./StudentAppoinments";
import {
  Search,
  MessageSquare,
  Bell,
  User,
  Mail,
  Stethoscope,
  AlertTriangle,
  Calendar,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

export default function Student() {
  const { user, setUser, clearUser } = useUserStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    if (user && user.uid === currentUid) return;

    const fetchUserData = async () => {
      try {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("uid", "==", currentUid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() };
          setUser(userData);
          console.log("User Data:", userData);
        } else {
          console.log("No user found with UID:", currentUid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const [search, setSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [doctorsResults, setDoctorsResults] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout failed", err);
      });
  };

  const filteredChats = chats.filter(
    (chat) =>
      (chat.studentName || chat.doctorName || chat.name || "")
        .toLowerCase()
        .includes(chatSearch.toLowerCase()) ||
      (chat.specialization &&
        chat.specialization.toLowerCase().includes(chatSearch.toLowerCase()))
  );

  useEffect(() => {
    let mounted = true;
    const term = (search || "").trim().toLowerCase();
    if (!term) {
      setDoctorsResults([]);
      return;
    }

    const doSearch = async () => {
      try {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("role", "==", "doctor"));
        const snap = await getDocs(q);
        if (!mounted) return;
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const filtered = list.filter((u) => {
          const fname = (u.firstName || "").toLowerCase();
          const lname = (u.lastName || "").toLowerCase();
          const spec = (u.specialization || "").toLowerCase();
          const email = (u.email || "").toLowerCase();
          return (
            fname.includes(term) || lname.includes(term) || spec.includes(term) || email.includes(term)
          );
        });
        setDoctorsResults(filtered);
      } catch (err) {
        console.error("Doctor search error", err);
      }
    };

    doSearch();
    return () => {
      mounted = false;
    };
  }, [search]);

  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      setChats([]);
      return;
    }

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("studentId", "==", currentUid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setChats(list);
        setSelectedChatId((prev) =>
          prev ? prev : list.length > 0 ? list[0].id : null
        );
      },
      (err) => console.error("Chats snapshot error", err)
    );

    return () => unsub();
  }, [auth.currentUser?.uid]);

  const startChat = async (doctor) => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      navigate("/login");
      return;
    }

    const doctorUid = doctor.uid || doctor.id;

    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("studentId", "==", currentUid),
        where("doctorId", "==", doctorUid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const existing = snap.docs[0];
        setSelectedChatId(existing.id);
        setShowChatList(false);
        return;
      }

      const newChat = {
        createdAt: serverTimestamp(),
        studentId: currentUid,
        studentName: user?.firstName + " " + user?.lastName || "Unknown Student",
        studentAvatar: user?.avatar || auth.currentUser?.photoURL || "",
        doctorId: doctorUid,
        doctorName: doctor.firstName + " " + doctor.lastName || "Unknown Doctor",
        specialization: doctor.specialization || "",
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        status: "active",
      };

      const docRef = await addDoc(collection(db, "chats"), newChat);
      setSelectedChatId(docRef.id);
      setShowChatList(false);
    } catch (err) {
      console.error("startChat error", err);
    }
  };

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    setShowChatList(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo and Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  KDU Health
                </h1>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search doctors by name or specialization..."
                className="pl-12 pr-4 py-2.5 w-full rounded-full border-gray-300 focus-visible:ring-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchFocused && search.trim() !== "" && (
                <div className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-full mt-2 max-h-80 overflow-y-auto top-full">
                  {doctorsResults.length === 0 ? (
                    <div className="text-sm text-gray-500 p-4 text-center">
                      <Stethoscope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      No doctors found
                    </div>
                  ) : (
                    <div className="p-2">
                      {doctorsResults.map((docr) => (
                        <div
                          key={docr.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors flex items-center gap-3"
                          onClick={() => {
                            startChat(docr);
                            setSearch("");
                            setSearchFocused(false);
                          }}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={
                                docr.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  docr.name
                                )}`
                              }
                            />
                            <AvatarFallback className="bg-gray-100">
                              <User className="w-5 h-5 text-gray-600" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">
                              {docr.firstName + " " + docr.lastName || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {docr.specialization || docr.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative flex-shrink-0"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {chats.filter((chat) => chat.status === "Ongoing").length >
                      0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                        {
                          chats.filter((chat) => chat.status === "Ongoing")
                            .length
                        }
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[90vw] sm:w-96">
                  <DialogTitle className="ml-5 mt-10 text-lg font-semibold mb-2 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </DialogTitle>
                  <StudentNotifications studentId={user?.id} />
                </SheetContent>
              </Sheet>

              {/* Appointments Sheet - ADD THIS */}
<Sheet>
  <SheetTrigger asChild>
    <Button
      variant="outline"
      size="icon"
      className="relative flex-shrink-0"
    >
      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
      {/* Optional: Add a badge for pending appointments */}
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[90vw] sm:w-96">
    <DialogTitle className="ml-5 mt-10 text-lg font-semibold mb-2 flex items-center gap-2">
      <Calendar className="w-5 h-5" />
      My Appointments
    </DialogTitle>
    <StudentAppointments studentId={user?.uid} />
  </SheetContent>
</Sheet>

              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage
                    src={
                      user?.avatar ||
                      "https://randomuser.me/api/portraits/women/44.jpg"
                    }
                    alt="profile"
                  />
                  <AvatarFallback className="bg-black text-white">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="font-semibold text-sm text-gray-900">
                    {user?.firstName || ""} {user?.lastName || ""}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {auth.currentUser?.email}
                  </div>
                </div>
              </div>

              <Dialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="text-lg font-semibold">
                    Confirm Logout
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    Are you sure you want to log out of your account?
                  </DialogDescription>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setLogoutDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search doctors..."
              className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus-visible:ring-black text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {searchFocused && search.trim() !== "" && (
              <div className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-full mt-2 max-h-60 overflow-y-auto top-full">
                {doctorsResults.length === 0 ? (
                  <div className="text-sm text-gray-500 p-4 text-center">
                    <Stethoscope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No doctors found
                  </div>
                ) : (
                  <div className="p-2">
                    {doctorsResults.map((docr) => (
                      <div
                        key={docr.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => {
                          startChat(docr);
                          setSearch("");
                          setSearchFocused(false);
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              docr.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                docr.name
                              )}`
                            }
                          />
                          <AvatarFallback className="bg-gray-100">
                            <User className="w-5 h-5 text-gray-600" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm">
                            {docr.fname || ""} {docr.lname || ""}
                          </div>
                          <div className="text-xs text-gray-500">
                            {docr.specialization || docr.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Emergency Banner */}
          <div
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 cursor-pointer hover:shadow-lg hover:border-red-300 transition-all group"
            onClick={() => {
              navigate("/", { state: { scrollToAmbulance: true } });
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-lg font-bold text-red-700">
                    Emergency Medical Assistance
                  </p>
                  <p className="text-xs sm:text-sm text-red-600 mt-0.5">
                    Immediate connection to UHKDU Werahara
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex gap-4 sm:gap-6 h-[calc(100vh-220px)] sm:h-[calc(100vh-280px)]">
            {/* Sidebar - Desktop always visible, Mobile conditional */}
            <aside
              className={`${
                showChatList ? "flex" : "hidden lg:flex"
              } w-full lg:w-80 bg-white rounded-xl shadow-sm border flex-col h-full overflow-hidden`}
            >
              <div className="p-4 sm:p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    Active Chats
                  </h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredChats.length}
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Search chats..."
                  className="text-sm"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {filteredChats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No chats yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Search for a doctor to start
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                          selectedChatId === chat.id
                            ? "bg-black text-white border-black shadow-md"
                            : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-white/20 flex-shrink-0">
                              <AvatarImage
                                src={
                                  chat.studentAvatar ||
                                  chat.doctorAvatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    chat.doctorName ||
                                      chat.studentName ||
                                      "User"
                                  )}`
                                }
                              />
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {(
                                  chat.doctorName ||
                                  chat.studentName ||
                                  "U"
                                ).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-xs sm:text-sm truncate">
                                {chat.doctorName || "Unknown Doctor"}
                              </div>
                              <div
                                className={`text-[10px] sm:text-xs truncate mt-0.5 ${
                                  selectedChatId === chat.id
                                    ? "text-gray-300"
                                    : "text-gray-500"
                                }`}
                              >
                                {chat.specialization}
                              </div>
                            </div>
                          </div>
                          {chat.status && (
                            <span
                              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                                chat.status === "Ongoing"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {chat.status}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs sm:text-sm truncate ${
                            selectedChatId === chat.id
                              ? "text-gray-300"
                              : "text-gray-600"
                          }`}
                        >
                          {chat.lastMessage || chat.message || ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Chat Area - Desktop always visible, Mobile conditional */}
            <section
              className={`${!showChatList || "hidden lg:flex"} flex-1 h-full`}
            >
              <div className="h-full w-full bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
                {selectedChatId ? (
                  <>
                    {/* Back button for mobile */}
                    <div className="lg:hidden flex-shrink-0 border-b px-4 py-3 bg-gray-50 flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowChatList(true)}
                      >
                        <ArrowUpRight className="w-5 h-5 rotate-180" />
                      </Button>
                      <p className="text-sm font-medium text-gray-900">
                        Back to chats
                      </p>
                    </div>
                    <div className="hidden lg:flex flex-shrink-0 border-b px-4 sm:px-6 py-3 bg-gray-50 items-center justify-end gap-3">
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        Request an appointment
                      </p>
                      <AppoinmentFormDialog
                        studentId={user?.uid}
                        studentName={
                          (user?.firstName || "") + " " + (user?.lastName || "")
                        }
                        doctorId={
                          chats.find((c) => c.id === selectedChatId)?.doctorId
                        }
                        doctorName={
                          chats.find((c) => c.id === selectedChatId)
                            ?.doctorName || ""
                        }
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <Chat
                        chatId={selectedChatId}
                        chatName={
                          chats.find((c) => c.id === selectedChatId)
                            ?.doctorName ||
                          chats.find((c) => c.id === selectedChatId)
                            ?.studentName ||
                          chats.find((c) => c.id === selectedChatId)?.name
                        }
                      />
                    </div>
                    {/* Mobile appointment button */}
                    <div className="lg:hidden flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex items-center justify-center gap-3">
                      <AppoinmentFormDialog
                        studentId={user?.uid}
                        studentName={
                          (user?.firstName || "") + " " + (user?.lastName || "")
                        }
                        doctorId={
                          chats.find((c) => c.id === selectedChatId)?.doctorId
                        }
                        doctorName={
                          chats.find((c) => c.id === selectedChatId)
                            ?.doctorName || ""
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300" />
                    <p className="text-base sm:text-lg font-medium text-gray-500 text-center">
                      Select a chat to start conversation
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 text-center">
                      Choose from your active chats or search for a doctor
                    </p>
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
