"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContex";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const auth = useAuth() as any;
  const user = auth?.user;
  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-lg z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        
        
        <div  className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow">
            M
          </div>
          <Link href="/" className="text-xl font-semibold text-red-600">Musealum</Link>
        {user ? (
        <Link href="profile">{user.displayName}</Link>
      ):(
        <p>Guest</p>
      )}
        </div>
      
        <div className="hidden md:flex items-center gap-8 text-zinc-800 dark:text-zinc-200 font-medium">
          <Link href="/" className="hover:text-red-600 transition">Home</Link>
          <Link href="explore" className="hover:text-red-600 transition">Explore</Link>
          <Link href="events" className="hover:text-red-600 transition">Events</Link>
          {
            user ? (
              <div className="flex items-center gap-6">
                <Link href="dashboard" className="hover:text-red-600 transition">Dashboard</Link>
                <Link href="profile" className="hover:text-red-600 transition">Profile</Link>
              </div>            
            ) : (
            <Link href="register" className="hover:text-red-600 transition">Register</Link>
          )
          }
          
        </div>
      
        <button
          className="md:hidden text-zinc-800 dark:text-zinc-200"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex flex-col gap-4 text-zinc-800 dark:text-zinc-200 font-medium">
          <Link href="/" className="hover:text-red-600 transition">Home</Link>
          <Link href="explore" onClick={() => setOpen(false)} className="hover:text-red-600">Explore</Link>
          <Link href="register" onClick={() => setOpen(false)} className="hover:text-red-600">Register</Link>
          <Link href="events" onClick={() => setOpen(false)} className="hover:text-red-600">Events</Link>
        </div>
      )}
    </nav>
  );
}
