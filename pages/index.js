import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaUsers, FaUserPlus } from 'react-icons/fa';

export default function AddClient() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [observation, setObservation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone, observation }),
    });

    if (res.ok) {
      alert('Client added successfully!');
      setFullName('');
      setPhone('');
      setObservation('');
    } else {
      alert('Error adding client');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Navbar */}
      <div className="navbar bg-white shadow-md rounded-b-lg p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Image src="/logo.jpg" alt="Groupe Tahraoui" width={120} height={50} className="h-12 object-contain" />
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-4">
        <Link href="/clientsAll" className="btn btn-outline flex items-center">
          <FaUsers className="mr-2" /> Clients
        </Link>
        <Link href="/" className="btn btn-primary flex items-center ">
          <FaUserPlus className="mr-2" /> Add Client
        </Link>
        <Link href="/createP" className="btn btn-primary flex items-center bg-[#E89A00]">
          <FaUserPlus className="mr-2" /> Create Proforma
        </Link>
      </div>
    </div>

      {/* Form Container */}
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md mt-10">
        <h1 className="text-xl font-bold mb-6 text-center text-blue-700">Add Client</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input input-bordered w-full border-blue-500 focus:border-orange-500"
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input input-bordered w-full border-blue-500 focus:border-orange-500"
            required
          />
          <textarea
            placeholder="Observation "
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="textarea textarea-bordered w-full border-blue-500 focus:border-orange-500"
          />
          <button type="submit" className="btn w-full bg-[#162C63] text-white hover:">Add Client</button>
        </form>
      </div>
    </div>
  );
}