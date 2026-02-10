import React, { useState } from 'react';
import { Star, MapPin, Search, Filter, ChevronLeft } from 'lucide-react';
import { MOCK_DOCTORS } from '../constants';
import { Doctor } from '../types';

interface MarketplaceProps {
  onBook: (doctor: Doctor) => void;
  onBack: () => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onBook, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  const filteredDoctors = MOCK_DOCTORS.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 pb-24 h-full overflow-y-auto">
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-20 pb-4 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 transition shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Find a Specialist</h2>
        </div>
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search doctors, specialties..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-sm text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setFilterActive(!filterActive)}
                className={`p-3 rounded-xl border transition ${filterActive ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200 text-slate-600'}`}
            >
                <Filter className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="space-y-4 mt-2">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex gap-4">
              <img src={doctor.image} alt={doctor.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{doctor.name}</h3>
                        <p className="text-teal-600 text-sm font-medium">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-bold text-yellow-700">{doctor.rating}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Online
                    </span>
                    <span>•</span>
                    <span>{doctor.reviews} reviews</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="font-bold text-slate-900">
                    ${doctor.price}<span className="text-xs font-normal text-slate-400">/session</span>
                </div>
                <button 
                    onClick={() => onBook(doctor)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition transform active:scale-95"
                    disabled={!doctor.available}
                >
                    {doctor.available ? 'Book Now' : 'Fully Booked'}
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;