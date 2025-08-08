import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Main App Component
const App = () => {
    // --- STATE MANAGEMENT ---
    const [policies, setPolicies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    // --- API CONFIGURATION ---
    const API_URL = 'http://localhost:5126/api/Policy';

    // --- DATA FETCHING ---
    const fetchPolicies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {

            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPolicies(data);
        } catch (e) {
            console.error("Fetch error:", e);
            setError('Failed to fetch policies. Make sure the backend server is running and accessible.');
            // Set mock data for demonstration purposes if the API fails
            setPolicies([
                { id: 'POL-001', beneficiaryName: 'John Doe', carBrand: 'Toyota', carType: 'Camry', tsi: 25000, premiumRate: 5, startDate: '2024-01-01', endDate: '2024-12-31' },
                { id: 'POL-002', beneficiaryName: 'Jane Smith', carBrand: 'Honda', carType: 'Civic', tsi: 22000, premiumRate: 4.5, startDate: '2024-02-15', endDate: '2025-02-14' },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    // --- Initial data load ---
    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    // --- CRUD OPERATIONS ---
    const handleSavePolicy = async (policyData) => {
        const isUpdating = !!policyData.id;
        const method = isUpdating ? 'PUT' : 'POST';
        const url = isUpdating ? `${API_URL}/${policyData.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(policyData),
            });
            if (!response.ok) {
                throw new Error(`Failed to ${isUpdating ? 'update' : 'create'} policy.`);
            }
            await fetchPolicies(); // Refresh the list
            closeForm();
        } catch (e) {
            setError(e.message);
            console.error(e);
        }
    };

    const handleDeletePolicy = async (policyId) => {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            try {
                const response = await fetch(`${API_URL}/${policyId}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete policy.');
                }
                await fetchPolicies(); // Refresh the list
            } catch (e) {
                setError(e.message);
                console.error(e);
            }
        }
    };

    // --- UI EVENT HANDLERS ---
    const openFormForCreate = () => {
        setSelectedPolicy(null);
        setIsFormVisible(true);
    };

    const openFormForEdit = (policy) => {
        setSelectedPolicy(policy);
        setIsFormVisible(true);
    };

    const closeForm = () => {
        setIsFormVisible(false);
        setSelectedPolicy(null);
    };

    // --- SEARCH/FILTER LOGIC ---
    const filteredPolicies = useMemo(() => {
        if (!searchTerm) {
            return policies;
        }
        return policies.filter(p => {
            const term = searchTerm.toLowerCase();
            return (
                p.beneficiaryName?.toLowerCase().includes(term) ||
                p.carBrand?.toLowerCase().includes(term) ||
                p.carType?.toLowerCase().includes(term) ||
                p.id?.toString().toLowerCase().includes(term) // Use toString() for safety
            );
        });
    }, [policies, searchTerm]);

    // --- RENDER ---
    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Auto Insurance Portal</h1>
                    <p className="text-gray-600 mt-1">Manage your auto insurance policies with ease.</p>
                </header>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Toolbar: Search and Add Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full sm:w-auto sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search by name, car, policy..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                             <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={openFormForCreate}
                            className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                             <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Policy
                        </button>
                    </div>

                    {/* Policies List / Table */}
                    {isLoading ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Loading policies...</p>
                        </div>
                    ) : (
                        <PolicyList
                            policies={filteredPolicies}
                            onEdit={openFormForEdit}
                            onDelete={handleDeletePolicy}
                        />
                    )}
                </div>
            </div>

            {/* Policy Form Modal */}
            {isFormVisible && (
                <PolicyForm
                    policy={selectedPolicy}
                    onSave={handleSavePolicy}
                    onClose={closeForm}
                />
            )}
        </div>
    );
};


// --- SUB-COMPONENTS ---

// PolicyList Component: Renders the list of policies
const PolicyList = ({ policies, onEdit, onDelete }) => {
    if (policies.length === 0) {
        return <div className="text-center py-10 text-gray-500">No policies found.</div>;
    }

    const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    const formatDate = (dateString) => dateString ? dateString.split('T')[0] : '';

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TSI</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Dates</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map((policy,index) => (
                        <tr key={policy.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policy.policyNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{policy.beneficiaryName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{policy.carBrand} {policy.carType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(policy.tsi)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(policy.premiumAmount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(policy.startDate)} to {formatDate(policy.endDate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEdit(policy)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                <button onClick={() => onDelete(policy.id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// PolicyForm Component: Modal form for creating/editing policies
const PolicyForm = ({ policy, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        id: policy?.id || null,
        beneficiaryName: policy?.beneficiaryName || '',
        carBrand: policy?.carBrand || '',
        carType: policy?.carType || '',
        tsi: policy?.tsi || 0,
        premiumRate: policy?.premiumRate || 0,
        policyStartDate: policy?.policyStartDate || new Date().toISOString().split('T')[0],
        policyEndDate: policy?.policyEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    });
    
    const [premiumAmount, setPremiumAmount] = useState(0);

    // Effect for auto-calculating premium
    useEffect(() => {
        const tsi = parseFloat(formData.tsi) || 0;
        const rate = parseFloat(formData.premiumRate) || 0;
        setPremiumAmount((tsi * rate) / 100);
    }, [formData.tsi, formData.premiumRate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">{policy ? 'Edit Policy' : 'Create New Policy'}</h2>
                             <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="beneficiaryName" className="block text-sm font-medium text-gray-700">Beneficiary Name</label>
                                <input type="text" name="beneficiaryName" id="beneficiaryName" value={formData.beneficiaryName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="carBrand" className="block text-sm font-medium text-gray-700">Car Brand</label>
                                <input type="text" name="carBrand" id="carBrand" value={formData.carBrand} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="carType" className="block text-sm font-medium text-gray-700">Car Type</label>
                                <input type="text" name="carType" id="carType" value={formData.carType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="tsi" className="block text-sm font-medium text-gray-700">Total Sum Insured (TSI)</label>
                                <input type="number" name="tsi" id="tsi" value={formData.tsi} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required min="0" />
                            </div>
                            <div>
                                <label htmlFor="premiumRate" className="block text-sm font-medium text-gray-700">Premium Rate (%)</label>
                                <input type="number" name="premiumRate" id="premiumRate" value={formData.premiumRate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required min="0" step="0.1" />
                            </div>
                            <div>
                                <label htmlFor="policyStartDate" className="block text-sm font-medium text-gray-700">Policy Start Date</label>
                                <input type="date" name="policyStartDate" id="policyStartDate" value={formData.policyStartDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="policyEndDate" className="block text-sm font-medium text-gray-700">Policy End Date</label>
                                <input type="date" name="policyEndDate" id="policyEndDate" value={formData.policyEndDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div className="md:col-span-2 mt-2 p-3 bg-gray-100 rounded-md">
                                <h4 className="font-medium text-gray-800">Calculated Premium Amount</h4>
                                <p className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(premiumAmount)}</p>
                            </div>
                        </div>
                    </div>
                    {/* Form Actions */}
                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Save Policy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default App;
