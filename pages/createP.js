import React, { useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

import autoTable from "jspdf-autotable"; // ✅ Import the plugin
import { FaSearch, FaUsers, FaUserPlus } from "react-icons/fa";
import Image from "next/image";
const ProformaInvoice = () => {
  const [date, setDate] = useState("");
  const [client, setClient] = useState({
    name: "",
    contact: "",
    email: "",
  });

  const [counter, setCounter] = useState(1); // Starting number for counter

  const [items, setItems] = useState([
    {
      description: "Product/Service Name",
      quantity: 1,
      unitPrice: 100.0,
    },
  ]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    if (field === "unitPrice") {
      updatedItems[index].unitPrice = value;
    } else {
      updatedItems[index][field] = value;
    }

    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].montantHT = (
        updatedItems[index].quantity * updatedItems[index].unitPrice
      ).toFixed(2);
    }
    setItems(updatedItems);
  };

  const handleBlur = (index) => {
    const updatedItems = [...items];
    updatedItems[index].unitPrice = (
      updatedItems[index].unitPrice / 1.19
    ).toFixed(2);
    updatedItems[index].montantHT = (
      updatedItems[index].quantity * updatedItems[index].unitPrice
    ).toFixed(2);
    setItems(updatedItems);
  };

  const handleClientChange = (field, value) => {
    setClient({ ...client, [field]: value });
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const totalMontantHT = items
    .reduce((sum, item) => sum + parseFloat(item.montantHT), 0)
    .toFixed(2);
  const TVA = (totalMontantHT * 0.19).toFixed(2);
  const netAPayer = (parseFloat(totalMontantHT) + parseFloat(TVA)).toFixed(2);

  const [conditions, setConditions] = useState({
    delivery: "Disponible sauf vente entre temps",
    payment: "Chèque visé ou virement bancaire ou espèces",
    transport: "/",
    afterSales:
      "Disponibilité d'un service après-vente et d'un atelier de maintenance",
    validity:
      "Sept (07) Jours à compter de la date de réception de la présente proforma",
  });

  const handleConditionChange = (field, value) => {
    setConditions({ ...conditions, [field]: value });
  };
  const validateForm = () => {
    let isValid = true;
  
    if (!date) {
      toast.error("Date is required");
      isValid = false;
    }
    if (!client.name) {
      toast.error("Client name is required");
      isValid = false;
    }
    if (!client.contact) {
      toast.error("Client contact is required");
      isValid = false;
    }
    if (!client.email) {
      toast.error("Client email is required");
      isValid = false;
    }
  
    items.forEach((item, index) => {
      if (!item.description) {
        toast.error(`Item ${index + 1}: Description is required`);
        isValid = false;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Item ${index + 1}: Quantity must be greater than 0`);
        isValid = false;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        toast.error(`Item ${index + 1}: Unit price must be greater than 0`);
        isValid = false;
      }
    });
  
    return isValid;
  };








  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const proformaDocument = {
        date,
        client,
        counter,
        items,
        totals: {
          totalMontantHT,
          TVA,
          netAPayer,
        },
        conditions,
        createdAt: new Date(),
      };

      const response = await fetch("/api/saveProforma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proformaDocument),
      });

      if (!response.ok) {
        throw new Error("Failed to save proforma");
      }

      const result = await response.json();
      console.log("Proforma saved:", result);
      alert("Proforma saved successfully!");

      // Optionally increment counter after successful save
      setCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving proforma:", error);
      alert("Error saving proforma: " + error.message);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
  
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
  
    const addHeader = (doc) => {
      doc.addImage("/NEW.png", "PNG", 0, 0, pageWidth, 50, "FAST", "NONE");
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PROFORMA", pageWidth / 2, 60, { align: "center" });
    };
  
    const addClientInfo = (doc) => {
      doc.setFontSize(10);
      doc.text(`Date: ${date || "N/A"}`, margin, 55);
      doc.text(`Client Name: ${client.name || "N/A"}`, margin, 60);
      doc.text(`Contact: ${client.contact || "N/A"}`, margin, 65);
      doc.text(`Email: ${client.email || "N/A"}`, margin, 70);
    };
  
    const tableColumn = ["#", "Designation", "Quantity", "PU HT", "Montant HT"];
    const tableRows = items.map((item, index) => [
      index + 1,
      item.description || "N/A",
      item.quantity || 0,
      `${parseFloat(item.unitPrice).toFixed(2)} DA`,
      `${parseFloat(item.montantHT).toFixed(2)} DA`,
    ]);
  
    addHeader(doc);
    addClientInfo(doc);
  
    // Force all items on one page by removing autoTable pagination
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: "grid",
      styles: { 
        fontSize: 9, 
        cellPadding: 2,
        overflow: 'linebreak' // This helps with long text
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" },
      },
      pageBreak: 'avoid' // Crucial setting to prevent pagination
    });
  
    const totalsData = [
      [`Total Montant HT:`, `${totalMontantHT} DA`],
      [`TVA (19%):`, `${TVA} DA`],
      [`Net à Payer:`, `${netAPayer} DA`],
    ];
  
    autoTable(doc, {
      body: totalsData,
      startY: doc.lastAutoTable.finalY + 1,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 30, halign: "left" },
        1: { halign: "right", cellWidth: 30 },
      },
      tableWidth: 90,
      margin: { left: pageWidth - 75 },
      pageBreak: 'avoid' // Prevent pagination for totals
    });
  
    let conditionsY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(10);
    doc.text("Conditions:", margin, conditionsY);
  
    const conditionsList = [
      `Livraison: ${conditions.delivery}`,
      `Paiement: ${conditions.payment}`,
      `Transport: ${conditions.transport}`,
      `Service Après-Vente: ${conditions.afterSales}`,
      `Validité: ${conditions.validity}`,
    ];
  
    conditionsList.forEach((condition, index) => {
      doc.text(condition, margin, conditionsY + 10 + index * 6);
    });
  
    const logoWidth = 40;
    const logoHeight = 40;
    const logoX = pageWidth - logoWidth - margin;
    const logoY = pageHeight - logoHeight - 20;
  
    try {
      doc.addImage("/sg.png", "PNG", logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.warn("Logo could not be added:", error);
    }
  
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    // doc.text("SARL TAHRAOUI", logoX + logoWidth / 2, logoY + logoHeight - 10, { align: "center" });
  
    doc.save(`Proforma_Invoice_${client.name || "Unknown"}.pdf`);
  };
  
  

  return (
    <div className="container mx-auto p-6  bg-white shadow-lg rounded-lg">
      <div className="navbar bg-white shadow-md rounded-b-lg p-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.jpg"
            alt="Groupe Tahraoui"
            width={120}
            height={50}
            className="h-12 object-contain"
          />
        </div>     
        

        {/* Navigation Links */}
        <div className="flex space-x-4">
          <Link
            href="/clientsAll"
            className="btn btn-outline flex items-center"
          >
            <FaUsers className="mr-2" /> Clients
          </Link>
          <Link href="/" className="btn btn-primary flex items-center ">
            <FaUserPlus className="mr-2" /> Add Client
          </Link>
          <Link
            href="/createP"
            className="btn btn-primary flex items-center bg-[#E89A00]"
          >
            <FaUserPlus className="mr-2" /> Create Proforma
          </Link>
        </div>
      </div>
      {/* Header Section */}
      <div className="border-b pb-4 text-center mt-2">
        <img src="/logo.png" alt="Company Logo" className="mx-auto w-96 " />
      </div>

      {/* Company Info Section */}
      <div className="border-b pb-4 grid grid-cols-2 gap-4 mt-4 m-10">
        <div className="text-left">
          <h2 className="text-2xl font-bold">SARL TAHRAOUI</h2>
          <p className="text-md font-bold">au capital de 250.000.000 DA.</p>
          <p className="text-md">
            8, Avenue Hakim Saâdane 07000 Biskra – Algérie.
          </p>
          <p className="text-md font-bold">R.C N°: 07/00-0242117 B 98</p>
          <p className="text-md">
            Compte CPA Biskra N°: 004 00305.400.2306811-88
          </p>
          <p className="text-md">
            Compte BEA Biskra N°: 002 00056 560561871-42
          </p>
        </div>
        <div className="text-left">
          <p className="text-md font-bold">NIS N°: 099407010144733</p>
          <p className="text-md">NIF N°: 099807024211756</p>
          <p className="text-md">ART N°: 07010106331</p>
          <p className="text-md">
            Tel/Fax: 00.213.33.53.66.05 | 00.213.33.53.77.52
          </p>
          <p className="text-md">E-MAIL: info@groupeTahraoui.com</p>
          <p className="text-md">Email: showroom.tahraoui@gmail.com</p>
        </div>
      </div>

      {/* Client & Date Section */}
      <div className="mt-4 border-b pb-4 grid grid-cols-2 gap-4 m-10">
        {/* Left Column - Client Info */}
        <div className="text-left">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Client</legend>
            <input
              type="text"
              value={client.name}
              onChange={(e) => handleClientChange("name", e.target.value)}
              className="input w-full"
              placeholder="Enter client name"
            />
          </fieldset>

          <fieldset className="fieldset mt-2">
            <legend className="fieldset-legend">Contact</legend>
            <input
              type="text"
              value={client.contact}
              onChange={(e) => handleClientChange("contact", e.target.value)}
              className="input w-full"
              placeholder="Enter contact"
            />
          </fieldset>

          <fieldset className="fieldset mt-2">
            <legend className="fieldset-legend">Email</legend>
            <input
              type="email"
              value={client.email}
              onChange={(e) => handleClientChange("email", e.target.value)}
              className="input w-full"
              placeholder="Enter email"
            />
          </fieldset>
        </div>

        {/* Right Column - Date */}
        <div className="text-right">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Date</legend>
            <input
              type="date"
              className="input w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </fieldset>
        </div>
      </div>

      {/* Proforma Title */}

      {/* Table Section */}
      <div className="text-center text-xl font-bold mt-4">
        Proforma 2025/{counter}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto m-10">
        <table className="table table-zebra w-full">
          {/* Table Head */}
          <thead>
            <tr>
              <th>#</th>
              <th>DESIGNATION</th>
              <th>QUANTITE</th>
              <th>PU HT</th>
              <th>Montant HT</th>
              <th>Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="input input-bordered w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="input input-bordered w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "unitPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    onBlur={() => handleBlur(index)}
                    className="input input-bordered w-full"
                  />
                </td>
                <td>{item.montantHT} DA</td>
                <td>
                  <button
                    onClick={() => removeItem(index)}
                    className="btn btn-error btn-sm"
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addItem} className="mt-2 btn btn-primary">
          Add Item
        </button>
      </div>
      <div className="mt-6 flex justify-end m-10">
        <table className="table table-zebra w-auto text-right border border-gray-300">
          <tbody>
            <tr>
              <td className="p-2 font-bold">Total Montant HT:</td>
              <td className="p-2">{totalMontantHT} DA</td>
            </tr>
            <tr>
              <td className="p-2 font-bold">TVA 19%:</td>
              <td className="p-2">{TVA} DA</td>
            </tr>
            <tr className="font-bold bg-base-200">
              <td className="p-2">Net à Payer:</td>
              <td className="p-2">{netAPayer} DA</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conditions Section */}
      <div className="mt-6 border border-gray-300 p-4 rounded-md text-sm leading-relaxed m-10">
        <h2 className="font-bold underline">CONDITIONS DE L'OFFRE:</h2>

        <p>
          <strong>— Délai de Livraison :</strong>
          <input
            type="text"
            value={conditions.delivery}
            onChange={(e) => handleConditionChange("delivery", e.target.value)}
            className="input input-bordered w-full"
          />
        </p>

        <p>
          <strong>— Mode de paiement :</strong>
          <input
            type="text"
            value={conditions.payment}
            onChange={(e) => handleConditionChange("payment", e.target.value)}
            className="input input-bordered w-full"
          />
        </p>

        <p>
          <strong>— Moyen de transport :</strong>
          <input
            type="text"
            value={conditions.transport}
            onChange={(e) => handleConditionChange("transport", e.target.value)}
            className="input input-bordered w-full"
          />
        </p>

        <p>
          <strong>
            — Disponibilité d'un service après-vente et d'un atelier de
            maintenance.
          </strong>
          <input
            type="text"
            value={conditions.afterSales}
            onChange={(e) =>
              handleConditionChange("afterSales", e.target.value)
            }
            className="input input-bordered w-full"
          />
        </p>

        <p>
          <strong>— Validité de l'offre :</strong>
          <input
            type="text"
            value={conditions.validity}
            onChange={(e) => handleConditionChange("validity", e.target.value)}
            className="input input-bordered w-full"
          />
        </p>
      </div>

      <div className="flex justify-center mt-8 mb-10 gap-4">
  <button
    onClick={handleSubmit}
    className="btn btn-primary bg-[#E89A00] hover:bg-[#d18e00] text-white font-bold py-2 px-6 rounded-lg text-lg"
  >
    Save Proforma
  </button>

  <button
    onClick={() =>
      downloadPDF(client, items, totalMontantHT, TVA, netAPayer, conditions, date)
    }
    className="btn btn-primary bg-[#E89A00] hover:bg-[#d18e00] text-white font-bold py-2 px-6 rounded-lg text-lg"
  >
    Generate PDF
  </button>
</div>

    </div>
  );
};

export default ProformaInvoice;
