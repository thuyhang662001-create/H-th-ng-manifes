/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  FileText,
  CheckCircle2,
  ListFilter,
  Search,
  Database,
  Activity,
  Sparkles,
  Calculator,
  TrendingUp,
  Coins,
  Globe,
  Settings,
  HelpCircle,
  X,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';

// Core Type Definitions
interface ShipRecord {
  id: string;
  mawb: string;
  hawb: string;
  route: string;
  weight: number;
  unitPrice: number;
  handling: number;
  whCharge: number;
}

interface ManifestFile {
  id: string;
  filename: string;
  shipperName: string;
  date: string;
  status: 'processed' | 'stored' | 'pending';
  records: ShipRecord[];
}

// Initial Preset Database Seed Data
const DEFAULT_MANIFESTS: ManifestFile[] = [
  {
    id: 'm1',
    filename: 'MANIFEST_SGN_20241021.xlsx',
    shipperName: 'LG ELECTRONICS',
    date: '25/10/2024',
    status: 'processed',
    records: [
      {
        id: 'r11',
        mawb: '994-33069691 T/S HAN',
        hawb: 'LG-SGN-001',
        route: 'SGN-HAN-ICN',
        weight: 158.0,
        unitPrice: 2.45,
        handling: 10.0,
        whCharge: 45.5,
      },
      {
        id: 'r12',
        mawb: '180-18407734 TCS',
        hawb: 'LG-SGN-002',
        route: 'SGN-ICN',
        weight: 52.5,
        unitPrice: 1.8,
        handling: 10.0,
        whCharge: 12.0,
      },
      {
        id: 'r13',
        mawb: '160-56128092 HAN-SGN',
        hawb: 'LG-SGN-003',
        route: 'SGN-HAN-ICN',
        weight: 340.0,
        unitPrice: 2.1,
        handling: 15.0,
        whCharge: 85.0,
      },
      {
        id: 'r14',
        mawb: '618-90237741 SGN-ICN',
        hawb: 'LG-SGN-004',
        route: 'SGN-ICN',
        weight: 98.0,
        unitPrice: 1.95,
        handling: 10.0,
        whCharge: 24.5,
      }
    ]
  },
  {
    id: 'm2',
    filename: 'MAERSK_MANIFEST_20241020.csv',
    shipperName: 'SAMSUNG DISPLAY',
    date: '20/10/2024',
    status: 'stored',
    records: [
      {
        id: 'r21',
        mawb: '741-20938401 MAERSK T/S HAN',
        hawb: 'SEC-SGN-801',
        route: 'SGN-HAN-ICN',
        weight: 1250.0,
        unitPrice: 2.2,
        handling: 25.0,
        whCharge: 150.0,
      },
      {
        id: 'r22',
        mawb: '020-48201923 DIRECT',
        hawb: 'SEC-SGN-802',
        route: 'SGN-ICN',
        weight: 420.0,
        unitPrice: 1.75,
        handling: 15.0,
        whCharge: 48.0,
      },
      {
        id: 'r23',
        mawb: '741-20938999 T/S HAN',
        hawb: 'SEC-SGN-803',
        route: 'SGN-HAN-ICN',
        weight: 850.1,
        unitPrice: 2.15,
        handling: 20.0,
        whCharge: 95.0,
      }
    ]
  },
  {
    id: 'm3',
    filename: 'SGN_ICN_SHIPMENT_LIST.xlsx',
    shipperName: 'INTEL VIETNAM',
    date: '24/10/2024',
    status: 'stored',
    records: [
      {
        id: 'r31',
        mawb: '125-99228833 DHL CARGO',
        hawb: 'INT-SGN-9901',
        route: 'SGN-ICN',
        weight: 74.0,
        unitPrice: 3.1,
        handling: 12.0,
        whCharge: 38.0,
      },
      {
        id: 'r32',
        mawb: '125-99228841 DHL SPECIAL',
        hawb: 'INT-SGN-9902',
        route: 'SGN-HAN-ICN',
        weight: 145.0,
        unitPrice: 3.4,
        handling: 12.0,
        whCharge: 62.0,
      }
    ]
  },
  {
    id: 'm4',
    filename: 'INBOUND_HAN_SGN_LIST.xlsx',
    shipperName: 'FOXCONN TECHNOLOGY',
    date: '23/10/2024',
    status: 'stored',
    records: [
      {
        id: 'r41',
        mawb: '994-33231145 TRANSIT HAN',
        hawb: 'FOX-SGN-234',
        route: 'SGN-HAN-ICN',
        weight: 2855.0,
        unitPrice: 1.95,
        handling: 50.0,
        whCharge: 350.0,
      },
      {
        id: 'r42',
        mawb: '180-88442211 TCS LOCAL',
        hawb: 'FOX-SGN-235',
        route: 'SGN-ICN',
        weight: 640.0,
        unitPrice: 1.65,
        handling: 20.0,
        whCharge: 78.0,
      }
    ]
  }
];

