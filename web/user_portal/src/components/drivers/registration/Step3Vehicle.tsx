import React, { useState } from 'react';
import { Search, Car, Users, AlertCircle, CheckCircle, Loader2, Upload } from 'lucide-react';

export interface VehicleData {
  searchQuery: string;
  isVehicleFound: boolean | null; // null = not searched yet
  foundVehicleInfo: any | null;
  // If not found:
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number | '';
  licensePlate: string;
  allowCoDriver: boolean;
  vehiclePhotos: string;
  logbookUrl: string;
  insuranceUrl: string;
  inspectionUrl: string;
}

interface Props {
  data: VehicleData;
  onChange: (updates: Partial<VehicleData>) => void;
  errors: Partial<Record<keyof VehicleData, string>>;
}

export const Step3Vehicle: React.FC<Props> = ({ data, onChange, errors }) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!data.searchQuery) return;
    setIsSearching(true);
    
    // Simulate API call to check if vehicle exists
    setTimeout(() => {
      setIsSearching(false);
      // Let's simulate that 'KDA' plates exist, others don't
      const plate = data.searchQuery.toUpperCase();
      if (plate.startsWith('KDA')) {
        onChange({
          isVehicleFound: true,
          foundVehicleInfo: {
            make: 'Toyota',
            model: 'Corolla',
            plate: plate,
            currentDriverCount: 1,
            ownerAllowsCoDriver: true,
          }
        });
      } else if (plate.startsWith('FULL')) {
        onChange({
          isVehicleFound: true,
          foundVehicleInfo: {
            make: 'Nissan',
            model: 'Note',
            plate: plate,
            currentDriverCount: 2,
            ownerAllowsCoDriver: true,
          }
        });
      } else if (plate.startsWith('NO')) {
        onChange({
          isVehicleFound: true,
          foundVehicleInfo: {
            make: 'Honda',
            model: 'Fit',
            plate: plate,
            currentDriverCount: 1,
            ownerAllowsCoDriver: false,
          }
        });
      }
      else {
        onChange({
          isVehicleFound: false,
          licensePlate: plate // Pre-fill the form
        });
      }
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }
    onChange({ [name]: finalValue });
  };

  const renderFoundVehicle = () => {
    const v = data.foundVehicleInfo;
    if (!v) return null;

    const isFull = v.currentDriverCount >= 2;
    const canJoin = v.ownerAllowsCoDriver && !isFull;

    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-full flex items-center justify-center text-xl">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{v.make} {v.model}</h4>
                <p className="text-gray-500 font-mono mt-1">{v.plate}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" /> {v.currentDriverCount} / 2 Drivers
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {canJoin ? (
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg flex items-start gap-3 border border-green-200 dark:border-green-800">
                <CheckCircle className="text-green-500 mt-0.5 w-5 h-5" />
                <div>
                  <h5 className="font-medium text-green-900 dark:text-green-100">Vehicle Available for Co-Driving</h5>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    The owner has permitted shift sharing. You can request to link to this vehicle.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Request Co-Driver Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg flex items-start gap-3 border border-red-200 dark:border-red-800">
                <AlertCircle className="text-red-500 mt-0.5 w-5 h-5" />
                <div>
                  <h5 className="font-medium text-red-900 dark:text-red-100">Cannot Link to Vehicle</h5>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {isFull 
                      ? "This vehicle already has the maximum allowed drivers (2)." 
                      : "The primary owner has not opted in to allow co-drivers."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNewVehicleForm = () => {
    return (
      <div className="mt-8 space-y-6 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Register New Vehicle</h4>
        <p className="text-sm text-gray-500 mb-6">This vehicle was not found in our system. Please register it below.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehicle Type *</label>
            <select
              name="vehicleType"
              value={data.vehicleType}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white ${errors.vehicleType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Select Type</option>
              <option value="car">Car (Standard/Premium)</option>
              <option value="psv">PSV (Matatu/Bus)</option>
              <option value="motorcycle">Motorcycle (Boda Boda)</option>
              <option value="tuktuk">Tuk Tuk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">License Plate *</label>
            <input
              type="text"
              name="licensePlate"
              value={data.licensePlate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Make *</label>
            <input
              type="text"
              name="vehicleMake"
              value={data.vehicleMake}
              onChange={handleInputChange}
              placeholder="e.g. Toyota"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model *</label>
            <input
              type="text"
              name="vehicleModel"
              value={data.vehicleModel}
              onChange={handleInputChange}
              placeholder="e.g. Prius"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year *</label>
              <input
                type="number"
                name="vehicleYear"
                value={data.vehicleYear}
                onChange={handleInputChange}
                placeholder="2018"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
           <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Vehicle Documents</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button type="button" className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                 <Upload className="mx-auto mb-2 text-indigo-500 w-6 h-6" />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Photos</span>
              </button>
              <button type="button" className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                 <Upload className="mx-auto mb-2 text-indigo-500 w-6 h-6" />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Logbook</span>
              </button>
              <button type="button" className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                 <Upload className="mx-auto mb-2 text-indigo-500 w-6 h-6" />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance & Inspection</span>
              </button>
           </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-lg border border-indigo-100 dark:border-indigo-800 mt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="allowCoDriver"
              checked={data.allowCoDriver}
              onChange={handleInputChange}
              className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <div>
              <span className="font-medium text-indigo-900 dark:text-indigo-100 block mb-1">Allow Co-Driver (Shift Sharing)</span>
              <span className="text-sm text-indigo-700 dark:text-indigo-300 block">
                Opt-in to allow other drivers to request to link to this vehicle and take shifts sharing it. A maximum of 2 drivers can be linked.
              </span>
            </div>
          </label>
        </div>
        
        <div className="text-sm text-gray-500 italic mt-4">
          Note: Final service category (Standard, PSV, Premium, Delivery) will strictly be determined by CABI Administration during review.
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          3. Vehicle Search & Connection
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Search for the Number Plate of the vehicle you intend to drive.
        </p>
      </div>

      <div className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-5 h-5" />
            </div>
            <input
              type="text"
              name="searchQuery"
              value={data.searchQuery}
              onChange={handleInputChange}
              placeholder="Enter Number Plate (e.g. KDA 123A)"
              className="w-full pl-11 pr-4 py-4 uppercase rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-lg tracking-wider font-semibold"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching || !data.searchQuery}
            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {isSearching ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Search'}
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
          Demo: Try searching "KDA", "FULL", "NO", or anything else.
        </div>
      </div>

      {data.isVehicleFound === true && renderFoundVehicle()}
      {data.isVehicleFound === false && renderNewVehicleForm()}

    </div>
  );
};
