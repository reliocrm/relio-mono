"use client"

import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from '@/components/logo'
import { authClient } from '@/lib/auth-client'
import { useTheme as useNextTheme } from 'next-themes'

function getYear() {
	return new Date().getFullYear()
}

// Wrapper hook to adapt next-themes API to ThemeToggle's expected interface
function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();
  
  const toggleTheme = (_coords?: { x: number; y: number }) => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return {
    resolvedTheme: (resolvedTheme ?? "dark") as "dark" | "light",
    toggleTheme,
  };
}

export default function RootLayout({ 
  auth = false,
  children
}: { 
  auth?: boolean,
  children: React.ReactNode 
}) {
  const navigate = useNavigate();

  return (
    <div id='auth-layout-container' className='flex flex-col justify-between items-center w-screen h-screen p-6 bg-gradient-to-b from-muted to-background '>
      <div id='logo' className='block cursor-pointer' onClick={() => navigate({ to: '/' })}>
        <Logo />
      </div>
      <div className='w-[350px] md:w-[500px] flex justify-center items-center'>
        {children}
      </div>
      <div id='auth-footer-container' className='flex flex-col items-center p-3'>
        {!auth ? (
          <>
            <div id='auth-footer' className='flex flex-row items-center justify-center'>
              <p className='text-xs text-gray-500'>Copyright ©{getYear()} Relio</p>
              <ThemeToggle useTheme={useTheme} />
            </div>
            <p className='text-xs text-gray-500'>By proceeding you acknowledge that you have read, understood and agree to our <a href="http://reliocrm.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="link hover:underline">Terms of Service.</a></p>
          </>
        ) : (
          <div id='auth-footer' className='flex flex-col items-center justify-center space-y-1'>
            <a 
              onClick={async () => {
                try {
                  await authClient.signOut();
                  navigate({ to: "/login" });
                } catch (error) {
                  console.error("Sign out error:", error);
                  // Still navigate even if sign out fails
                  navigate({ to: "/login" });
                }
              }}
              className='text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
            >
              Sign out
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