export default function App() {
  // Persistence state
  const [manifests, setManifests] = useState<ManifestFile[]>(() => {
    const local = localStorage.getItem('logistack_manifests');
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* ignore */ }
    }
    return DEFAULT_MANIFESTS;
  });

  const [selectedId, setSelectedId] = useState<string>(() => {
    const local = localStorage.getItem('logistack_selected_id');
    return local || 'm1';
  });

  const [rateInput, setRateInput] = useState<number>(() => {
    const local = localStorage.getItem('logistack_rate');
    return local ? Number(local) : 26160;
  });

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateSliderValue, setRateSliderValue] = useState(rateInput);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals / forms state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newShipperName, setNewShipperName] = useState('GENERAL MOTORS SGN');
  const [rawCsvInput, setRawCsvInput] = useState(
    "MAWB_A_100, HAWB-001, SGN-HAN-ICN, 120, 2.50, 10, 30\nMAWB_B_200, HAWB-002, SGN-ICN, 85, 1.90, 8, 15"
  );
  
  // Feedback states
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [systemLoad, setSystemLoad] = useState({ cpu: 42, memory: 58, files: 4 });
  const [activeShipperFilter, setActiveShipperFilter] = useState<string>('ALL');

  // Time metrics
  const [currentTime, setCurrentTime] = useState<string>('2026-06-19 22:47:08');

  // Auto-save persistence in local storage
  useEffect(() => {
    localStorage.setItem('logistack_manifests', JSON.stringify(manifests));
  }, [manifests]);

  useEffect(() => {
    localStorage.setItem('logistack_selected_id', selectedId);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem('logistack_rate', rateInput.toString());
  }, [rateInput]);

  // Keep live metrics animated
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemLoad(prev => {
        const deltaCpu = Math.floor(Math.random() * 9) - 4; // -4 to +4
        const deltaMem = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return {
          cpu: Math.max(10, Math.min(95, prev.cpu + deltaCpu)),
          memory: Math.max(30, Math.min(90, prev.memory + deltaMem)),
          files: manifests.length
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [manifests.length]);

  // Show Toast helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Find the selected manifest
  const activeManifestIndex = manifests.findIndex(m => m.id === selectedId);
  const activeManifest = activeManifestIndex !== -1 ? manifests[activeManifestIndex] : manifests[0];

  // Shippers collection
  const shippersList = useMemo(() => {
    const set = new Set<string>();
    manifests.forEach(m => {
      if (m.shipperName) set.add(m.shipperName.trim().toUpperCase());
    });
    return Array.from(set);
  }, [manifests]);

  // Filtered Manifests List based on search & shipper filter
  const filteredManifests = useMemo(() => {
    return manifests.filter(m => {
      const matchSearch = m.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.shipperName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchShipper = activeShipperFilter === 'ALL' || m.shipperName.trim().toUpperCase() === activeShipperFilter;
      return matchSearch && matchShipper;
    });
  }, [manifests, searchTerm, activeShipperFilter]);

  // Calculations for active Manifest
  const activeCalculations = useMemo(() => {
    if (!activeManifest || !activeManifest.records) return { items: [], totalUsd: 0, totalVnd: 0 };
    
    const items = activeManifest.records.map(record => {
      // Logic: MAWB contains 'HAN' -> SGN-HAN-ICN or evaluate automatically
      let computedRoute = record.route;
      if (!computedRoute) {
        computedRoute = record.mawb.toUpperCase().includes('HAN') ? 'SGN-HAN-ICN' : 'SGN-ICN';
      }
      
      const totalCostUsd = (record.weight * record.unitPrice) + Number(record.handling) + Number(record.whCharge);
      return {
        ...record,
        route: computedRoute,
        calculatedTotal: Number(totalCostUsd.toFixed(2))
      };
    });

    const totalUsd = items.reduce((sum, item) => sum + item.calculatedTotal, 0);
    const totalVnd = totalUsd * rateInput;

    return {
      items,
      totalUsd: Number(totalUsd.toFixed(2)),
      totalVnd: Math.round(totalVnd)
    };
  }, [activeManifest, rateInput]);

  // Update a field inside active manifest's shipment records
  const updateRecordField = (recordId: string, field: keyof ShipRecord, value: string | number) => {
    if (!activeManifest) return;

    const updatedManifests = manifests.map(m => {
      if (m.id === activeManifest.id) {
        const updatedRecords = m.records.map(r => {
          if (r.id === recordId) {
            let processedValue = value;
            
            // Numeric validation for prices/weights
            if (field === 'weight' || field === 'unitPrice' || field === 'handling' || field === 'whCharge') {
              const numVal = parseFloat(value.toString());
              processedValue = isNaN(numVal) ? 0 : numVal;
            }

            return { ...r, [field]: processedValue };
          }
          return r;
        });
        return { ...m, records: updatedRecords };
      }
      return m;
    });

    setManifests(updatedManifests);
  };

  // Add empty row to the active manifest
  const handleAddNewRow = () => {
    if (!activeManifest) return;

    const newRecord: ShipRecord = {
      id: 'r_new_' + Date.now(),
      mawb: '994-' + Math.floor(10000000 + Math.random() * 90000000).toString() + ' TCS',
      hawb: 'NEW-HAWB-' + Math.floor(100 + Math.random() * 900),
      route: 'SGN-ICN',
      weight: 100.0,
      unitPrice: 2.0,
      handling: 10.0,
      whCharge: 15.0
    };

    const updatedManifests = manifests.map(m => {
      if (m.id === activeManifest.id) {
        return {
          ...m,
          records: [...m.records, newRecord]
        };
      }
      return m;
    });

    setManifests(updatedManifests);
    showToast("Đã chèn hàng trống mới vào bảng Excel", "success");
  };

  // Delete cell row from manifest
  const handleDeleteRow = (recordId: string) => {
    if (!activeManifest) return;

    const updatedManifests = manifests.map(m => {
      if (m.id === activeManifest.id) {
        return {
          ...m,
          records: m.records.filter(r => r.id !== recordId)
        };
      }
      return m;
    });

    setManifests(updatedManifests);
    showToast("Đã xóa dòng hóa đơn", "info");
  };

  // Switch to rate modify
  const applyRateInput = (val: number) => {
    const rawVal = Math.max(1000, Math.min(100000, val));
    setRateInput(rawVal);
    setRateSliderValue(rawVal);
    setIsEditingRate(false);
    showToast(`Đã cập nhật Tỷ giá: ${rawVal.toLocaleString('vi-VN')} VND / USD`, "success");
  };

  // Handle mock file upload creation
  const handleCreateManifest = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFilename = newFilename.trim() || `MANIFEST_RAW_${Date.now().toString().slice(-4)}.xlsx`;
    
    // Parse the textarea rawCsvInput
    // Structure expected: MAWB, HAWB, ROUTE, WEIGHT, UNIT_PRICE, HANDLING, WH_CHARGE
    const lines = rawCsvInput.split('\n');
    const records: ShipRecord[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const parts = line.split(',').map(p => p.trim());
      const mawb = parts[0] || `MAWB-MOCK-${100 + index}`;
      const hawb = parts[1] || `HAWB-${1000 + index}`;
      const route = parts[2] || 'SGN-ICN';
      const weight = parseFloat(parts[3]) || 120.0;
      const unitPrice = parseFloat(parts[4]) || 1.85;
      const handling = parseFloat(parts[5]) || 10.0;
      const whCharge = parseFloat(parts[6]) || 20.0;

      records.push({
        id: `r_added_${index}_${Date.now()}`,
        mawb,
        hawb,
        route,
        weight,
        unitPrice,
        handling,
        whCharge
      });
    });

    const newManifest: ManifestFile = {
      id: `m_added_${Date.now()}`,
      filename: finalFilename,
      shipperName: newShipperName.trim() || 'GENERAL AGENT',
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'processed',
      records
    };

    setManifests(prev => [newManifest, ...prev]);
    setSelectedId(newManifest.id);
    setIsUploadOpen(false);
    setNewFilename('');
    showToast(`Tải lên tài liệu ${finalFilename} thành công!`, "success");
  };

  // Reset to seed data
  const handleResetDatabase = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục về dữ liệu mặc định ban đầu?")) {
      setManifests(DEFAULT_MANIFESTS);
      setSelectedId('m1');
      setRateInput(26160);
      setRateSliderValue(26160);
      setActiveShipperFilter('ALL');
      showToast("Khôi phục cơ sở dữ liệu gốc thành công!", "info");
    }
  };

  // Export spreadsheet as CSV
  const handleExportCSV = () => {
    if (!activeManifest || !activeCalculations.items.length) {
      showToast("Không có hàng hóa nào để xuất dữ liệu!", "error");
      return;
    }

    const titleRow = `BẢNG KÊ HÓA ĐƠN THÁNG 10 NĂM 2024 - SHIPPER: ${activeManifest.shipperName}\n`;
    const rateRow = `Tỷ giá USD/VND: ${rateInput}\n\n`;
    const headerRow = 'MAWB NO,HAWB,ROUTE,WEIGHT (R.W/T),UNIT PRICE ($),HANDLING ($),WH CHARGE ($),TOTAL ($)\n';
    
    const contentRows = activeCalculations.items.map(item => 
      `"${item.mawb}","${item.hawb}","${item.route}",${item.weight},${item.unitPrice},${item.handling},${item.whCharge},${item.calculatedTotal}`
    ).join('\n');

    const totalRows = `\n,,,,,TỔNG CỘNG (USD),,${activeCalculations.totalUsd}\n,,,,,THÀNH TIỀN (VND),,${activeCalculations.totalVnd}\n`;
    
    const blob = new Blob([titleRow + rateRow + headerRow + contentRows + totalRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_Cao_Billing_${activeManifest.shipperName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Đã xuất báo cáo thành công sang Excel/CSV!`, "success");
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-900 select-none selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Header Navigation */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-lg z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-xl text-slate-900 shadow-md transform hover:rotate-6 transition-transform">L</div>
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              LogiStack Archive & Billing v2.0
            </span>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider -mt-1 hidden sm:inline">
              SECURE LOGISTICS LEDGER & MANIFEST DATABASE
            </span>
          </div>
        </div>

        {/* Dynamic Controls Header Right */}
        <div className="flex items-center space-x-4 md:space-x-6">
          
          {/* Conversions Capsule / Rates */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider hidden md:inline">ONLINE EXCHANGE ENG:</span>
            
            <div className="flex items-center bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700 hover:border-emerald-500 transition-colors shadow-inner relative group">
              <div className="flex items-center cursor-pointer" onClick={() => setIsEditingRate(!isEditingRate)}>
                <Coins className="w-3.5 h-3.5 text-emerald-400 mr-1.5 animate-bounce" />
                <span className="text-xs text-slate-300 mr-2 uppercase font-semibold">Tỷ giá (USD/VND):</span>
                {isEditingRate ? (
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      id="rate-direct-input"
                      type="number"
                      value={rateSliderValue}
                      onChange={(e) => setRateSliderValue(Number(e.target.value))}
                      className="w-16 bg-slate-950 text-emerald-300 font-mono text-xs text-center border border-emerald-500 rounded py-0.5 outline-none font-bold"
                    />
                    <button
                      onClick={() => applyRateInput(rateSliderValue)}
                      className="ml-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-[3px] rounded cursor-pointer"
                    >
                      <Check className="w-3 h-3 font-black" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs md:text-sm font-mono font-bold text-emerald-400 hover:underline">
                    {rateInput.toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
              
              {/* Tooltip hint info */}
              <div className="absolute right-0 top-11 bg-slate-950 border border-slate-800 rounded p-2 text-[10px] w-64 text-slate-400 hidden group-hover:block shadow-2xl z-50">
                <span className="text-emerald-400 font-bold block mb-1">Cài đặt Tỷ giá Hối đoái</span>
                Thay đổi nhanh tỷ giá USD/VND hiện hành. Các hóa đơn Excel, tổng phí cảng và lưu kho sẽ tự động thích ứng ngay lập tức.
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="range"
                    min="24000"
                    max="27500"
                    step="50"
                    value={rateSliderValue}
                    onChange={(e) => {
                      setRateSliderValue(Number(e.target.value));
                      setRateInput(Number(e.target.value));
                    }}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <span className="font-mono text-slate-200">{rateSliderValue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Reset Trigger */}
          <button 
            onClick={handleResetDatabase}
            title="Khôi phục trạng thái ban đầu"
            className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Mini User Tag */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-semibold text-xs text-emerald-300 ring-2 ring-emerald-500/20">
              AD
            </div>
            <span className="text-xs font-mono font-medium text-slate-300 hidden lg:inline">Admin_SGN</span>
          </div>
        </div>
      </header>

      {/* 2. Main Grid Layout */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden lg:h-[calc(100vh-6rem)]">
        
        {/* =========================================================================
            COLUMN 1: Manifest Archives List Bento Box (Col Span 4)
           ========================================================================= */}
        <section className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 lg:h-full overflow-hidden transition-all hover:shadow-md">
          
          {/* Card Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 rounded-t-xl flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-slate-700" id="db-icon" />
              <h2 className="font-bold text-slate-700 tracking-tight text-xs md:text-sm uppercase font-mono">
                KHO LƯU TRỮ MANIFEST
              </h2>
            </div>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="text-xs bg-slate-900 border border-slate-800 text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center font-bold tracking-tight cursor-pointer"
              id="upload-manifest-btn"
            >
              <Upload className="w-3 h-3 mr-1.5 text-emerald-400" />
              Tải lên File
            </button>
          </div>

          {/* Quick Search & Filters inside lists */}
          <div className="p-3 bg-white border-b border-slate-100 shrink-0 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Tìm tập tin hoặc Shipper..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-slate-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Micro Filter Badges */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <span className="text-slate-400 font-bold uppercase shrink-0">Lọc hãng:</span>
              <button 
                onClick={() => setActiveShipperFilter('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${activeShipperFilter === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                Mọi Shipper ({manifests.length})
              </button>
              {shippersList.map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveShipperFilter(st)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-all shrink-0 max-w-[120px] truncate ${activeShipperFilter === st ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  title={st}
                >
                  {st.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Manifest Entries List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
            {filteredManifests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200/60 shadow-inner">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Không tìm thấy tài liệu phù hợp</p>
                <button 
                  onClick={() => { setSearchTerm(''); setActiveShipperFilter('ALL'); }}
                  className="mt-2 text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Quay lại mặc định
                </button>
              </div>
            ) : (
              filteredManifests.map((mf) => {
                const isSelected = mf.id === selectedId;
                const totalRows = mf.records.length;
                const grandTotalUsd = mf.records.reduce((sum, item) => sum + (item.weight * item.unitPrice + Number(item.handling) + Number(item.whCharge)), 0);

                return (
                  <div
                    key={mf.id}
                    onClick={() => setSelectedId(mf.id)}
                    className={`relative p-3.5 transition-all duration-200 rounded-xl cursor-pointer group border flex flex-col justify-between shadow-sm ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 border-l-4 shadow'
                        : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header info of item */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-2.5 max-w-[84%]">
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-500/10 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs font-bold truncate leading-snug ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                            {mf.filename}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold tracking-tight uppercase flex items-center space-x-1">
                            <span className="text-slate-400">Shipper:</span>
                            <span className="text-slate-700 font-bold">{mf.shipperName}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Delete action wrapper */}
                      {manifests.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Xóa manifest "${mf.filename}" khỏi hệ thống?`)) {
                              const newManifests = manifests.filter(m => m.id !== mf.id);
                              setManifests(newManifests);
                              if (selectedId === mf.id) {
                                setSelectedId(newManifests[0].id);
                              }
                              showToast(`Đã gỡ bỏ tài liệu lưu trữ ${mf.filename}`, "info");
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Xóa manifest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Meta stats block */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100/80 pt-2 font-mono">
                      <div className="flex space-x-2.5">
                        <span className="flex items-center font-bold">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                          {totalRows} Dòng
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>{mf.date}</span>
                      </div>
                      <div className="font-bold text-slate-700 bg-slate-100 rounded px-1.5 py-0.2">
                        ${grandTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Archive Status Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between italic shrink-0">
            <span className="flex items-center font-semibold text-slate-500 font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
              Bảng lưu trữ SQLite: dbo.Manifest_Entries
            </span>
            <span className="text-[10px] font-bold bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
              SQLite.v3
            </span>
          </div>
        </section>

        {/* =========================================================================
            COLUMN 2 & 3: Report Preview & Calculation Logic (Col Span 8)
           ========================================================================= */}
        <section className="col-span-1 md:col-span-12 lg:col-span-8 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 lg:h-full overflow-hidden transition-all hover:shadow-md">
          
          {/* Card Header Panel */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white z-10 shrink-0 gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-slate-800 tracking-tight text-xs sm:text-xs md:text-sm uppercase font-mono truncate">
                    XUẤT BÁO CÁO CHI TIẾT (SHIPPER: <span className="text-blue-600">{activeManifest?.shipperName || 'N/A'}</span>)
                  </h2>
                  <span className="shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase tracking-wider">
                    Excel Preview
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono italic hidden sm:block">
                  Nhấp trực tiếp vào bất kỳ ô Số liệu, MAWB hoặc HAWB nào bên dưới để chỉnh sửa và biên dịch trực tiếp.
                </span>
              </div>
            </div>

            {/* Quick Export excel & new line trigger */}
            <div className="flex space-x-2 shrink-0 w-full sm:w-auto">
              <button 
                onClick={handleAddNewRow}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center cursor-pointer"
                title="Thêm một chuyến bay / dòng kê khai"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Thêm hàng
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer font-mono"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-200" />
                Xuất Excel (.xlsx / .csv)
              </button>
            </div>
          </div>

          {/* Excel Spreadsheet Mockup Area */}
          <div className="flex-1 overflow-hidden p-3 md:p-5 relative bg-slate-100 flex flex-col justify-between">
            
            {/* Sheet frame wrapper */}
            <div className="bg-white w-full h-full shadow-xl border border-slate-300 rounded-lg flex flex-col overflow-hidden">
              
              {/* Inner spreadsheet header branding and banner */}
              <div className="bg-emerald-50/80 p-3 sm:p-4 border-b border-emerald-200 text-center shrink-0 relative">
                <span className="absolute left-3 top-3 text-[9px] font-bold text-emerald-800 font-mono uppercase bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                  SHEET1
                </span>
                <h1 className="text-xs sm:text-sm font-black text-emerald-900 uppercase underline decoration-emerald-500 decoration-2 underline-offset-4 tracking-wide">
                  BẢNG KÊ CHI TIẾT THANH TOÁN TIỀN PHÍ & VẬN CHUYỂN
                </h1>
                <p className="text-[10px] text-emerald-800 font-semibold mt-1 font-mono uppercase">
                  ĐƠN VỊ KÝ GỬI: {activeManifest?.shipperName || 'N/A'} — TỶ GIÁ THANH TOÁN: {rateInput.toLocaleString('vi-VN')} VND/USD
                </p>
              </div>

              {/* Editable SpreadSheet Matrix Table Grid */}
              <div className="overflow-auto flex-1 bg-white">
                <table className="w-full border-collapse text-[11px] border border-slate-200">
                  <thead className="sticky top-0 bg-slate-50 text-slate-700 font-mono italic text-left z-10 border-b border-slate-300 uppercase">
                    <tr>
                      <th className="border-r border-b border-slate-200 p-2 text-center text-slate-400 w-10">Mã</th>
                      <th className="border-r border-b border-slate-200 p-2 min-w-[140px]">MAWB NO (Vận đơn chủ)</th>
                      <th className="border-r border-b border-slate-200 p-2 min-w-[100px]">HAWB (Phụ)</th>
                      <th className="border-r border-b border-slate-200 p-2 text-center min-w-[100px]">TUYẾN BAY</th>
                      <th className="border-r border-b border-slate-200 p-2 text-right min-w-[80px]">NẶNG (R.W/T)</th>
                      <th className="border-r border-b border-slate-200 p-2 text-center min-w-[80px]">ĐƠN GIÁ ($)</th>
                      <th className="border-r border-b border-slate-200 p-2 text-right min-w-[70px]">HANDLING ($)</th>
                      <th className="border-r border-b border-slate-200 p-2 text-right min-w-[70px]">WH CHARGE ($)</th>
                      <th className="border-b border-slate-200 p-2 text-right min-w-[90px] text-emerald-800 font-bold">CỘNG ($)</th>
                      <th className="border-b border-slate-200 p-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {activeCalculations.items.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center p-8 text-xs text-slate-400 italic">
                          Không có dòng dữ liệu nào trong tài liệu này. Hãy nhấp "Thêm hàng" để bắt đầu!
                        </td>
                      </tr>
                    ) : (
                      activeCalculations.items.map((item, index) => {
                        return (
                          <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group align-middle">
                            
                            {/* Grid coordination code */}
                            <td className="border-r border-slate-200 p-1.5 text-center text-slate-400 font-mono font-semibold select-none bg-slate-50/50">
                              {index + 1}
                            </td>

                            {/* MAWB Code */}
                            <td className="border-r border-slate-200 p-1">
                              <input
                                type="text"
                                value={item.mawb}
                                onChange={(e) => updateRecordField(item.id, 'mawb', e.target.value)}
                                className="w-full text-[11px] font-mono px-1 border-0 hover:bg-yellow-50 focus:bg-yellow-50 focus:ring-1 focus:ring-emerald-400 outline-none rounded"
                              />
                            </td>

                            {/* HAWB Code */}
                            <td className="border-r border-slate-200 p-1">
                              <input
                                type="text"
                                value={item.hawb}
                                onChange={(e) => updateRecordField(item.id, 'hawb', e.target.value)}
                                className="w-full text-[11px] font-mono px-1 border-0 hover:bg-yellow-50 focus:bg-yellow-50 focus:ring-1 focus:ring-emerald-400 outline-none rounded"
                              />
                            </td>

                            {/* ROUTE selection (computed dynamically) */}
                            <td className="border-r border-slate-200 p-1 text-center">
                              <select
                                value={item.route}
                                onChange={(e) => updateRecordField(item.id, 'route', e.target.value)}
                                className="text-[11px] font-bold text-blue-600 bg-transparent border-0 hover:bg-yellow-50 rounded px-1 cursor-pointer focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                              >
                                <option value="SGN-HAN-ICN">SGN-HAN-ICN</option>
                                <option value="SGN-ICN">SGN-ICN</option>
                                <option value="SGN-SZX">SGN-SZX</option>
                                <option value="HAN-ICN">HAN-ICN</option>
                              </select>
                            </td>

                            {/* Weight payload kg */}
                            <td className="border-r border-slate-200 p-1">
                              <input
                                type="number"
                                step="0.1"
                                value={item.weight}
                                onChange={(e) => updateRecordField(item.id, 'weight', e.target.value)}
                                className="w-full text-[11px] font-mono text-right pr-1 border-0 hover:bg-yellow-50 focus:bg-yellow-50 focus:ring-1 focus:ring-emerald-400 outline-none rounded"
                              />
                            </td>

                            {/* Unit price per kg */}
                            <td className="border-r border-slate-200 p-1">
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateRecordField(item.id, 'unitPrice', e.target.value)}
                                className="w-full text-[11px] font-mono text-center border-0 hover:bg-yellow-50 focus:bg-yellow-50 focus:ring-1 focus:ring-emerald-400 outline-none rounded bg-yellow-50/50 font-bold"
                              />
                            </td>

                            {/* Handling flat fee */}
                            <td className="border-r border-slate-200 p-1">
                              <input
                                type="number"
                                value={item.handling}
                                onChange={(e) => updateRecordField(item.id, 'handling', e.target.value)}
                                className="w-full text-[11px] font-mono text-right pr-1 border-0 hover:bg-yellow-50 focus:bg-yellow-50 focus:ring-1 focus:ring-emerald-400 outline-none rounded"
                              />
                            </td>

                            {/* Warehouse flat fee */}
                            <td className="border-r border-slate-200 p-1">
                              <input
                                type="number"
                                value={item.whCharge}
                                onChange={(e) => updateRecordField(item.id, 'whCharge', e.target.value)}
                                className="w-full text-[11px] font-mono text-right pr-1 border-0 hover:bg-yellow-50 focus:bg-yellow-50 focus:ring-1 focus:ring-emerald-400 outline-none rounded"
                              />
                            </td>

                            {/* TOTAL DÒNG CALCULATION ($) */}
                            <td className="p-2 text-right font-bold text-slate-800 font-mono">
                              ${item.calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Row removal clicker */}
                            <td className="p-1 text-center align-middle">
                              <button
                                onClick={() => handleDeleteRow(item.id)}
                                className="text-slate-300 hover:text-red-500 rounded p-[3px] transition-colors"
                                title="Xóa dòng này"
                              >
                                <X className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}

                    {/* Mimic Excel blank rows at bottom */}
                    {[...Array(Math.max(1, 5 - activeCalculations.items.length))].map((_, i) => (
                      <tr key={`blank-${i}`} className="h-7 text-slate-50 border-r-0">
                        <td className="border-r border-slate-100 p-1 text-center bg-slate-50/20 text-slate-300 font-mono text-[9px]">{activeCalculations.items.length + i + 1}</td>
                        <td className="border-r border-slate-100 p-1"></td>
                        <td className="border-r border-slate-100 p-1"></td>
                        <td className="border-r border-slate-100 p-1"></td>
                        <td className="border-r border-slate-100 p-1"></td>
                        <td className="border-r border-slate-100 p-1"></td>
                        <td className="border-r border-slate-100 p-1"></td>
                        <td className="border-r border-slate-100 p-1"></td>
                        <td className="p-1"></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Summary Total rows styled exactly as Bento Grid Design */}
                  <tfoot>
                    {/* TOTAL USD */}
                    <tr className="bg-yellow-100/90 font-bold border-t-2 border-slate-350">
                      <td colSpan={2} className="p-2 border-r border-slate-3 hover:bg-yellow-200 select-none text-[10px] text-slate-500 font-mono uppercase italic">
                        SUM(HÀNG 1 .. {activeCalculations.items.length})
                      </td>
                      <td colSpan={5} className="p-2 text-right text-slate-700 font-bold uppercase tracking-tight">
                        TỔNG PHÍ TÍNH TOÁN (USD):
                      </td>
                      <td colSpan={2} className="p-2 text-right text-base text-slate-900 font-black font-mono">
                        ${activeCalculations.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>

                    {/* TOTAL VND SUCCESS ROW */}
                    <tr className="bg-emerald-600 text-white font-bold">
                      <td colSpan={2} className="p-2 border-r border-emerald-700 text-[9px] text-emerald-200 font-mono uppercase italic leading-tight">
                        HỆ QUY ĐỔI CHÍNH THỨC
                      </td>
                      <td colSpan={5} className="p-2 text-right text-emerald-50 font-bold uppercase tracking-tight text-xs">
                        TỔNG THÀNH TIỀN QUY ĐỔI (VND): <span className="font-mono bg-emerald-700 px-1.5 py-0.5 rounded text-[10px]">x {rateInput.toLocaleString('vi-VN')}</span>
                      </td>
                      <td colSpan={2} className="p-2 text-right text-lg text-emerald-100 font-black font-mono tracking-tight">
                        {activeCalculations.totalVnd.toLocaleString('vi-VN')} ₫
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* SpreadSheet bottom bar */}
              <div className="bg-slate-50 p-2 sm:p-2.5 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[9px] text-slate-400 font-mono italic shrink-0 gap-1.5">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse"></span>
                  Vận hành công thức: LOÀI = MAWB chứa 'HAN' ? SGN-HAN-ICN : SGN-ICN | Handling Charge cố định ($10.00 / Hàng)
                </span>
                <span>Python Engine Solution: openpyxl + dynamic pandas compute matrix</span>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* =========================================================================
          3. QUICK STATS & LIVE SYSTEM LOAD WIDGETS BENTO ROW (Bottom Row Grid)
         ========================================================================= */}
      <section className="px-4 md:px-6 pb-6 mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5 shrink-0">
        
        {/* Bento Stat Card 1: Active Shippers */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-white rounded-xl border border-slate-200 flex items-center p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
              SHIPPER ACTIVE / HÃNG LIÊN VIỆT
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono leading-tight mt-1 flex items-baseline">
              {shippersList.length}
              <span className="text-[10px] text-emerald-500 font-bold ml-1.5 bg-emerald-50 px-1 py-0.2 rounded">
                +1 mới
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-1">
              {shippersList.join(', ')}
            </p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        {/* Bento Stat Card 2: Documents Count */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-white rounded-xl border border-slate-200 flex items-center p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
              TẬP TIN LƯU TRỮ VÀ XỬ LÝ
            </div>
            <div className="text-2xl font-black text-amber-600 font-mono leading-tight mt-1 flex items-baseline">
              0{manifests.length}
              <span className="text-[10px] text-slate-400 font-normal ml-1 mb-0.5">FILES</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-1">
              Phí bình quân: ${(activeCalculations.totalUsd / (activeCalculations.items.length || 1)).toFixed(1)} / Ship
            </p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        {/* Bento Widget 3: Live System load tracker */}
        <div className="col-span-12 sm:col-span-12 md:col-span-4 bg-slate-900 rounded-xl border border-slate-700 flex flex-col justify-center px-4 py-3.5 text-white shadow-lg">
          <div className="flex justify-between items-center mb-1 bg-slate-800/10 rounded">
            <span className="text-[10px] text-slate-400 uppercase font-bold font-mono py-0.5 tracking-wider">
              Bảng Chế độ Hoạt động SQLite
            </span>
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-end space-x-1 mb-2 mt-1">
                <div 
                  className="w-2.5 bg-emerald-500 rounded-t transition-all duration-500" 
                  style={{ height: `${systemLoad.cpu}%` }}
                  title={`CPU Load: ${systemLoad.cpu}%`}
                ></div>
                <div 
                  className="w-2.5 bg-emerald-500 rounded-t transition-all duration-500" 
                  style={{ height: '78%' }}
                ></div>
                <div 
                  className="w-2.5 bg-blue-500 rounded-t transition-all duration-500" 
                  style={{ height: `${systemLoad.memory}%` }}
                  title={`Memory Load: ${systemLoad.memory}%`}
                ></div>
                <div 
                  className="w-2.5 bg-emerald-400 rounded-t transition-all duration-500 px-[1px]" 
                  style={{ height: '45%' }}
                ></div>
                <div 
                  className="w-2.5 bg-emerald-500 rounded-t opacity-40" 
                  style={{ height: '20%' }}
                ></div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono tracking-tighter flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1.5 animate-ping"></span>
                <span>SQLite thread: Online (Active)</span>
              </div>
            </div>

            {/* Micro benchmark metadata */}
            <div className="text-right text-[10px] font-mono text-slate-400 space-y-0.5">
              <div>CPU: <strong className="text-white">{systemLoad.cpu}%</strong></div>
              <div>Memory: <strong className="text-white">{systemLoad.memory}%</strong></div>
              <div className="text-[9px] text-indigo-300">Ready for processing</div>
            </div>
          </div>
        </div>

      </section>

      {/* =========================================================================
          4. STATUS BAR FOOTER
         ========================================================================= */}
      <footer className="h-8 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 select-none shrink-0 font-mono">
        <div className="flex space-x-4">
          <span>Session: <span className="text-slate-800 font-bold">Admin_Logistics_SGN</span></span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline">DB Driver: <span className="text-slate-800 italic">SQLite.v3.local</span></span>
          <span className="hidden lg:inline text-slate-300">|</span>
          <span className="hidden lg:inline">Bản Ghi: <span className="text-slate-800 font-bold">{manifests.reduce((sum,m)=>sum+m.records.length, 0)} Rows</span></span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="text-sky-600 font-bold hidden sm:inline">{currentTime} UTC</span>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-slate-600">Auto-Calculation Active</span>
        </div>
      </footer>

      {/* =========================================================================
          5. TOAST MESSAGES FEEDBACK SYSTEM
         ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-850 z-50 flex items-center space-x-2.5 animate-bounce">
          <div className={`p-1 rounded-full ${toastMessage.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-100">{toastMessage.text}</p>
            <p className="text-[9px] text-slate-400">Ledger synchronized with storage</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. UPLOAD / MANIFEST IMPORT DIALOG MODAL
         ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            
            {/* Modal header */}
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm tracking-tight uppercase font-mono">Nhập Tài liệu Manifest mới</h3>
              </div>
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateManifest} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Tên tệp Excel / CSV
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g. MANIFEST_SGN_20241022.xlsx"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Đơn vị xuất khẩu (Shipper / Shipper)
                </label>
                <select 
                  value={newShipperName}
                  onChange={(e) => setNewShipperName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="GENERAL MOTORS SGN">GENERAL MOTORS SGN</option>
                  <option value="LG ELECTRONICS">LG ELECTRONICS</option>
                  <option value="SAMSUNG DISPLAYCO">SAMSUNG DISPLAYCO</option>
                  <option value="FOXCONN TECHNOLOGY">FOXCONN TECHNOLOGY</option>
                  <option value="SGN LOGISTICS SERVICE">SGN LOGISTICS SERVICE</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono">
                    Nội dung Dòng Kê khai Vận đơn (Dạng CSV)
                  </label>
                  <span className="text-[9px] text-slate-400 font-mono italic">
                    MAWB, HAWB, Tuyến, Khối lượng, Đơn giá, Handling, Phí kho
                  </span>
                </div>
                <textarea 
                  rows={4}
                  required
                  value={rawCsvInput}
                  onChange={(e) => setRawCsvInput(e.target.value)}
                  className="w-full text-[11px] font-mono p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                ></textarea>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2 pt-2 border-t border-slate-100 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-50 rounded-lg font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold transition-all flex items-center shadow cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Đồng ý tạo tập tin
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
