import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useUserStore } from '../../store/UserStore';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import authBgIMg from '../../assets/auth_back.jpg';

const getUserData = async (uid) => {
  try {
    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log('No user found with UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const Login = () => {
  const { user, setUser, clearUser } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const uid = auth.currentUser.uid;
      let userData = await getUserData(uid);

      if (!userData) {
        try {
          const usersRef = collection(db, 'Users');
          const newDocRef = await addDoc(usersRef, {
            uid,
            email: auth.currentUser.email || email,
            role: 'student',
            createdAt: serverTimestamp(),
          });
          userData = { id: newDocRef.id, uid, email: auth.currentUser.email || email, role: 'student' };
          console.log('Created fallback user document for UID:', uid);
        } catch (createErr) {
          console.error('Failed to create fallback user document:', createErr);
        }
      }

      if (userData) setUser(userData);

      const role = userData?.role || 'student';
      if (role === 'doctor') navigate('/doctor');
      else navigate('/student');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${authBgIMg})` }}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">Sign In</h1>
        <form className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <Input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              id="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-800 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <Button type="submit" onClick={handleLogin} className="w-full">
            Login
          </Button>
        </form>
        <p className="text-center text-gray-500 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-blue-800 hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
