import { useState, useEffect } from 'react';
import { FaSearch, FaUsers, FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
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
        <Link href="/" className="btn btn-primary flex items-center bg-[#E89A00]">
          <FaUserPlus className="mr-2" /> Add Client
        </Link>
      </div>
    </div>

      <div className="p-6 space-y-6">
        {/* Filter Input */}
        <div className="flex items-center space-x-2 bg-white p-3 shadow-md rounded-lg w-full max-w-md mx-auto">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by name..."
            className="input w-full focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-[#162C63] text-white">
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Observation</th>
              </tr>
            </thead>
            <tbody>
              {clients
                .filter((client) => client.fullName.toLowerCase().includes(search.toLowerCase()))
                .map((client, index) => (
                  <tr key={client._id}>
                    <td>{index + 1}</td>
                    <td>{client.fullName}</td>
                    <td>{client.phone}</td>
                    <td>{client.observation || 'N/A'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
