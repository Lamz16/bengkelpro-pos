import React, { useState, useMemo, useEffect } from 'react';
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
    ShieldAlert,
    ChevronDown,
    Filter,
    History,
    Store,
    Wallet,
    Edit,
    Trash2,
    Menu,
    UserCircle,
    Printer,
    Share2
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
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { cn } from './lib/utils';
import { WorkshopService, User, UserRole, SparePart, ServiceStatus, SubscriptionTier, Customer, Vehicle, Expense, Supplier, PurchaseRecord } from './types';
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
            name: workshopName || (role === 'Admin' ? 'Suryo' : role === 'Kasir' ? 'Ani' : 'Bambang'),
            role: step === 'login' ? role : 'Admin',
            email: email || 'user@workshop.com',
            workshopName: workshopName || 'Suryo Bengkel',
            createdAt: new Date().toISOString(),
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
                            {step === 'plan' ? 'Pilih Paket Berlangganan' : 'Kelola Bengkel Lebih Efisien'}
                        </p>
                    </div>
                </div>

                {step === 'plan' ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">🎁 Promo New Workshop</p>
                            <p className="text-xs font-bold text-emerald-700">Akun Anda otomatis mendapatkan akses penuh (PRO) selama 3 hari pertama!</p>
                        </div>
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
                                        <span className="text-lg font-black text-blue-600">Rp {(plan.price || 0).toLocaleString()}</span>
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
                            Mulai Masa Trial <ChevronRight className="w-5 h-5 inline" />
                        </button>
                        <button onClick={() => setStep('register')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Kembali</button>
                    </div>
                ) : (
                    <form onSubmit={handleAuth} className="space-y-5">
                        {step === 'register' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Bengkel</label>
                                <input
                                    required type="text" placeholder="Bengkel Maju Jaya"
                                    value={workshopName} onChange={e => setWorkshopName(e.target.value)}
                                    className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-inner"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alamat Email Bengkel</label>
                            <input
                                required type="email" placeholder="pemilik@bengkel.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-inner"
                            />
                        </div>

                        {role !== 'Admin' && step === 'login' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama / ID Karyawan</label>
                                <input
                                    required type="text" placeholder="Masukkan nama Anda (misal: Bambang)"
                                    className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-inner border-blue-100"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                                {role === 'Admin' ? 'Password Admin' : 'Password / PIN Karyawan'}
                            </label>
                            <input
                                required type="password" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-inner"
                            />
                        </div>

                        {step === 'login' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block text-center">Masuk Sebagai</label>
                                <div className="p-1.5 bg-slate-50 rounded-2xl flex gap-1 border border-slate-100">
                                    {(['Admin', 'Kasir', 'Mekanik'] as UserRole[]).map((r) => (
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
                                {role !== 'Admin' && (
                                    <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-wider">
                                        Bagi karyawan, gunakan password yang diberikan oleh Admin
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-200 active:scale-[0.98] transition-transform"
                        >
                            {step === 'login' ? 'Masuk Sekarang' : 'Daftar Bengkel'} <ChevronRight className="w-5 h-5 inline" />
                        </button>
                    </form>
                )}

                {step !== 'plan' && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setStep(step === 'login' ? 'register' : 'login')}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                            {step === 'login' ? "Belum punya akun? Mulai Trial 3 Hari" : "Sudah punya akun? Masuk di sini"}
                        </button>
                    </div>
                )}
            </motion.div>
            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">WorkshopPro v3.1.0 • Built for Success</p>
        </div>
    );
};

// --- Dashboard Component ---
const Dashboard = ({ services, parts, user, onPrint }: { services: WorkshopService[], parts: SparePart[], user: User, onPrint: (id: string) => void }) => {
    const [historySearch, setHistorySearch] = useState('');

    const searchResults = useMemo(() => {
        if (!historySearch.trim()) return [];
        return services.filter(s =>
            s.vehiclePlate.toLowerCase().includes(historySearch.toLowerCase()) ||
            s.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
            s.vehicleModel.toLowerCase().includes(historySearch.toLowerCase())
        ).slice(0, 5);
    }, [historySearch, services]);

    const stats = useMemo(() => {
        const totalRevenue = services.filter(s => s.status === 'Done').reduce((acc, s) => acc + s.totalAmount, 0);
        const activeJobs = services.filter(s => s.status !== 'Done').length;
        const completedJobs = services.filter(s => s.status === 'Done').length;
        const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

        const items: { label: string, value: number | string, icon: any, color: string, bg: string }[] = [
            { label: 'Active', value: activeJobs, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Done', value: completedJobs, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];

        if (user.role !== 'Mekanik') {
            items.unshift({ label: "Revenue", value: `Rp ${(totalRevenue / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' });
        }

        return items;
    }, [services, parts, user]);

    const topServices = useMemo(() => {
        const counts: Record<string, number> = {};
        services.forEach(s => {
            counts[s.serviceType] = (counts[s.serviceType] || 0) + 1;
        });
        return Object.entries(counts)
            .filter(([name]) => name !== 'Retail') // Skip retail in top service types if desired
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
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

    // Real chart data from services
    const dailyRevenue = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return format(d, 'EEE');
        });

        return last7Days.map(day => {
            const dayTotal = services
                .filter(s => format(new Date(s.createdAt), 'EEE') === day)
                .reduce((acc, s) => acc + s.totalAmount, 0);
            return { name: day, value: dayTotal };
        });
    }, [services]);

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

            {/* Vehicle History Quick Search */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Cetak Riwayat Kendaraan</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Cari cepat riwayat servis berdasarkan Plat Nomor atau Nama</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={historySearch}
                        onChange={e => setHistorySearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold placeholder:text-slate-300 focus:border-blue-200 transition-colors"
                        placeholder="Cari B 1234 ABC..."
                    />
                </div>
                {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {searchResults.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 hover:bg-white transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">{s.vehiclePlate}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{s.vehicleModel} • {s.serviceType}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-900 uppercase">Rp {(s.totalAmount || 0).toLocaleString()}</p>
                                        <p className="text-[8px] text-slate-400 font-bold">{format(new Date(s.createdAt), 'dd/MM/yy')}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onPrint(s.id); }}
                                        className="p-2 bg-white text-slate-400 rounded-lg border border-slate-100 hover:text-blue-600 transition-colors"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Revenue Chart - Simplified labels */}
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Revenue Trend</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                                    formatter={(value: number) => [`Rp ${(value || 0).toLocaleString()}`, 'Revenue']}
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

    const canSubmit = formData.customerName && (formData.type === 'Retail' || (formData.vehiclePlate && formData.vehicleModel));

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
                        <UserIcon className="w-4 h-4 text-blue-600" /> Pelanggan
                    </h4>
                    <div className="flex gap-2">
                        <input
                            value={formData.customerName}
                            onChange={e => setFormData({...formData, customerName: e.target.value})}
                            placeholder="Nama Pelanggan / Guest"
                            className="flex-1 h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-blue-200 transition-all"
                        />
                        <button
                            onClick={() => setShowCustomerSearch(true)}
                            className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {formData.type === 'Service' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Car className="w-4 h-4 text-blue-600" /> Kendaraan
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={formData.vehiclePlate}
                                    onChange={e => setFormData({...formData, vehiclePlate: e.target.value})}
                                    placeholder="Plat Nomor"
                                    className="h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-blue-200 transition-all uppercase"
                                />
                                <input
                                    value={formData.vehicleModel}
                                    onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                                    placeholder="Model (e.g. Vario)"
                                    className="h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:border-blue-200 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowVehiclePicker(true)}
                                className="w-full py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-all"
                            >
                                Cari Kendaraan Terdaftar
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
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.quantity}x • Rp {(p.priceAtTime || 0).toLocaleString()}</p>
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
                        <span className="text-xl font-black text-blue-600">Rp {(grandTotal || 0).toLocaleString()}</span>
                    </div>
                    <button
                        disabled={!canSubmit}
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
                                    <p className="text-xs font-black text-slate-900 font-mono">Rp {(part.price || 0).toLocaleString()}</p>
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
const InventoryView = ({ parts, suppliers, purchases, onAdd, onAddStock, onEdit, onDelete }: {
    parts: SparePart[],
    suppliers: Supplier[],
    purchases: PurchaseRecord[],
    onAdd: () => void,
    onAddStock: () => void,
    onEdit: (p: SparePart) => void,
    onDelete: (id: string) => void
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSubTab, setActiveSubTab] = useState<'stock' | 'purchases'>('stock');

    const filteredParts = useMemo(() => {
        return parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [parts, searchTerm]);

    return (
        <div className="space-y-4 pb-20">
            {/* Sub Tab Navigation */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/60 shadow-inner">
                <button
                    onClick={() => setActiveSubTab('stock')}
                    className={cn(
                        "flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                        activeSubTab === 'stock'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    Daftar Stok
                </button>
                <button
                    onClick={() => setActiveSubTab('purchases')}
                    className={cn(
                        "flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                        activeSubTab === 'purchases'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    Transaksi Masuk (Supplier)
                </button>
            </div>

            {activeSubTab === 'stock' ? (
                <>
                    <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-amber-700 uppercase tracking-widest leading-none">Peringatan Stok</p>
                                <p className="text-[10px] text-amber-600 font-bold">{parts.filter(p => p.stock <= p.minStock).length} Barang menipis</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text" placeholder="Lookup parts..." value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm font-bold"
                            />
                        </div>
                        <button
                            onClick={onAddStock}
                            className="hidden md:flex items-center gap-2 h-12 px-5 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-600 transition-colors shrink-0"
                        >
                            <Package className="w-4 h-4" />
                            Tambah Stok
                        </button>
                        <button onClick={onAdd} className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {filteredParts.map((part) => {
                            const supplier = suppliers.find(s => s.id === part.supplierId);
                            return (
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
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{part.category}</span>
                                                {supplier && (
                                                    <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Pemasok: {supplier.name}
                          </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-bold">
                                                <p>Jual: <span className="text-blue-600">Rp {(part.price || 0).toLocaleString()}</span></p>
                                                <p>•</p>
                                                <p>Beli: <span className="text-slate-700">Rp {(part.purchasePrice || 0).toLocaleString()}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => onEdit(part)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete(part.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="space-y-3">
                    {purchases.map((pr) => {
                        const part = parts.find(p => p.id === pr.partId);
                        const supplier = suppliers.find(s => s.id === pr.supplierId);
                        return (
                            <div key={pr.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-950">{part?.name || 'Part Terhapus'}</p>
                                    <p className="text-[10px] text-blue-600 font-extrabold uppercase mt-0.5 tracking-wider">
                                        Supplier: {supplier?.name || 'Umum'}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-semibold mt-1">
                                        {format(new Date(pr.date), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600 font-mono">+{pr.quantity} Pcs</p>
                                    <p className="text-[9px] text-slate-400 font-bold">@Rp {(pr.costPrice || 0).toLocaleString()}</p>
                                    <p className="text-xs font-black text-slate-900 mt-1">Total: Rp {((pr.costPrice || 0) * pr.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })}
                    {purchases.length === 0 && (
                        <div className="p-12 text-center text-slate-400 text-xs font-extrabold bg-white rounded-[32px] border border-dashed border-slate-200">
                            Belum ada transaksi barang masuk dari pemasok.
                        </div>
                    )}
                </div>
            )}
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
const HistoryView = ({ services, onSelect, onPrint, initialFilter }: {
    services: WorkshopService[],
    onSelect: (id: string) => void,
    onPrint: (id: string) => void,
    initialFilter?: string
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilter || 'All');

    const filtered = useMemo(() => {
        return services.filter(s => {
            const matchSearch = s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'All' || s.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [services, searchTerm, statusFilter]);

    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'In Progress', 'Ready', 'Done'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                            statusFilter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"
                        )}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text" placeholder="Cari plat, nama, atau model..." value={searchTerm}
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
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">Rp {(service.totalAmount || 0).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onPrint(service.id); }}
                            className="ml-4 p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
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
const SubscriptionView = ({ user, onNavigate, onLogout }: { user: User, onNavigate: (tab: string) => void, onLogout: () => void }) => {
    const isTrial = useMemo(() => {
        if (user.subscription.tier !== 'Free') return false;
        const regDate = new Date(user.createdAt);
        const now = new Date();
        const diffTime = now.getTime() - regDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 3;
    }, [user]);

    return (
        <div className="space-y-6 pb-20">
            <div className={cn(
                "p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden",
                isTrial ? "bg-emerald-600 shadow-emerald-100" : "bg-blue-600 shadow-blue-100"
            )}>
                <Sparkles className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 rotate-12" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Status Paket</p>
                            <h3 className="text-3xl font-black">
                                {isTrial ? "MASA TRIAL" : user.subscription.tier.toUpperCase()}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            {isTrial ? <Sparkles className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold opacity-80">
                        <Clock className="w-4 h-4" />
                        {isTrial ? "Trial berakhir 3 hari dari pendaftaran" : `Berlaku hingga ${format(new Date(user.subscription.expiryDate), 'd MMMM yyyy')}`}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Pengaturan Bengkel</h4>
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
                <button
                    onClick={() => onNavigate('staff')}
                    className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-center active:scale-95 transition-all"
                >
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline underline-offset-4">Akses Karyawan</span>
                </button>
                <button className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-center active:scale-95 transition-all">
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline underline-offset-4">Info Tagihan</span>
                </button>
            </div>

            <button
                onClick={onLogout}
                className="w-full h-16 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95"
            >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Logout dari Akun</span>
            </button>
        </div>
    );
};

// --- Expense Management ---
const ExpenseView = ({ expenses, onAdd, onDelete }: { expenses: Expense[], onAdd: () => void, onDelete: (id: string) => void }) => {
    return (
        <div className="space-y-4 pb-20">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-600" /> Pengeluaran Operasional
                    </h2>
                </div>
                <div className="space-y-3">
                    {expenses.map((e) => (
                        <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase mb-0.5">{e.category}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{e.note || 'Tidak ada catatan'}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{format(new Date(e.date), 'dd MMM yyyy')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-rose-600">-Rp {(e.amount || 0).toLocaleString()}</span>
                                <button onClick={() => onDelete(e.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {expenses.length === 0 && (
                        <div className="text-center py-10 opacity-30">
                            <Wallet className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Belum ada pengeluaran</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={onAdd}
                    className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all"
                >
                    + Catat Pengeluaran Baru
                </button>
            </div>
        </div>
    );
};

// --- Supplier Management ---
const SupplierView = ({ suppliers, onAdd, onEdit, onDelete }: { suppliers: Supplier[], onAdd: () => void, onEdit: (s: Supplier) => void, onDelete: (id: string) => void }) => {
    return (
        <div className="space-y-4 pb-20">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-600" /> Daftar Pemasok (Suppliers)
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suppliers.map((s) => (
                        <div key={s.id} className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                    <Store className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEdit(s)} className="p-2 text-slate-400 hover:text-blue-600">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(s.id)} className="p-2 text-slate-400 hover:text-rose-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{s.name}</h3>
                            <div className="space-y-1">
                                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                    <Phone className="w-3 h-3" /> {s.contact}
                                </p>
                                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                    <Filter className="w-3 h-3" /> {s.address}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={onAdd}
                    className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all"
                >
                    + Tambah Pemasok Baru
                </button>
            </div>
        </div>
    );
};

interface CompanySettings {
    name: string;
    slogan: string;
    address: string;
    phone: string;
    footerNote: string;
}

// --- Invoice / Receipt Modal ---
const InvoiceModal = ({ service, settings, onClose }: { service: WorkshopService | undefined, settings: CompanySettings, onClose: () => void }) => {
    if (!service) return null;
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 no-print">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] printable-area-container"
            >
                {/* Header - Non printable */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 no-print">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" /> Nota Digital
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Invoice Body */}
                <div className="flex-1 overflow-y-auto p-10 font-sans bg-white printable-area">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-blue-600 tracking-tighter uppercase italic leading-none mb-1">{settings.name}</h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{settings.slogan}</p>
                            {settings.address && <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{settings.address}</p>}
                            {settings.phone && <p className="text-[8px] font-bold text-slate-400 uppercase">Telp: {settings.phone}</p>}
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">INV#{service.id.slice(0, 8)}</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(service.createdAt), 'dd MMM yyyy • HH:mm')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100 border-dashed">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pelanggan</p>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-black text-slate-900 uppercase">{service.customerName}</p>
                                <p className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase w-fit">{service.vehiclePlate}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">{service.vehicleModel}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Servis</p>
                            <div className="flex flex-col gap-1 items-end">
                                <p className="text-xs font-black text-slate-900 uppercase">{service.serviceType}</p>
                                <p className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                                    service.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    Status: {service.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-10">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                            <span>Rincian Pekerjaan</span>
                            <span>Subtotal</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 pr-6">
                                    <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">Jasa Mekanik</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Biaya Penanganan & Analisis</p>
                                </div>
                                <span className="text-xs font-black text-slate-900 tracking-tight">Rp {(service.laborFee || 0).toLocaleString()}</span>
                            </div>
                            {service.partsUsed.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-start">
                                    <div className="flex-1 pr-6">
                                        <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">{p.name || 'Sparepart'}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">Jumlah: {p.quantity || 1} • @Rp {(p.priceAtTime || 0).toLocaleString()}</p>
                                    </div>
                                    <span className="text-xs font-black text-slate-900 tracking-tight">Rp {((p.priceAtTime || 0) * (p.quantity || 1)).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Bayar</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Lunas & Selesai</p>
                            </div>
                            <p className="text-3xl font-black text-blue-600 tracking-tighter">Rp {(service.totalAmount || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center space-y-3 opacity-60">
                        <div className="w-12 h-0.5 bg-slate-100 mx-auto" />
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">{settings.name} • Terima Kasih</p>
                        <p className="text-[8px] font-bold text-slate-400 max-w-[220px] mx-auto uppercase tracking-tighter">{settings.footerNote}</p>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4 no-print">
                    <button
                        className="h-14 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors border border-slate-100"
                    >
                        <Share2 className="w-4 h-4" /> Share WA
                    </button>
                    <button
                        onClick={handlePrint}
                        className="h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                    >
                        <Printer className="w-4 h-4" /> Cetak Nota
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Staff Management Component ---
const StaffView = ({ staff, onAdd, onEdit, onDelete }: { staff: any[], onAdd: () => void, onEdit: (s: any) => void, onDelete: (id: string) => void }) => {
    return (
        <div className="space-y-4 pb-20">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Daftar Karyawan</h3>
                <div className="space-y-3">
                    {staff.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <UserCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.role} • Shift {s.shifts}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                    s.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                )}>
                  {s.status}
                </span>
                                <button onClick={() => onEdit(s)} className="p-2 text-slate-400 hover:text-blue-600">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDelete(s.id)} className="p-2 text-slate-400 hover:text-rose-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {staff.length === 0 && (
                        <div className="text-center py-10 opacity-40">
                            <UserCircle className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest">Belum ada karyawan</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={onAdd}
                    className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all"
                >
                    + Tambah Karyawan Baru
                </button>
            </div>
        </div>
    );
};

// --- Settings View ---
const SettingsView = ({ settings, onUpdate }: { settings: CompanySettings, onUpdate: (s: CompanySettings) => void }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Template Invoice & Profil Bisnis</h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nama Bengkel</label>
                            <input
                                value={localSettings.name}
                                onChange={e => setLocalSettings({...localSettings, name: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-blue-200 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Slogan</label>
                            <input
                                value={localSettings.slogan}
                                onChange={e => setLocalSettings({...localSettings, slogan: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-blue-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nomor Telepon</label>
                            <input
                                value={localSettings.phone}
                                onChange={e => setLocalSettings({...localSettings, phone: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-blue-200 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Alamat Lengkap</label>
                            <input
                                value={localSettings.address}
                                onChange={e => setLocalSettings({...localSettings, address: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-blue-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Catatan Kaki (Footer Note)</label>
                        <textarea
                            rows={3}
                            value={localSettings.footerNote}
                            onChange={e => setLocalSettings({...localSettings, footerNote: e.target.value})}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-blue-200 outline-none resize-none"
                        />
                    </div>

                    <button
                        onClick={() => onUpdate(localSettings)}
                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] border border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Preview Tampilan</p>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 inline-block text-left max-w-xs scale-90 origin-top">
                    <h4 className="text-sm font-black text-blue-600 uppercase italic">{localSettings.name}</h4>
                    <p className="text-[8px] font-bold text-slate-400 mb-2">{localSettings.slogan}</p>
                    <div className="h-0.5 bg-slate-50 mb-2" />
                    <p className="text-[7px] text-slate-400 italic">"{localSettings.footerNote}"</p>
                </div>
            </div>
        </div>
    );
};

// --- Staff Form ---
const StaffForm = ({ staff, onSave, onCancel }: { staff?: any, onSave: (s: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(staff || {
        id: 'STF-' + Math.floor(Math.random() * 1000),
        name: '',
        role: 'Mekanik',
        status: 'Active',
        shifts: 'Pagi',
        email: '',
        password: ''
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Karyawan</label>
                <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    placeholder="e.g. Ahmad"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Login</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    placeholder="Set password untuk karyawan"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Peran Akses</label>
                    <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    >
                        <option value="Mekanik">Mekanik</option>
                        <option value="Kasir">Kasir</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Shift Kerja</label>
                    <select
                        value={formData.shifts}
                        onChange={e => setFormData({ ...formData, shifts: e.target.value })}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    >
                        <option value="Pagi">Pagi (08:00 - 16:00)</option>
                        <option value="Sore">Sore (13:00 - 21:00)</option>
                        <option value="Full">Full Day</option>
                    </select>
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status Karyawan</label>
                <div className="flex gap-2">
                    {['Active', 'Inactive'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFormData({...formData, status: s})}
                            className={cn(
                                "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                formData.status === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Login Karyawan</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold shadow-inner"
                    placeholder="Password untuk login karyawan"
                />
            </div>

            <div className="flex gap-2 pt-4">
                <button onClick={onCancel} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button onClick={() => onSave(formData)} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100">Simpan</button>
            </div>
        </div>
    );
};

// --- Expense Form ---
const ExpenseForm = ({ expense, onSave, onCancel }: { expense?: Expense, onSave: (e: Expense) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Expense>(expense || {
        id: 'EXP-' + Math.floor(Math.random() * 10000),
        category: 'Suku Cadang',
        amount: 0,
        note: '',
        date: new Date().toISOString()
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kategori Pengeluaran</label>
                <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                >
                    <option value="Suku Cadang">Pembelian Suku Cadang</option>
                    <option value="Operasional">Operasional (Listrik/Air/Internet)</option>
                    <option value="Sewa">Sewa Tempat</option>
                    <option value="Gaji">Gaji Karyawan</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah (Rp)</label>
                <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    placeholder="0"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Catatan Tambahan</label>
                <textarea
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold resize-none"
                    placeholder="e.g. Pembayaran listrik April 2024"
                />
            </div>
            <div className="flex gap-2 pt-4">
                <button onClick={onCancel} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button onClick={() => onSave(formData)} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100">Simpan Catatan</button>
            </div>
        </div>
    );
};

// --- Supplier Form ---
const SupplierForm = ({ supplier, onSave, onCancel }: { supplier?: Supplier, onSave: (s: Supplier) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Supplier>(supplier || {
        id: 'SUP-' + Math.floor(Math.random() * 1000),
        name: '',
        contact: '',
        address: ''
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Pemasok</label>
                <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    placeholder="e.g. Toko Onderdil Berkah"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kontak (HP/WA)</label>
                <input
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    placeholder="08xxxxxxxxxx"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alamat / Lokasi</label>
                <input
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    placeholder="Alamat supplier"
                />
            </div>
            <div className="flex gap-2 pt-4">
                <button onClick={onCancel} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button onClick={() => onSave(formData)} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100">Simpan Supplier</button>
            </div>
        </div>
    );
};

// --- Add Part Modal Content ---
const PartForm = ({ part, suppliers, onSave, onCancel }: { part?: SparePart, suppliers: Supplier[], onSave: (p: SparePart) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<SparePart>(part || {
        id: 'P' + Math.floor(Math.random() * 1000),
        name: '',
        price: 0,
        purchasePrice: 0,
        stock: 0,
        minStock: 5,
        category: 'Oli',
        lastUpdated: new Date().toISOString(),
        supplierId: ''
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Part</label>
                <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Harga Jual</label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Harga Beli</label>
                    <input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Stok Awal</label>
                    <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kategori</label>
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                    >
                        {['Oli', 'Rem', 'Busi', 'Filter', 'Kelistrikan', 'Ban'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pemasok / Supplier Terhubung</label>
                <select
                    value={formData.supplierId || ''}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value || undefined })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                >
                    <option value="">-- Tanpa Hubungan Supplier (Atur Nanti) --</option>
                    {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.contact})</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2 pt-4">
                <button onClick={onCancel} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button onClick={() => onSave(formData)} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100">Simpan</button>
            </div>
        </div>
    );
};

// --- Customer Form ---
const CustomerForm = ({ customer, onSave, onCancel }: { customer?: Customer, onSave: (c: Customer) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Customer>(customer || {
        id: 'CUST-' + Math.floor(Math.random() * 1000),
        name: '',
        phone: '',
        email: '',
        address: '',
        totalServiceCount: 0
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Lengkap</label>
                <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">No. Telepon (WhatsApp)</label>
                <input
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                />
            </div>
            <div className="flex gap-2 pt-4">
                <button onClick={onCancel} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button onClick={() => onSave(formData)} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100">Simpan</button>
            </div>
        </div>
    );
};

// --- Subscription Guard ---
const SubscriptionGuard = ({ children, user }: { children: React.ReactNode, user: User | null }) => {
    if (!user) return null;

    // Jika sudah bayar (bukan Free), langsung lolos
    if (user.subscription.tier !== 'Free') return <>{children}</>;

    // Cek masa trial 3 hari
    const regDate = new Date(user.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - regDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) return <>{children}</>;

    return (
        <div className="relative min-h-[400px] flex items-center justify-center p-8 bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10" />
            <div className="relative z-20 text-center max-w-sm">
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6 shadow-sm">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Masa Trial Berakhir</h3>
                <p className="text-sm text-slate-500 font-medium mb-6">
                    Masa percobaan 3 hari Anda telah selesai. Silakan berlangganan paket PRO untuk terus menggunakan fitur pengelolaan karyawan dan laporan mendalam.
                </p>
                <button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 active:scale-95 transition-all">
                    Lihat Pilihan Paket
                </button>
            </div>

            {/* Background patterns */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
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
const AddStockForm = ({ parts, suppliers, onSave }: { parts: SparePart[], suppliers: Supplier[], onSave: (partId: string, amount: number, supplierId: string, costPrice: number) => void }) => {
    const [selectedPartId, setSelectedPartId] = useState(parts[0]?.id || '');
    const [amount, setAmount] = useState('0');

    const currentPart = useMemo(() => parts.find(p => p.id === selectedPartId), [parts, selectedPartId]);
    const [costPrice, setCostPrice] = useState('0');
    const [selectedSupplierId, setSelectedSupplierId] = useState('');

    useEffect(() => {
        if (currentPart) {
            setCostPrice(String(currentPart.purchasePrice || 0));
            setSelectedSupplierId(currentPart.supplierId || suppliers[0]?.id || '');
        }
    }, [selectedPartId, currentPart, suppliers]);

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pilih Sparepart</label>
                <select
                    value={selectedPartId}
                    onChange={e => setSelectedPartId(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
                >
                    {parts.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah Tambahan</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
                        placeholder="0"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Harga Beli Baru (per Pcs)</label>
                    <input
                        type="number"
                        value={costPrice}
                        onChange={e => setCostPrice(e.target.value)}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pilih Pemasok / Supplier</label>
                <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
                >
                    {suppliers.length === 0 && <option value="">-- Daftarkan supplier terlebih dahulu --</option>}
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.contact})</option>)}
                </select>
            </div>

            <button
                onClick={() => onSave(selectedPartId, Number(amount), selectedSupplierId, Number(costPrice))}
                disabled={!selectedSupplierId || Number(amount) <= 0}
                className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
                Tambah Stok & Simpan Transaksi
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
                            <span className="font-black text-slate-900">Rp {((p.priceAtTime || 0) * (p.quantity || 0)).toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-600">Labor Fee</span>
                        <span className="font-black text-slate-900 space-x-1">
              <span>Rp</span>
              <span>{(service.laborFee || 0).toLocaleString()}</span>
            </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t-2 border-slate-200">
                        <span className="font-black text-blue-600 uppercase tracking-widest">Total</span>
                        <span className="font-black text-blue-600 space-x-1">
              <span>Rp</span>
              <span>{(service.totalAmount || 0).toLocaleString()}</span>
            </span>
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
const ReportsView = ({ services, expenses }: { services: WorkshopService[], expenses: Expense[] }) => {
    const [filterType, setFilterType] = useState<'day' | 'month' | 'year' | 'custom'>('month');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [customRange, setCustomRange] = useState({
        start: format(new Date(), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    const filteredData = useMemo(() => {
        let start: Date;
        let end: Date;

        if (filterType === 'day') {
            const d = parseISO(selectedDate);
            start = startOfDay(d);
            end = endOfDay(d);
        } else if (filterType === 'month') {
            const d = parseISO(`${selectedMonth}-01`);
            start = startOfMonth(d);
            end = endOfMonth(d);
        } else if (filterType === 'year') {
            const d = new Date(selectedYear, 0, 1);
            start = startOfYear(d);
            end = endOfYear(d);
        } else {
            start = startOfDay(parseISO(customRange.start));
            end = endOfDay(parseISO(customRange.end));
        }

        const filteredServices = services.filter(s => {
            const date = parseISO(s.createdAt);
            return isWithinInterval(date, { start, end });
        });

        const filteredExpenses = expenses.filter(e => {
            const date = parseISO(e.date);
            return isWithinInterval(date, { start, end });
        });

        return { filteredServices, filteredExpenses };
    }, [services, expenses, filterType, selectedDate, selectedMonth, selectedYear, customRange]);

    const stats = useMemo(() => {
        const { filteredServices, filteredExpenses } = filteredData;
        const totalRevenue = filteredServices.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
        const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        const labor = filteredServices.reduce((acc, s) => acc + (s.laborFee || 0), 0);
        const partsRevenue = totalRevenue - labor;
        const netProfit = totalRevenue - totalExpenses;
        return { totalRevenue, totalExpenses, labor, partsRevenue, netProfit };
    }, [filteredData]);

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];
    const pieData = [
        { name: 'Labor', value: stats.labor },
        { name: 'Parts', value: stats.partsRevenue },
    ];

    const summaryData = [
        { label: 'Total Sales', value: stats.totalRevenue, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Expenses', value: stats.totalExpenses, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Net Profit', value: stats.netProfit, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const performanceData = useMemo(() => {
        const { filteredServices } = filteredData;
        const serviceGroups: Record<string, number> = {};
        filteredServices.forEach(s => {
            serviceGroups[s.serviceType] = (serviceGroups[s.serviceType] || 0) + 1;
        });
        return Object.entries(serviceGroups).map(([name, val]) => ({ name, val }));
    }, [filteredData]);

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        {[
                            { id: 'day', label: 'Harian' },
                            { id: 'month', label: 'Bulanan' },
                            { id: 'year', label: 'Tahunan' },
                            { id: 'custom', label: 'Custom' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id as any)}
                                className={cn(
                                    "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    filterType === type.id
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-4 items-end">
                        {filterType === 'day' && (
                            <div className="flex-1 min-w-[200px] space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Tanggal</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-200"
                                />
                            </div>
                        )}
                        {filterType === 'month' && (
                            <div className="flex-1 min-w-[200px] space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Bulan</label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={e => setSelectedMonth(e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-200"
                                />
                            </div>
                        )}
                        {filterType === 'year' && (
                            <div className="flex-1 min-w-[200px] space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Tahun</label>
                                <select
                                    value={selectedYear}
                                    onChange={e => setSelectedYear(Number(e.target.value))}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-200"
                                >
                                    {[0, 1, 2, 3, 4].map(i => {
                                        const year = new Date().getFullYear() - i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                        )}
                        {filterType === 'custom' && (
                            <div className="flex flex-1 gap-3 min-w-[300px]">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mulai</label>
                                    <input
                                        type="date"
                                        value={customRange.start}
                                        onChange={e => setCustomRange({...customRange, start: e.target.value})}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-200"
                                    />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai</label>
                                    <input
                                        type="date"
                                        value={customRange.end}
                                        onChange={e => setCustomRange({...customRange, end: e.target.value})}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-200"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {summaryData.map((s) => (
                    <div key={s.label} className={cn("p-4 rounded-3xl border border-slate-100 shadow-sm", s.bg)}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={cn("text-xs sm:text-sm font-black", s.color)}>Rp {(s.value >= 1000 || s.value < 0 ? (s.value / 1000).toFixed(1) + 'k' : s.value)}</p>
                    </div>
                ))}
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
                            <Tooltip formatter={(value: number) => `Rp ${(value || 0).toLocaleString()}`} />
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
                        <BarChart data={performanceData}>
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
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [showPOSForm, setShowPOSForm] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([
        { id: 'SUP-1', name: 'Distributor Suku Cadang A', contact: '0812345678', address: 'Jl. Industri No. 10' }
    ]);
    const [parts, setParts] = useState<SparePart[]>(() =>
        INITIAL_PARTS.map((p, index) => index % 2 === 0 ? { ...p, supplierId: 'SUP-1' } : p)
    );
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([
        {
            id: 'PR-1',
            partId: 'P001',
            supplierId: 'SUP-1',
            quantity: 12,
            costPrice: 75000,
            date: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
        },
        {
            id: 'PR-2',
            partId: 'P003',
            supplierId: 'SUP-1',
            quantity: 10,
            costPrice: 45000,
            date: new Date(Date.now() - 3600000 * 12).toISOString()
        }
    ]);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
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
    const [staff, setStaff] = useState<any[]>([
        { id: 'STF-1', name: 'Ani', role: 'Kasir', status: 'Active', shifts: 'Pagi' },
        { id: 'STF-2', name: 'Bambang', role: 'Mekanik', status: 'Active', shifts: 'Sore' },
    ]);
    const [editingStaff, setEditingStaff] = useState<any | null>(null);
    const [companySettings, setCompanySettings] = useState<CompanySettings>({
        name: "Bengkel Kita",
        slogan: "Solusi Perawatan Terpercaya",
        address: "Jl. Otomotif Raya No. 123, Jakarta",
        phone: "021-555-1234",
        footerNote: "Kendaraan yang servis teratur akan memiliki performa yang lebih awet dan nilai jual yang stabil."
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, inBottom: true, roles: ['Admin'] },
        { id: 'pos', label: 'Transaksi', icon: PaymentIcon, inBottom: true, roles: ['Admin', 'Kasir'] },
        { id: 'settings', label: 'Pengaturan', icon: Settings, inBottom: false, roles: ['Admin'] },
        { id: 'pos_history', label: 'Antrean', icon: Wrench, inBottom: true, roles: ['Admin', 'Kasir', 'Mekanik'] },
        { id: 'customers', label: 'Pelanggan', icon: Users, inBottom: false, roles: ['Admin', 'Kasir'] },
        { id: 'inventory', label: 'Stok Barang', icon: Package, inBottom: false, roles: ['Admin', 'Kasir'] },
        { id: 'suppliers', label: 'Pemasok', icon: Store, inBottom: false, roles: ['Admin'] },
        { id: 'expenses', label: 'Pengeluaran', icon: Wallet, inBottom: false, roles: ['Admin'] },
        { id: 'reports', label: 'Laporan', icon: TrendingUp, inBottom: false, roles: ['Admin'] },
        { id: 'staff', label: 'Karyawan', icon: UserCircle, inBottom: false, roles: ['Admin'] },
        { id: 'subscription', label: 'Langganan', icon: ShieldCheck, inBottom: false, roles: ['Admin'] },
    ];

    const filteredNavItems = useMemo(() => {
        if (!currentUser) return [];
        return navItems.filter(item => item.roles.includes(currentUser.role));
    }, [currentUser, navItems]);

    useEffect(() => {
        if (currentUser) {
            const allowed = filteredNavItems.map(i => i.id);
            if (!allowed.includes(activeTab)) {
                setActiveTab(allowed[0] || 'dashboard');
            }
        }
    }, [currentUser, filteredNavItems, activeTab]);

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
        setSelectedInvoiceId(service.id);
        setActiveTab('pos');
    };

    const handleUpdateStatus = (id: string, newStatus: ServiceStatus) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        setSelectedServiceId(null);
    };

    const handleAddStock = (partId: string, amount: number, supplierId: string, costPrice: number) => {
        setParts(prev => prev.map(p => {
            if (p.id === partId) {
                return {
                    ...p,
                    stock: p.stock + amount,
                    supplierId: supplierId || p.supplierId,
                    purchasePrice: costPrice > 0 ? costPrice : p.purchasePrice
                };
            }
            return p;
        }));

        if (amount > 0 && supplierId) {
            const newPurchase: PurchaseRecord = {
                id: 'PR-' + Math.floor(Math.random() * 100000),
                partId,
                supplierId,
                quantity: amount,
                costPrice: costPrice || 0,
                date: new Date().toISOString()
            };
            setPurchases(prev => [newPurchase, ...prev]);

            // Atur otomatis pengeluaran baru dari pembelian sparepart ini
            const part = parts.find(p => p.id === partId);
            const supplier = suppliers.find(s => s.id === supplierId);
            const partName = part ? part.name : 'Suku Cadang';
            const supplierName = supplier ? supplier.name : 'Supplier';
            const totalCost = (costPrice || 0) * amount;

            const newExpense: Expense = {
                id: 'EXP-' + Math.floor(Math.random() * 100000),
                category: 'Suku Cadang',
                amount: totalCost,
                note: `Beli Stok ${partName} x${amount} Pcs dari ${supplierName}`,
                date: new Date().toISOString()
            };
            setExpenses(prev => [newExpense, ...prev]);
        }

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
                        {filteredNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
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
                                {filteredNavItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
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
                                        activeTab === 'pos' ? 'Transaksi' :
                                            activeTab === 'pos_history' ? 'Antrean Servis' :
                                                activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{format(new Date(), 'EEEE, d MMMM')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!showPOSForm && (currentUser?.role === 'Admin' || currentUser?.role === 'Kasir') && (
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
                        {!showPOSForm && activeTab === 'dashboard' && currentUser && (
                            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <Dashboard services={services} parts={parts} user={currentUser} onPrint={setSelectedInvoiceId} />
                            </motion.div>
                        )}

                        {!showPOSForm && activeTab === 'pos' && (
                            <motion.div key="pos-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Orders</h3>
                                        <p className="text-sm font-bold text-slate-900">{services.filter(s => s.status !== 'Done').length} In Progress</p>
                                    </div>
                                    {(currentUser?.role === 'Admin' || currentUser?.role === 'Kasir') && (
                                        <button onClick={() => setShowPOSForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                                            New Transaction
                                        </button>
                                    )}
                                </div>
                                <HistoryView services={services} onSelect={setSelectedServiceId} onPrint={setSelectedInvoiceId} />
                            </motion.div>
                        )}

                        {!showPOSForm && activeTab === 'pos_history' && (
                            <motion.div key="pos-history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Kerja Mekanik</h3>
                                    <p className="text-sm font-bold text-slate-900">{services.filter(s => s.status !== 'Done').length} Kendaraan Menunggu</p>
                                </div>
                                <HistoryView
                                    services={services}
                                    onSelect={setSelectedServiceId}
                                    onPrint={setSelectedInvoiceId}
                                    initialFilter="In Progress"
                                />
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
                                    suppliers={suppliers}
                                    purchases={purchases}
                                    onAdd={() => setEditingPart({} as SparePart)}
                                    onAddStock={() => setShowAddStock(true)}
                                    onEdit={(p) => setEditingPart(p)}
                                    onDelete={(id) => setParts(prev => prev.filter(x => x.id !== id))}
                                />
                                <button
                                    onClick={() => setShowAddStock(true)}
                                    className="fixed bottom-24 right-4 w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-amber-100 md:hidden"
                                >
                                    <Package className="w-6 h-6" />
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'customers' && !showPOSForm && (
                            <motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <CustomersView
                                    customers={customers}
                                    onAdd={() => setEditingCustomer({} as Customer)}
                                    onEdit={(c) => setEditingCustomer(c)}
                                    onDelete={(id) => setCustomers(prev => prev.filter(x => x.id !== id))}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'staff' && !showPOSForm && (
                            <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <StaffView
                                    staff={staff}
                                    onAdd={() => setEditingStaff({})}
                                    onEdit={(s) => setEditingStaff(s)}
                                    onDelete={(id) => setStaff(prev => prev.filter(x => x.id !== id))}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'expenses' && !showPOSForm && (
                            <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ExpenseView
                                    expenses={expenses}
                                    onAdd={() => setEditingExpense({} as Expense)}
                                    onDelete={(id) => setExpenses(prev => prev.filter(x => x.id !== id))}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'suppliers' && !showPOSForm && (
                            <motion.div key="suppliers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <SupplierView
                                    suppliers={suppliers}
                                    onAdd={() => setEditingSupplier({} as Supplier)}
                                    onEdit={(s) => setEditingSupplier(s)}
                                    onDelete={(id) => setSuppliers(prev => prev.filter(x => x.id !== id))}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'reports' && !showPOSForm && (
                            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <SubscriptionGuard user={currentUser}>
                                    <ReportsView services={services} expenses={expenses} />
                                </SubscriptionGuard>
                            </motion.div>
                        )}

                        {activeTab === 'subscription' && !showPOSForm && (
                            <motion.div key="subscription" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <SubscriptionView
                                    user={currentUser}
                                    onNavigate={setActiveTab}
                                    onLogout={() => setCurrentUser(null)}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'settings' && currentUser?.role === 'Admin' && !showPOSForm && (
                            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <SettingsView settings={companySettings} onUpdate={setCompanySettings} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Navigation for Mobile */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around h-18 px-6 pb-2 z-40">
                    {filteredNavItems.filter(i => i.inBottom).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
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
                        <Modal title="Tambah Stok Barang" onClose={() => setShowAddStock(false)}>
                            <AddStockForm
                                parts={parts}
                                suppliers={suppliers}
                                onSave={handleAddStock}
                            />
                        </Modal>
                    )}

                    {editingPart && (
                        <Modal title={editingPart.name ? "Edit Part" : "Tambah Part Baru"} onClose={() => setEditingPart(null)}>
                            <PartForm
                                part={editingPart.name ? editingPart : undefined}
                                suppliers={suppliers}
                                onSave={(p) => {
                                    if (editingPart.name) {
                                        setParts(prev => prev.map(x => x.id === p.id ? p : x));
                                    } else {
                                        setParts(prev => [p, ...prev]);
                                    }
                                    setEditingPart(null);
                                }}
                                onCancel={() => setEditingPart(null)}
                            />
                        </Modal>
                    )}

                    {editingCustomer && (
                        <Modal title={editingCustomer.name ? "Edit Pelanggan" : "Tambah Pelanggan Baru"} onClose={() => setEditingCustomer(null)}>
                            <CustomerForm
                                customer={editingCustomer.name ? editingCustomer : undefined}
                                onSave={(c) => {
                                    if (editingCustomer.name) {
                                        setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
                                    } else {
                                        setCustomers(prev => [c, ...prev]);
                                    }
                                    setEditingCustomer(null);
                                }}
                                onCancel={() => setEditingCustomer(null)}
                            />
                        </Modal>
                    )}

                    {editingExpense && (
                        <Modal title={editingExpense.category ? "Catat Pengeluaran" : "Pengeluaran Baru"} onClose={() => setEditingExpense(null)}>
                            <ExpenseForm
                                expense={editingExpense.amount ? editingExpense : undefined}
                                onSave={(e) => {
                                    if (editingExpense.amount) {
                                        setExpenses(prev => prev.map(x => x.id === e.id ? e : x));
                                    } else {
                                        setExpenses(prev => [e, ...prev]);
                                    }
                                    setEditingExpense(null);
                                }}
                                onCancel={() => setEditingExpense(null)}
                            />
                        </Modal>
                    )}

                    {editingSupplier && (
                        <Modal title={editingSupplier.name ? "Edit Supplier" : "Tambah Supplier Baru"} onClose={() => setEditingSupplier(null)}>
                            <SupplierForm
                                supplier={editingSupplier.name ? editingSupplier : undefined}
                                onSave={(s) => {
                                    if (editingSupplier.name) {
                                        setSuppliers(prev => prev.map(x => x.id === s.id ? s : x));
                                    } else {
                                        setSuppliers(prev => [s, ...prev]);
                                    }
                                    setEditingSupplier(null);
                                }}
                                onCancel={() => setEditingSupplier(null)}
                            />
                        </Modal>
                    )}

                    {editingStaff && (
                        <Modal title={editingStaff.name ? "Edit Karyawan" : "Tambah Karyawan Baru"} onClose={() => setEditingStaff(null)}>
                            <StaffForm
                                staff={editingStaff.name ? editingStaff : undefined}
                                onSave={(s) => {
                                    if (editingStaff.name) {
                                        setStaff(prev => prev.map(x => x.id === s.id ? s : x));
                                    } else {
                                        setStaff(prev => [s, ...prev]);
                                    }
                                    setEditingStaff(null);
                                }}
                                onCancel={() => setEditingStaff(null)}
                            />
                        </Modal>
                    )}


                    {selectedInvoiceId && (
                        <InvoiceModal
                            service={services.find(s => s.id === selectedInvoiceId)}
                            settings={companySettings}
                            onClose={() => setSelectedInvoiceId(null)}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
