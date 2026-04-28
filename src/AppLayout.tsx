import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  Users, 
  CreditCard, 
  Bell, 
  LogOut, 
  Search, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Settings,
  Car,
  User as UserIcon,
  Phone,
  FileText,
  Sparkles,
  ArrowLeft,
  X,
  CreditCard as PaymentIcon,
  ShieldCheck,
  ChevronDown,
  Filter,
  History,
  Store,
  Wallet,
  Edit,
  Trash2,
  Menu
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { WorkshopService, User, UserRole, SparePart, ServiceStatus, SubscriptionTier, Customer, Vehicle } from './types';
import { INITIAL_PARTS } from './constants';
import { getAIDiagnosis } from './services/geminiService';

// --- Auth & Subscription Flow ---
const SUBSCRIPTION_PLANS = [
  { id: 'Basic', name: 'Starter', price: 150000, features: ['Unlimited Transactions', 'Inventory Management', '1 User Access'] },
  { id: 'Premium', name: 'Pro Garage', price: 450000, features: ['Multi-User Access', 'Customer Auto-Followup', 'Financial Analytics', 'Export Reports'] }
];

const Auth = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [step, setStep] = useState<'login' | 'register' | 'plan'>('login');
  const [role, setRole] = useState<UserRole>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('Basic');
  
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'register') {
      setStep('plan');
      return;
    }
    
    onLogin({
      id: 'USR-' + Math.random().toString(36).substr(2, 9),
      name: workshopName || (role === 'Admin' ? 'Suryo' : role === 'Cashier' ? 'Ani' : 'Bambang'),
      role: step === 'login' ? role : 'Admin',
      email: email || 'user@workshop.com',
      workshopName: workshopName || 'Suryo Bengkel',
      subscription: {
        tier: step === 'login' ? 'Premium' : selectedPlan,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100"
      >
        <div className="space-y-6 text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-100">
            <Wrench className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">WorkshopPro</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              {step === 'plan' ? 'Choose Your Plan' : 'Manage your garage efficiently'}
            </p>
          </div>
        </div>

        {step === 'plan' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {SUBSCRIPTION_PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as SubscriptionTier)}
                  className={cn(
                    "p-6 rounded-[24px] border-2 text-left transition-all",
                    selectedPlan === plan.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{plan.name}</span>
                    <span className="text-lg font-black text-blue-600">Rp {plan.price.toLocaleString()}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map(f => (
                      <li key={f} className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                         <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <button 
              onClick={handleAuth}
              className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200"
            >
              Start Subscription <ChevronRight className="w-5 h-5 inline" />
            </button>
            <button onClick={() => setStep('register')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Back</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5">
            {step === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Workshop Name</label>
                <input 
                  required type="text" placeholder="My Awesome Garage"
                  value={workshopName} onChange={e => setWorkshopName(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <input 
                required type="email" placeholder="name@workshop.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
              <input 
                required type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
              />
            </div>

            {step === 'login' && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block text-center">Login as</label>
                <div className="p-1.5 bg-slate-50 rounded-2xl flex gap-1 border border-slate-100">
                  {(['Admin', 'Cashier', 'Mechanic'] as UserRole[]).map((r) => (
                    <button
                      key={r} type="button" onClick={() => setRole(r)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        role === r ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-100" : "text-slate-400"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-200"
            >
              {step === 'login' ? 'Sign In' : 'Continue'} <ChevronRight className="w-5 h-5 inline" />
            </button>
          </form>
        )}

        {step !== 'plan' && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setStep(step === 'login' ? 'register' : 'login')}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              {step === 'login' ? "Don't have an account? Start Free Trial" : "Already have an account? Sign In"}
            </button>
          </div>
        )}
      </motion.div>
      <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">v3.0.0 • SaaS Enterprise</p>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = ({ services, parts }: { services: WorkshopService[], parts: SparePart[] }) => {
  const stats = useMemo(() => {
    const totalRevenue = services.filter(s => s.status === 'Done').reduce((acc, s) => acc + s.totalAmount, 0);
    const activeJobs = services.filter(s => s.status !== 'Done').length;
    const completedJobs = services.filter(s => s.status === 'Done').length;
    const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

    return [
      { label: "Revenue", value: `Rp ${(totalRevenue / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Active', value: activeJobs, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Done', value: completedJobs, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];
  }, [services, parts]);

  const topServices = useMemo(() => {
    const counts: Record<string, number> = {};
    services.forEach(s => {
      counts[s.serviceType] = (counts[s.serviceType] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [services]);

  const bestSellingParts = useMemo(() => {
    const counts: Record<string, number> = {};
    services.forEach(s => {
      s.partsUsed.forEach(p => {
        counts[p.name] = (counts[p.name] || 0) + p.quantity;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [services]);

  const chartData = [
    { name: 'S', value: 4000 },
    { name: 'S', value: 3000 },
    { name: 'R', value: 2000 },
    { name: 'K', value: 2780 },
    { name: 'J', value: 1890 },
    { name: 'S', value: 2390 },
    { name: 'M', value: 3490 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats - 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label} 
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-none">{stat.value}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Revenue Chart - Simplified labels */}
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Revenue Trend</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analytics - Mobile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Top Services</h3>
            <div className="space-y-3">
              {topServices.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">{name}</span>
                  <span className="text-xs font-black text-blue-600">{count}x</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Best Selling Parts</h3>
            <div className="space-y-3">
              {bestSellingParts.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 truncate mr-2">{name}</span>
                  <span className="text-xs font-black text-emerald-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Queue - Card Based */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ongoing Repairs</h3>
            <button className="text-blue-600 text-xs font-bold uppercase tracking-wider">Expand</button>
          </div>
          <div className="space-y-3">
            {services.slice(0, 3).map((service) => (
              <div key={service.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs uppercase shadow-inner">
                    {service.vehiclePlate.slice(-2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{service.vehicleModel}</p>
                    <p className="text-[10px] text-slate-400 font-mono font-bold">{service.vehiclePlate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                    service.status === 'Done' ? 'bg-emerald-100 text-emerald-700' :
                    service.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  )}>
                    {service.status === 'In Progress' ? 'REPAIR' : service.status.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold">20m ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- POS / Service Form ---
const POSForm = ({ onSave, parts, customers, vehicles, onAddCustomer, onAddVehicle }: { 
  onSave: (s: WorkshopService) => void, 
  parts: SparePart[],
  customers: Customer[],
  vehicles: Vehicle[],
  onAddCustomer: (c: Customer) => void,
  onAddVehicle: (v: Vehicle) => void
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    vehicleId: '',
    vehiclePlate: '',
    vehicleModel: '',
    km: '',
    serviceType: 'Ganti Oli',
    complaint: '',
    laborFee: '50000',
    type: 'Service' as 'Service' | 'Retail'
  });
  
  const [usedParts, setUsedParts] = useState<Array<{ partId: string; name: string; quantity: number; priceAtTime: number }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [showPartPicker, setShowPartPicker] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
    c.phone.includes(customerSearchQuery)
  ), [customers, customerSearchQuery]);

  const filteredVehicles = useMemo(() => vehicles.filter(v => v.customerId === formData.customerId), [vehicles, formData.customerId]);

  const totalParts = usedParts.reduce((acc, p) => acc + (p.priceAtTime * p.quantity), 0);
  const grandTotal = totalParts + (formData.type === 'Service' ? Number(formData.laborFee) : 0);

  const handleSelectCustomer = (customer: Customer) => {
    setFormData(prev => ({ ...prev, customerId: customer.id, customerName: customer.name, vehicleId: '', vehiclePlate: '', vehicleModel: '' }));
    setShowCustomerSearch(false);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setFormData(prev => ({ ...prev, vehicleId: vehicle.id, vehiclePlate: vehicle.plateNumber, vehicleModel: vehicle.model }));
    setShowVehiclePicker(false);
  };

  const addPart = (part: SparePart) => {
    setUsedParts(prev => {
      const existing = prev.find(p => p.partId === part.id);
      if (existing) {
        return prev.map(p => p.partId === part.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { partId: part.id, name: part.name, quantity: 1, priceAtTime: part.price }];
    });
    setShowPartPicker(false);
  };

  const handleAIDiagnosis = async () => {
    if (!formData.complaint || !formData.vehicleModel) return;
    setIsAnalyzing(true);
    try {
      const res = await getAIDiagnosis(formData.complaint, formData.vehicleModel);
      setDiagnosis(res);
    } catch {
      setDiagnosis("Recommend checking engine and sensors based on reported issues.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="p-1 bg-slate-100 rounded-2xl flex gap-1">
        {(['Service', 'Retail'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFormData(prev => ({ ...prev, type: t as any }))}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              formData.type === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
            )}
          >
            {t === 'Service' ? 'Repair & Service' : 'Direct Sale'}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-blue-600" /> Customer
          </h4>
          <button 
            onClick={() => setShowCustomerSearch(true)}
            className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group"
          >
            <span className={cn("text-sm font-bold", formData.customerName ? "text-slate-900" : "text-slate-400")}>
              {formData.customerName || "Search or Add Customer"}
            </span>
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>

        {formData.type === 'Service' && formData.customerId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" /> Vehicle
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setShowVehiclePicker(true)}
                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group"
              >
                <span className={cn("text-sm font-bold", formData.vehiclePlate ? "text-slate-900" : "text-slate-400")}>
                  {formData.vehiclePlate ? `${formData.vehiclePlate} (${formData.vehicleModel})` : "Select Vehicle"}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Current KM</label>
                  <input 
                    value={formData.km}
                    onChange={e => setFormData({...formData, km: e.target.value})}
                    type="number" placeholder="12500" 
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Labor Fee</label>
                  <input 
                    value={formData.laborFee}
                    onChange={e => setFormData({...formData, laborFee: e.target.value})}
                    type="number" 
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" /> Parts & Diagnosis
            </h4>
            {formData.type === 'Service' && (
              <button 
                onClick={handleAIDiagnosis}
                disabled={!formData.complaint || isAnalyzing}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'AI Engine'}
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {formData.type === 'Service' && (
              <textarea 
                value={formData.complaint}
                onChange={e => setFormData({...formData, complaint: e.target.value})}
                placeholder="Complaint or issues details..."
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium resize-none min-h-[100px]"
              />
            )}

            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              <span>Selected Parts ({usedParts.length})</span>
              <button onClick={() => setShowPartPicker(true)} className="text-blue-600 font-black">+ Add Part</button>
            </div>

            <div className="space-y-2">
              {usedParts.map(p => (
                <div key={p.partId} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{p.quantity}x • Rp {p.priceAtTime.toLocaleString()}</p>
                  </div>
                  <button onClick={() => setUsedParts(prev => prev.filter(x => x.partId !== p.partId))} className="p-1 text-slate-400 hover:text-rose-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4 bg-slate-50 -mx-6 px-6 py-6 border-t border-slate-100">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bill</span>
             <span className="text-xl font-black text-blue-600">Rp {grandTotal.toLocaleString()}</span>
          </div>
          <button 
             disabled={!formData.customerId}
             onClick={() => onSave({
               id: `SRV-${Math.floor(Math.random()*1000)}`,
               customerId: formData.customerId,
               customerName: formData.customerName,
               vehicleId: formData.vehicleId,
               vehiclePlate: formData.vehiclePlate || 'RETAIL',
               vehicleModel: formData.vehicleModel || 'Direct Sale',
               kilometers: Number(formData.km || 0),
               serviceType: formData.type === 'Retail' ? 'Retail' : formData.serviceType,
               complaint: formData.complaint,
               status: formData.type === 'Retail' ? 'Done' : 'In Progress',
               createdAt: new Date().toISOString(),
               partsUsed: usedParts,
               laborFee: formData.type === 'Retail' ? 0 : Number(formData.laborFee),
               totalAmount: grandTotal,
               paymentStatus: 'Unpaid'
             })}
             className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
          >
            {formData.type === 'Retail' ? 'Complete Sale' : 'Submit Order'}
          </button>
        </div>
      </div>

      {/* Part Picker */}
      <AnimatePresence>
        {showPartPicker && (
          <Modal title="Select Sparepart" onClose={() => setShowPartPicker(false)}>
             <div className="space-y-2">
                {parts.map(part => (
                  <button key={part.id} disabled={part.stock <= 0} onClick={() => addPart(part)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all disabled:opacity-50 text-left"
                  >
                    <div>
                      <p className="text-sm font-bold">{part.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{part.category} • {part.stock} in stock</p>
                    </div>
                    <p className="text-xs font-black text-slate-900 font-mono">Rp {part.price.toLocaleString()}</p>
                  </button>
                ))}
             </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Customer Search */}
      <AnimatePresence>
        {showCustomerSearch && (
          <Modal title="Search Customer" onClose={() => setShowCustomerSearch(false)}>
             <div className="space-y-4">
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   placeholder="Search name or phone..."
                   value={customerSearchQuery}
                   onChange={e => setCustomerSearchQuery(e.target.value)}
                   className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                 />
               </div>
               <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => handleSelectCustomer(c)} className="w-full p-4 bg-slate-50 hover:bg-blue-50 rounded-xl text-left transition-colors">
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <button 
                      onClick={() => {
                        const newC = { id: 'CUST-'+Math.random(), name: customerSearchQuery, phone: '', totalServiceCount: 0 };
                        onAddCustomer(newC);
                        handleSelectCustomer(newC);
                      }}
                      className="w-full p-4 border-2 border-dashed border-slate-100 rounded-xl text-center text-blue-600 font-bold text-xs"
                    >
                      + Add "{customerSearchQuery}" as New Customer
                    </button>
                  )}
               </div>
             </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Vehicle Picker */}
      <AnimatePresence>
        {showVehiclePicker && (
          <Modal title="Select Vehicle" onClose={() => setShowVehiclePicker(false)}>
             <div className="space-y-2">
                {filteredVehicles.map(v => (
                  <button key={v.id} onClick={() => handleSelectVehicle(v)} className="w-full p-4 bg-slate-50 hover:bg-blue-50 rounded-xl text-left transition-colors">
                    <p className="text-sm font-bold">{v.plateNumber}</p>
                    <p className="text-xs text-slate-400 uppercase font-black">{v.model} • {v.brand}</p>
                  </button>
                ))}
                <button 
                  onClick={() => {
                    const plate = prompt('Enter Plate Number:');
                    if(plate) {
                      const newV = { id: 'VH-'+Math.random(), customerId: formData.customerId, plateNumber: plate, model: 'Yamaha NMAX', brand: 'Yamaha' };
                      onAddVehicle(newV);
                      handleSelectVehicle(newV);
                    }
                  }}
                  className="w-full p-4 border-2 border-dashed border-slate-100 rounded-xl text-center text-blue-600 font-bold text-xs mt-2"
                >
                  + Register New Vehicle
                </button>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Inventory Component ---
const InventoryView = ({ parts, onAdd, onEdit, onDelete }: { 
  parts: SparePart[], 
  onAdd: () => void, 
  onEdit: (p: SparePart) => void,
  onDelete: (id: string) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredParts = useMemo(() => {
    return parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [parts, searchTerm]);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" placeholder="Lookup parts..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm font-bold"
          />
        </div>
        <button onClick={onAdd} className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
           <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3">
        {filteredParts.map((part) => (
          <div key={part.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black",
                part.stock <= part.minStock ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {part.stock}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{part.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{part.category}</p>
                <p className="text-[11px] font-black text-blue-600 mt-1">Rp {part.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(part)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit className="w-4 h-4" /></button>
              <button onClick={() => onDelete(part.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Customers Component ---
const CustomersView = ({ customers, onAdd, onEdit, onDelete }: { 
  customers: Customer[], 
  onAdd: () => void,
  onEdit: (c: Customer) => void,
  onDelete: (id: string) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = useMemo(() => {
    return customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm));
  }, [customers, searchTerm]);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" placeholder="Search customers..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm font-bold"
          />
        </div>
        <button onClick={onAdd} className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
           <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.phone}</p>
                <p className="text-[10px] text-slate-400 mt-1">{c.totalServiceCount} Services Completed</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit className="w-4 h-4" /></button>
              <button onClick={() => onDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- History / Transactions Component ---
const HistoryView = ({ services, onSelect }: { services: WorkshopService[], onSelect: (id: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = useMemo(() => {
    return services.filter(s => 
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" placeholder="Search by plate, name, or model..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm font-bold"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((service) => (
          <div 
            key={service.id} 
            onClick={() => onSelect(service.id)}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black uppercase shadow-inner",
                service.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 
                service.status === 'In Progress' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              )}>
                {service.vehiclePlate.slice(-2)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{service.vehicleModel}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{service.vehiclePlate}</p>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{service.customerName}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                service.status === 'Done' ? 'bg-emerald-100 text-emerald-700' :
                service.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              )}>
                {service.status}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Rp {service.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-12 text-center opacity-40">
            <History className="w-12 h-12 mx-auto mb-2" />
            <p className="text-xs font-black uppercase tracking-widest">No matching history</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Subscription / Settings View ---
const SubscriptionView = ({ user }: { user: User }) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="p-8 bg-blue-600 rounded-[40px] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
        <Sparkles className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 rotate-12" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Current Plan</p>
              <h3 className="text-3xl font-black">{user.subscription.tier.toUpperCase()}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold opacity-80">
            <Clock className="w-4 h-4" /> Valid until {format(new Date(user.subscription.expiryDate), 'MMMM d, yyyy')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Workshop Settings</h4>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-50">
            <div>
              <p className="text-xs font-bold text-slate-900">Push Notifications</p>
              <p className="text-[10px] text-slate-400 font-medium">Service ready alerts to customers</p>
            </div>
            <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Auto Backup</p>
              <p className="text-[10px] text-slate-400 font-medium">Daily cloud transaction sync</p>
            </div>
            <div className="w-10 h-6 bg-slate-200 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-center active:scale-95 transition-all">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline underline-offset-4">Staff Access</span>
        </button>
        <button className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-center active:scale-95 transition-all">
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline underline-offset-4">Billing Info</span>
        </button>
      </div>

      <button className="w-full h-16 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95">
        <LogOut className="w-4 h-4" />
        <span className="text-xs font-black uppercase tracking-widest">Sign Out Everywhere</span>
      </button>
    </div>
  );
};

// --- Modal Backdrop ---
const Modal = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center pointer-events-auto"
  >
    <motion.div 
      initial={{ y: 20, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ y: 20, scale: 0.95 }}
      className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
    >
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{title}</h3>
        <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[85vh] p-6">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

// --- Add Stock Modal Content ---
const AddStockForm = ({ parts, onSave }: { parts: SparePart[], onSave: (partId: string, amount: number) => void }) => {
  const [selectedPartId, setSelectedPartId] = useState(parts[0]?.id || '');
  const [amount, setAmount] = useState('0');

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Sparepart</label>
        <select 
          value={selectedPartId}
          onChange={e => setSelectedPartId(e.target.value)}
          className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
        >
          {parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock} left)</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Amount to Add</label>
        <input 
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
        />
      </div>
      <button 
        onClick={() => onSave(selectedPartId, Number(amount))}
        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 active:scale-95 transition-all"
      >
        Increase Stock
      </button>
    </div>
  );
};

// --- Service Detail Content ---
const ServiceDetail = ({ service, onUpdateStatus }: { service: WorkshopService, onUpdateStatus: (id: string, s: ServiceStatus) => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black text-slate-900">{service.vehicleModel}</h2>
          <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{service.vehiclePlate}</p>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
          service.status === 'Done' ? 'bg-emerald-100 text-emerald-700' :
          service.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
        )}>
          {service.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
          <p className="text-xs font-black text-slate-700">{service.customerName}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Millages</p>
          <p className="text-xs font-black text-slate-700">{service.kilometers.toLocaleString()} KM</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repair Summary</h4>
        <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
          {service.partsUsed.map(p => (
            <div key={p.partId} className="flex justify-between text-xs">
              <span className="font-bold text-slate-600">{p.name} (x{p.quantity})</span>
              <span className="font-black text-slate-900">Rp {(p.priceAtTime * p.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-600">Labor Fee</span>
            <span className="font-black text-slate-900">Rp {service.laborFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t-2 border-slate-200">
            <span className="font-black text-blue-600 uppercase tracking-widest">Total</span>
            <span className="font-black text-blue-600">Rp {service.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['In Progress', 'Ready', 'Done'] as ServiceStatus[]).map(s => (
            <button 
              key={s}
              onClick={() => onUpdateStatus(service.id, s)}
              className={cn(
                "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                service.status === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Reports View ---
const ReportsView = ({ services }: { services: WorkshopService[] }) => {
  const stats = useMemo(() => {
    const total = services.reduce((acc, s) => acc + s.totalAmount, 0);
    const labor = services.reduce((acc, s) => acc + s.laborFee, 0);
    const parts = total - labor;
    return { total, labor, parts };
  }, [services]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];
  const pieData = [
    { name: 'Labor', value: stats.labor },
    { name: 'Parts', value: stats.parts },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales</p>
          <p className="text-xl font-black text-blue-600">Rp {(stats.total / 1000).toFixed(0)}k</p>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transactions</p>
          <p className="text-xl font-black text-slate-900">{services.length}</p>
        </div>
      </div>

      <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Revenue Breakdown</h3>
        <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
           {pieData.map((d, i) => (
             <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Top Performance</h3>
        <div className="h-[200px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Oil', val: 400 }, { name: 'Brake', val: 300 }, { name: 'Tune', val: 560 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="val" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function AppLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'inventory' | 'customers' | 'reports' | 'subscription'>('dashboard');
  const [showPOSForm, setShowPOSForm] = useState(false);
  const [parts, setParts] = useState<SparePart[]>(INITIAL_PARTS);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'CUST-1', name: 'Budi Santoso', phone: '08123456789', totalServiceCount: 5 },
    { id: 'CUST-2', name: 'Siti Aminah', phone: '08789012345', totalServiceCount: 2 }
  ]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'VH-1', customerId: 'CUST-1', plateNumber: 'B 1234 ABC', model: 'Honda Vario 160', brand: 'Honda' },
    { id: 'VH-2', customerId: 'CUST-2', plateNumber: 'D 5678 XYZ', model: 'Yamaha Fazzio', brand: 'Yamaha' }
  ]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, inBottom: true },
    { id: 'pos', label: 'Transaksi', icon: PaymentIcon, inBottom: true },
    { id: 'customers', label: 'Riwayat', icon: Users, inBottom: true },
    { id: 'inventory', label: 'Stok Barang', icon: Package, inBottom: false },
    { id: 'reports', label: 'Laporan', icon: TrendingUp, inBottom: false },
    { id: 'subscription', label: 'Langganan', icon: ShieldCheck, inBottom: false },
  ];

  const [services, setServices] = useState<WorkshopService[]>([
      {
        id: 'SRV-001',
        customerId: 'CUST-01',
        customerName: 'Andi Kusuma',
        vehicleId: 'VH-1',
        vehiclePlate: 'B 1234 ABC',
        vehicleModel: 'Honda Vario 150',
        kilometers: 12500,
        serviceType: 'Ganti Oli',
        complaint: 'Suara kasar di bagian CVT',
        status: 'In Progress',
        createdAt: new Date().toISOString(),
        partsUsed: [{ partId: 'P001', name: 'Oli Mesin 1L', quantity: 1, priceAtTime: 95000 }],
        laborFee: 50000,
        totalAmount: 145000,
        paymentStatus: 'Paid'
      },
      {
        id: 'SRV-002',
        customerId: 'CUST-02',
        customerName: 'Budi Santoso',
        vehicleId: 'VH-2',
        vehiclePlate: 'D 9999 XYZ',
        vehicleModel: 'Yamaha NMAX',
        kilometers: 8400,
        serviceType: 'Servis Rem',
        complaint: 'Ganti kampas depann',
        status: 'Ready',
        createdAt: new Date().toISOString(),
        partsUsed: [{ partId: 'P002', name: 'Kampas Rem Depan', quantity: 1, priceAtTime: 150000 }],
        laborFee: 35000,
        totalAmount: 185000,
        paymentStatus: 'Unpaid'
      }
  ]);

  const handleNewService = (service: WorkshopService) => {
    setParts(prev => {
      const newParts = [...prev];
      service.partsUsed.forEach(used => {
        const idx = newParts.findIndex(p => p.id === used.partId);
        if (idx !== -1) {
          newParts[idx] = { ...newParts[idx], stock: Math.max(0, newParts[idx].stock - used.quantity) };
        }
      });
      return newParts;
    });

    setServices([service, ...services]);
    setShowPOSForm(false);
    setActiveTab('pos');
  };

  const handleUpdateStatus = (id: string, newStatus: ServiceStatus) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setSelectedServiceId(null);
  };

  const handleAddStock = (partId: string, amount: number) => {
    setParts(prev => prev.map(p => p.id === partId ? { ...p, stock: p.stock + amount } : p));
    setShowAddStock(false);
  };

  const selectedService = useMemo(() => 
    services.find(s => s.id === selectedServiceId), 
  [services, selectedServiceId]);

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900 selection:bg-blue-100">
      {/* Sidebar for Desktop (Hidden on Mobile) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden lg:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-blue-600 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">WorkshopPro</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setShowPOSForm(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group",
                  activeTab === item.id && !showPOSForm
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-slate-500 hover:bg-slate-50 rounded-md transition-colors"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  activeTab === item.id && !showPOSForm ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 truncate uppercase tracking-tighter font-medium">{currentUser.role}</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400" />
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[101] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 leading-none">WorkshopPro</h2>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Smart System</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setShowPOSForm(false);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                      activeTab === item.id && !showPOSForm ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-bold">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-100">
                <button 
                  onClick={() => setCurrentUser(null)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-bold">Keluar</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - Optimized for Mobile */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
             {!showPOSForm ? (
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 -ml-2 text-slate-500 lg:hidden"
               >
                 <Menu className="w-6 h-6" />
               </button>
             ) : (
               <button onClick={() => setShowPOSForm(false)} className="p-2 rounded-full hover:bg-slate-100 lg:hidden">
                 <ArrowLeft className="w-5 h-5 text-slate-600" />
               </button>
             )}
             <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {showPOSForm ? 'Kasir Baru' : 
                 activeTab === 'dashboard' ? 'Overview' : 
                 activeTab === 'pos' ? 'Order' : 
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{format(new Date(), 'EEEE, d MMMM')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!showPOSForm && (
              <button 
                onClick={() => setShowPOSForm(true)}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden hidden sm:block">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="avatar" />
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto pb-24 lg:p-8 p-4 custom-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            {!showPOSForm && activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Dashboard services={services} parts={parts} />
              </motion.div>
            )}

            {!showPOSForm && activeTab === 'pos' && (
              <motion.div key="pos-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Orders</h3>
                    <p className="text-sm font-bold text-slate-900">{services.filter(s => s.status !== 'Done').length} In Progress</p>
                  </div>
                  <button onClick={() => setShowPOSForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    New Transaction
                  </button>
                </div>
                <HistoryView services={services} onSelect={setSelectedServiceId} />
              </motion.div>
            )}

            {showPOSForm && (
              <motion.div key="pos-form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setShowPOSForm(false)} className="p-2 bg-white rounded-xl border border-slate-100"><X className="w-5 h-5" /></button>
                  <h2 className="text-xl font-black text-slate-900">New Transaction</h2>
                </div>
                <POSForm 
                  onSave={handleNewService} 
                  parts={parts} 
                  customers={customers}
                  vehicles={vehicles}
                  onAddCustomer={(c) => setCustomers(prev => [c, ...prev])}
                  onAddVehicle={(v) => setVehicles(prev => [v, ...prev])}
                />
              </motion.div>
            )}

            {activeTab === 'inventory' && !showPOSForm && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <InventoryView 
                  parts={parts} 
                  onAdd={() => setShowAddStock(true)}
                  onEdit={(p) => setEditingPart(p)}
                  onDelete={(id) => setParts(prev => prev.filter(x => x.id !== id))}
                />
              </motion.div>
            )}

            {activeTab === 'customers' && !showPOSForm && (
              <motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CustomersView 
                  customers={customers}
                  onAdd={() => setShowCustomerSearch(true)}
                  onEdit={(c) => setEditingCustomer(c)}
                  onDelete={(id) => setCustomers(prev => prev.filter(x => x.id !== id))}
                />
              </motion.div>
            )}

            {activeTab === 'reports' && !showPOSForm && (
              <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ReportsView services={services} />
              </motion.div>
            )}

            {activeTab === 'subscription' && !showPOSForm && (
              <motion.div key="subscription" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SubscriptionView user={currentUser} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around h-18 px-6 pb-2 z-40">
          {navItems.filter(i => i.inBottom).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setShowPOSForm(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center py-2 gap-1 transition-all h-full min-w-[60px]",
                activeTab === item.id && !showPOSForm ? "text-blue-600" : "text-slate-400"
              )}
            >
              <div className={cn(
                "w-12 h-8 rounded-full flex items-center justify-center transition-colors",
                activeTab === item.id && !showPOSForm ? "bg-blue-50" : "bg-transparent"
              )}>
                <item.icon className={cn("w-5 h-5", activeTab === item.id && !showPOSForm ? "stroke-[2.5]" : "stroke-[2]")} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-2 gap-1 text-slate-400 h-full min-w-[60px]"
          >
            <div className="w-12 h-8 rounded-full flex items-center justify-center">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Menu</span>
          </button>
        </nav>

        {/* Modal Overlays */}
        <AnimatePresence>
          {selectedService && (
            <Modal title="Repair Details" onClose={() => setSelectedServiceId(null)}>
               <ServiceDetail 
                 service={selectedService} 
                 onUpdateStatus={handleUpdateStatus} 
               />
            </Modal>
          )}

          {showAddStock && (
            <Modal title="Add Inventory Stock" onClose={() => setShowAddStock(false)}>
               <AddStockForm 
                 parts={parts} 
                 onSave={handleAddStock} 
               />
            </Modal>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
