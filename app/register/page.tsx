  'use client'

  import { useRouter } from 'next/navigation'
  import { useState } from 'react'
  import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'
  import { auth, googleProvider } from '@/app/firebase/config'
  import { upsertUser } from '@/app/firebase/userHelpers'
  import { updateProfile,signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth'
  import { toast } from 'react-toastify'
  import { FirebaseError } from 'firebase/app'

  // Map Firebase errors to friendly messages
  const friendlyError = (error: FirebaseError): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email already in use. Try signing in instead.'
      case 'auth/invalid-email':
        return 'Invalid email address.'
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.'
      case 'auth/user-not-found':
        return 'No account found with this email.'
      case 'auth/wrong-password':
        return 'Incorrect password.'
      case 'auth/cancelled-popup-request':
        return 'Sign-in cancelled. Please try again.'
      case 'auth/popup-blocked':
        return 'Popup was blocked. Please allow popups and try again.'
      default:
        return error.message || 'Something went wrong.'
    }
  }

  const AuthPage = () => {
    const router = useRouter()

    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [position, setPosition] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth)

    const handleToggle = () => {
      setIsSignUp(!isSignUp)
      setError('')
      setPassword('')
      setConfirmPassword('')
    }

    // ✅ Sign Up Flow
    const handleSignUp = async (): Promise<void> => {
      setError('')
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(email, password)
        if (!userCredential || !userCredential.user) return

        // update displayName
        await updateProfile(userCredential.user, { displayName: name })

        // save user in Firestore (with phone & position)
        await upsertUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: name,
        })

        toast.success('Account created 🎉')
        router.push('/')
      } catch (err) {
        const fbErr = err as FirebaseError
        console.error(fbErr)
        setError(friendlyError(fbErr))
      }
    }

    // ✅ Sign In Flow
    const handleSignIn = async (): Promise<void> => {
      setError('')
      try {
        const res = await signInWithEmailAndPassword(auth, email, password)
        if (res && res.user) {
          await upsertUser({
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: res.user.displayName || '',
          })
        }
        toast.success('Signed in ✅')
        router.push('/')
      } catch (err) {
        const fbErr = err as FirebaseError
        console.error(fbErr)
        setError(friendlyError(fbErr))
      }
    }

    // ✅ Google Sign-In
    const handleGoogleSignIn = async (): Promise<void> => {
      setError('')
      try {
        const provider = new GoogleAuthProvider()
        const res = await signInWithPopup(auth, provider)
        if (res.user) {
          await upsertUser({
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: res.user.displayName || '',
          })
        }
        toast.success('Signed in with Google ✅')
        router.push('/')
      } catch (err) {
        const fbErr = err as FirebaseError
        console.error(fbErr)
        setError(friendlyError(fbErr))
      }
    }

    const handleSubmit = (e: React.FormEvent): void => {
      e.preventDefault()
      if (isSignUp) {
        handleSignUp()
      } else {
        handleSignIn()
      }
    }

    const handlePhone = (phone: string): boolean => {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/ // E.164 format
      return phoneRegex.test(phone)
    }

    const canSubmit = isSignUp
      ? email && password && confirmPassword && name && phone && position && handlePhone(phone)
      : email && password

    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 relative py-12">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 blur-3xl"></div>
        </div>

        <div className="w-full max-w-md p-8 bg-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Musealum</h1>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              {isSignUp ? '✨ Join Us' : '🔐 Welcome Back'}
            </h2>
            <p className="text-gray-400 text-sm">Discover and share cultural artifacts</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={position === 'Institution'}
                      onChange={(e) => setPosition(e.target.checked ? 'Institution' : '')}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-gray-300 font-medium">Register as Institution</span>
                  </label>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    required
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                required
              />
            </div>

            {/* Confirm Password */}
            {isSignUp && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  required
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit as unknown as boolean}
              className="w-full mt-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSignUp ? '✨ Create Account' : '🔓 Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition border border-gray-600 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Toggle Auth Type */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={handleToggle}
                className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  export default AuthPage
