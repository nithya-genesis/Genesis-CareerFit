import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [persona, setPersona] = useState('Placement Director');

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header persona={persona} setPersona={setPersona} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F9FAFB]">
          <Outlet context={{ persona }} />
        </main>
      </div>
    </div>
  );
}