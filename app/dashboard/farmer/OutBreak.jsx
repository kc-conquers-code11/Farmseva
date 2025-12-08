import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Icon Components
const LocationIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const AlertIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const OverviewIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ShieldIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const HistoryIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CurrentIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DiseaseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const UpdateIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DangerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const DiseaseAlertsDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [currentAlerts, setCurrentAlerts] = useState([]);
  const [historicalAlerts, setHistoricalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState('current');
  const [userLocation, setUserLocation] = useState('Maharashtra');

  // Google Sheets CSV export URL
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1GYaSR_EL4c-oKNyiTyx1XOv2aI-ON8WmGJ0G491j35E/export?format=csv";

  useEffect(() => {
    fetchSheetData();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, selectedType, activeTab]);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      Papa.parse(SHEET_URL, {
        download: true,
        header: true,
        complete: (result) => {
          const data = result.data
            .filter(row => row.Type && row.DiseaseName && row.DiseaseName.trim() !== '')
            .map((row, index) => ({
              id: index + 1,
              ...row,
              // Parse locations properly
              yourLocations: row['Your Locations Effected'] ? 
                row['Your Locations Effected'].split(',').map(loc => loc.trim()).filter(loc => loc) : [],
              otherLocations: row['Other Locations Effected'] ? 
                row['Other Locations Effected'].split(',').map(loc => loc.trim()).filter(loc => loc) : [],
              // Parse preventive measures properly
              preventiveMeasures: parsePreventiveMeasures(row['Possible Preventive Measure']),
              isNearYou: row['Your Locations Effected'] && 
                row['Your Locations Effected'].toLowerCase().includes(userLocation.toLowerCase()),
              severity: getSeverityLevel(row.Type)
            }));
          
          setAlerts(data);
          
          const current = data.slice(0, 9);
          const historical = data.slice(9);
          
          setCurrentAlerts(current);
          setHistoricalAlerts(historical);
          setFilteredAlerts(current);
          setLoading(false);
        },
        error: (error) => {
          setError('Failed to fetch data from Google Sheets');
          setLoading(false);
          console.error('Error fetching data:', error);
        }
      });
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
      console.error('Error:', err);
    }
  };

  const parsePreventiveMeasures = (measuresText) => {
    if (!measuresText) return [];
    
    const measures = measuresText
      .split(/\d+\.|\n|•|--| - /)
      .map(measure => measure.replace(/[•\-]\s*/, '').trim())
      .filter(measure => measure.length > 5 && !measure.match(/^\s*$/))
      .slice(0, 8);
    
    return measures.length > 0 ? measures : ['Regular health checkups and maintain hygiene'];
  };

  const getSeverityLevel = (type) => {
    switch (type?.toLowerCase()) {
      case 'outbreak': return 4;
      case 'alert': return 3;
      case 'warning': return 2;
      case 'info': return 1;
      default: return 0;
    }
  };

  const filterAlerts = () => {
    let filtered = activeTab === 'current' ? currentAlerts : historicalAlerts;

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.DiseaseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.Locations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert['Disease Overview']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert['Your Locations Effected']?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(alert =>
        alert.Type?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredAlerts(filtered);
  };

  const openAlertDetails = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  const getSeverityColor = (type) => {
    if (!type) return 'from-gray-100 to-gray-200 text-gray-800';
    
    switch (type.toLowerCase()) {
      case 'outbreak': return 'from-red-100 to-red-200 text-red-800';
      case 'alert': return 'from-orange-100 to-orange-200 text-orange-800';
      case 'warning': return 'from-yellow-100 to-yellow-200 text-yellow-800';
      case 'info': return 'from-blue-100 to-blue-200 text-blue-800';
      default: return 'from-gray-100 to-gray-200 text-gray-800';
    }
  };

  const getSeverityGradient = (type) => {
    if (!type) return 'from-gray-500 to-gray-600';
    
    switch (type.toLowerCase()) {
      case 'outbreak': return 'from-red-500 to-red-600';
      case 'alert': return 'from-orange-500 to-orange-600';
      case 'warning': return 'from-yellow-500 to-yellow-600';
      case 'info': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const alertTypes = ['all', ...new Set(alerts.map(alert => alert.Type).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4"></div>
            </div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto absolute inset-0 m-auto"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading disease alerts...</p>
          <p className="text-gray-400 text-sm mt-2">Stay informed, stay safe</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4 animate-bounce">
            <DangerIcon className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={fetchSheetData}
            className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <header className="relative bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                <DiseaseIcon className="w-10 h-10 mr-3 text-green-600" />
                Disease Alerts & Prevention
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Real-time disease outbreak information and preventive measures
              </p>
              {userLocation && (
                <div className="flex items-center mt-2 text-sm text-green-600 font-medium">
                  <LocationIcon className="w-4 h-4 mr-2" />
                  Your Location: {userLocation}
                </div>
              )}
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString('en-IN')}</div>
              <div className="text-green-600 font-semibold">{alerts.length} Total Alerts</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-1 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-white/20">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'current'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CurrentIcon className="w-5 h-5 mr-2" />
            Current Alerts ({currentAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HistoryIcon className="w-5 h-5 mr-2" />
            History ({historicalAlerts.length})
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="relative w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20 transform hover:shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <SearchIcon className="w-5 h-5 mr-2" />
                Search Diseases & Locations
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by disease name, location, symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-green-200 focus:border-green-400 transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <SearchIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FilterIcon className="w-5 h-5 mr-2" />
                Filter by Alert Type
              </label>
              <select
                id="typeFilter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-3 focus:ring-green-200 focus:border-green-400 transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm appearance-none"
              >
                {alertTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Alert Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-white/20">
            <div className="text-3xl font-bold text-gray-900 mb-2">{alerts.length}</div>
            <div className="text-gray-600 font-medium">Total Alerts</div>
            <div className="text-green-500 text-sm mt-2">Active Monitoring</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 backdrop-blur-lg rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {alerts.filter(a => a.Type?.toLowerCase() === 'outbreak').length}
            </div>
            <div className="text-red-700 font-medium">Outbreaks</div>
            <div className="text-red-500 text-sm mt-2">High Priority</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 backdrop-blur-lg rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-orange-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {alerts.filter(a => a.Type?.toLowerCase() === 'alert').length}
            </div>
            <div className="text-orange-700 font-medium">Alerts</div>
            <div className="text-orange-500 text-sm mt-2">Medium Priority</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-lg rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {[...new Set(alerts.flatMap(a => [...a.yourLocations, ...a.otherLocations]).filter(Boolean))].length}
            </div>
            <div className="text-blue-700 font-medium">Affected Regions</div>
            <div className="text-blue-500 text-sm mt-2">Nationwide Coverage</div>
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-white/20 overflow-hidden animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => openAlertDetails(alert)}
            >
              {/* Alert Header with Gradient */}
              <div className={`bg-gradient-to-r ${getSeverityColor(alert.Type)} p-6 relative overflow-hidden`}>
                <div className="absolute top-4 right-4">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getSeverityGradient(alert.Type)} shadow-lg`}></div>
                </div>
                
                {/* Location Alert Badge */}
                {alert.isNearYou && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg flex items-center">
                    <LocationIcon className="w-3 h-3 mr-1" />
                    Near You
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="font-bold text-sm uppercase tracking-wider bg-white/30 px-3 py-1 rounded-full">
                    {alert.Type || 'Alert'}
                  </span>
                  <span className="text-sm font-semibold bg-black/10 px-3 py-1 rounded-full flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {alert.MonthYear}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">
                    <DiseaseIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {alert.DiseaseName}
                    </h3>
                    <div className="flex items-center text-sm font-medium">
                      <UpdateIcon className="w-4 h-4 mr-1" />
                      Updated: {alert.UpdatedDate || 'Recently'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Body */}
              <div className="p-6 space-y-4">
                {/* Your Locations Section */}
                {alert.yourLocations.length > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200">
                    <div className="flex items-center text-sm font-semibold text-red-700 mb-2">
                      <LocationIcon className="w-4 h-4 mr-2" />
                      Your Locations Affected
                    </div>
                    <div className="space-y-2">
                      {alert.yourLocations.map((location, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white rounded-xl p-3 border border-red-200">
                          <span className="text-red-700 font-bold text-sm">{location}</span>
                          <span className="text-red-600 text-xs font-semibold">High Risk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Locations Section */}
                {alert.otherLocations.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
                    <div className="flex items-center text-sm font-semibold text-blue-700 mb-2">
                      <LocationIcon className="w-4 h-4 mr-2" />
                      Other Affected Locations
                    </div>
                    <div className="bg-white rounded-xl p-3 border">
                      <p className="text-gray-800 font-medium text-sm">
                        {alert.otherLocations.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Overview */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center text-sm font-semibold text-purple-700 mb-2">
                    <OverviewIcon className="w-4 h-4 mr-2" />
                    AI Overview
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                    {alert['Disease Overview'] || 'Comprehensive analysis and monitoring recommended.'}
                  </p>
                </div>

                {/* Preventive Measures Preview */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center text-sm font-semibold text-green-700 mb-2">
                    <ShieldIcon className="w-4 h-4 mr-2" />
                    Key Preventive Measures
                  </div>
                  <div className="space-y-1">
                    {alert.preventiveMeasures.slice(0, 2).map((measure, idx) => (
                      <div key={idx} className="flex items-start text-xs text-gray-600">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        <span className="flex-1">{measure}</span>
                      </div>
                    ))}
                    {alert.preventiveMeasures.length > 2 && (
                      <div className="text-green-600 text-xs font-medium mt-2">
                        +{alert.preventiveMeasures.length - 2} more measures
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-2">ID:</span>
                    {alert.OBTID || 'N/A'}
                  </div>
                  <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20">
            <div className="text-6xl mb-6">
              <DiseaseIcon className="w-16 h-16 mx-auto text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              {searchTerm || selectedType !== 'all' ? 'No matching alerts found' : 'All Clear!'}
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search filters to see more results' 
                : 'No active disease alerts in your area. Continue practicing good hygiene!'}
            </p>
            {(searchTerm || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto animate-scaleIn border border-white/20">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${getSeverityColor(selectedAlert.Type)} p-8 rounded-t-3xl relative`}>
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-white text-3xl hover:scale-110 transition-transform duration-200 bg-black/20 rounded-full w-10 h-10 flex items-center justify-center"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
              
              <div className="flex items-start space-x-6">
                <div className="text-4xl">
                  <DiseaseIcon className="w-12 h-12" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="font-bold text-lg uppercase tracking-wider bg-white/30 px-4 py-2 rounded-full">
                      {selectedAlert.Type}
                    </span>
                    {selectedAlert.isNearYou && (
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse flex items-center">
                        <LocationIcon className="w-4 h-4 mr-1" />
                        Alert in Your Area
                      </span>
                    )}
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {selectedAlert.DiseaseName}
                  </h2>
                  <div className="flex items-center text-lg text-gray-700 space-x-6">
                    <span className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      {selectedAlert.MonthYear}
                    </span>
                    <span className="flex items-center">
                      <UpdateIcon className="w-5 h-5 mr-2" />
                      {selectedAlert.UpdatedDate || 'Recently Updated'}
                    </span>
                    {selectedAlert.UpdatedOn && (
                      <span className="flex items-center">
                        <AlertIcon className="w-5 h-5 mr-2" />
                        {selectedAlert.UpdatedOn}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8">
              {/* Locations Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your Locations */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
                  <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
                    <LocationIcon className="w-6 h-6 mr-3" />
                    Your Locations Affected
                  </h3>
                  {selectedAlert.yourLocations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedAlert.yourLocations.map((location, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-red-200">
                          <div className="flex justify-between items-center">
                            <span className="text-red-700 font-bold">{location}</span>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                              High Risk
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-green-500 text-4xl mb-4">✓</div>
                      <p className="text-green-600 font-bold text-lg">No Locations Near You</p>
                      <p className="text-green-500 mt-2">Your area is currently safe</p>
                    </div>
                  )}
                </div>

                {/* Other Locations */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                    <LocationIcon className="w-6 h-6 mr-3" />
                    Other Affected Locations
                  </h3>
                  {selectedAlert.otherLocations.length > 0 ? (
                    <div className="bg-white rounded-xl p-4 border">
                      <div className="space-y-2">
                        {selectedAlert.otherLocations.map((location, idx) => (
                          <div key={idx} className="flex items-center text-gray-800">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>{location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">No other locations reported</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Overview */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center">
                  <OverviewIcon className="w-6 h-6 mr-3" />
                  AI Disease Overview
                </h3>
                <div className="bg-white rounded-xl p-6 border">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {selectedAlert['Disease Overview'] || 'Advanced monitoring and analysis in progress. Stay updated with local health authorities.'}
                  </p>
                </div>
              </div>

              {/* Preventive Measures */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                  <ShieldIcon className="w-6 h-6 mr-3" />
                  Preventive Measures & Safety Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAlert.preventiveMeasures.map((measure, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-green-200 flex items-start space-x-3 transform hover:scale-105 transition-all duration-200">
                      <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-medium">{measure}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center border">
                  <div className="text-gray-600 text-sm">Alert ID</div>
                  <div className="font-bold text-gray-900 text-lg">{selectedAlert.OBTID || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border">
                  <div className="text-gray-600 text-sm">Last Updated</div>
                  <div className="font-bold text-gray-900 text-lg">{selectedAlert.UpdatedOn || 'System'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border">
                  <div className="text-gray-600 text-sm">Severity</div>
                  <div className="font-bold text-gray-900 text-lg">{selectedAlert.Type}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border">
                  <div className="text-gray-600 text-sm">Your Status</div>
                  <div className={`font-bold text-lg ${selectedAlert.isNearYou ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedAlert.isNearYou ? 'At Risk' : 'Safe'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-8 py-6">
              <button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl text-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Got it! Stay Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseAlertsDashboard;