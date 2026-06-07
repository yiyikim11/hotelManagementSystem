import { useState } from "react";
import { Mail, Send, Plus, Trash2, Edit2, X, ChevronDown, ChevronUp, Users, Tag, Calendar, Package } from "lucide-react";

const ROOM_TYPES = [
  "Standard Room",
  "Deluxe Room",
  "Junior Suite",
  "Executive Suite",
  "Presidential Suite",
  "Family Room",
  "Studio Room",
];

const PACKAGES = [
  { id: "pkg1", name: "Honeymoon Package", description: "Romantic stay with spa & dinner" },
  { id: "pkg2", name: "Family Fun Package", description: "Kids activities + family breakfast" },
  { id: "pkg3", name: "Business Traveler Package", description: "Fast WiFi, early check-in, airport transfer" },
  { id: "pkg4", name: "Wellness Retreat", description: "3-night stay with daily spa sessions" },
  { id: "pkg5", name: "Weekend Getaway", description: "Fri–Sun stay with dinner for two" },
];

const PROMO_CODES = [
  { code: "SUMMER25", discount: "25% off", type: "percentage" },
  { code: "EARLYBIRD", discount: "$50 off", type: "fixed" },
  { code: "LOYALTY10", discount: "10% off", type: "percentage" },
  { code: "FLASH30", discount: "30% off", type: "percentage" },
  { code: "WELCOME15", discount: "15% off", type: "percentage" },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Guests" },
  { value: "past", label: "Past Guests" },
  { value: "upcoming", label: "Upcoming Reservations" },
  { value: "loyalty", label: "Loyalty Members" },
  { value: "corporate", label: "Corporate Clients" },
];

type Campaign = {
  id: string;
  subject: string;
  audience: string;
  roomTypes: string[];
  packages: string[];
  promoCodes: string[];
  startDate: string;
  endDate: string;
  body: string;
  status: "Draft" | "Sent" | "Ongoing";
  recipientCount?: number;
};

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    subject: "Exclusive Summer Deals — Book Now!",
    audience: "all",
    roomTypes: ["Deluxe Room", "Junior Suite"],
    packages: ["pkg5"],
    promoCodes: ["SUMMER25"],
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    body: "Dear Guest,\n\nWe're excited to offer you exclusive summer deals at Hotel Manager. Enjoy 25% off selected room types with code SUMMER25 when you book your stay between June 1 and August 31.\n\nBook now and make this summer unforgettable!\n\nWarm regards,\nHotel Manager Team",
    status: "Ongoing",
    recipientCount: 342,
  },
  {
    id: "c2",
    subject: "Early Bird Offer — Save $50 on Your Next Stay",
    audience: "past",
    roomTypes: ["Standard Room"],
    packages: [],
    promoCodes: ["EARLYBIRD"],
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    body: "Dear Valued Guest,\n\nAs a returning guest, we have a special early bird offer just for you. Use code EARLYBIRD to save $50 on your next booking in May.\n\nWe look forward to welcoming you back!\n\nBest,\nHotel Manager Team",
    status: "Sent",
    recipientCount: 128,
  },
];

function PreviewModal({ campaign, onClose }: { campaign: Partial<Campaign>; onClose: () => void }) {
  const audience = AUDIENCE_OPTIONS.find(a => a.value === campaign.audience)?.label ?? "All Guests";
  const packages = PACKAGES.filter(p => campaign.packages?.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Email Preview</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex gap-2 text-sm">
              <span className="text-slate-500 w-24 shrink-0">To:</span>
              <span className="text-slate-800 font-medium">{audience}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-slate-500 w-24 shrink-0">Subject:</span>
              <span className="text-slate-800 font-medium">{campaign.subject || "(No subject)"}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-slate-500 w-24 shrink-0">Offer Period:</span>
              <span className="text-slate-800">{campaign.startDate || "—"} → {campaign.endDate || "—"}</span>
            </div>
          </div>

          {(campaign.promoCodes?.length || campaign.roomTypes?.length || packages.length) ? (
            <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 space-y-2">
              {campaign.promoCodes && campaign.promoCodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {campaign.promoCodes.map(code => {
                    const promo = PROMO_CODES.find(p => p.code === code);
                    return (
                      <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        {code} — {promo?.discount}
                      </span>
                    );
                  })}
                </div>
              )}
              {campaign.roomTypes && campaign.roomTypes.length > 0 && (
                <p className="text-sm text-blue-700">
                  <strong>Eligible rooms:</strong> {campaign.roomTypes.join(", ")}
                </p>
              )}
              {packages.length > 0 && (
                <p className="text-sm text-blue-700">
                  <strong>Packages:</strong> {packages.map(p => p.name).join(", ")}
                </p>
              )}
            </div>
          ) : null}

          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{campaign.body || "(No message body)"}</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Campaign>>({
    subject: "",
    audience: "all",
    roomTypes: [],
    packages: [],
    promoCodes: [],
    startDate: "",
    endDate: "",
    body: "",
    status: "Draft",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const toggleRoomType = (rt: string) => {
    setForm(f => ({
      ...f,
      roomTypes: f.roomTypes?.includes(rt)
        ? f.roomTypes.filter(r => r !== rt)
        : [...(f.roomTypes ?? []), rt],
    }));
  };

  const togglePackage = (id: string) => {
    setForm(f => ({
      ...f,
      packages: f.packages?.includes(id)
        ? f.packages.filter(p => p !== id)
        : [...(f.packages ?? []), id],
    }));
  };

  const togglePromoCode = (code: string) => {
    setForm(f => ({
      ...f,
      promoCodes: f.promoCodes?.includes(code)
        ? f.promoCodes.filter(c => c !== code)
        : [...(f.promoCodes ?? []), code],
    }));
  };

  const handleSend = () => {
    const newCampaign: Campaign = {
      id: `c${Date.now()}`,
      subject: form.subject ?? "",
      audience: form.audience ?? "all",
      roomTypes: form.roomTypes ?? [],
      packages: form.packages ?? [],
      promoCodes: form.promoCodes ?? [],
      startDate: form.startDate ?? "",
      endDate: form.endDate ?? "",
      body: form.body ?? "",
      status: "Ongoing",
      recipientCount: Math.floor(Math.random() * 400) + 50,
    };
    setCampaigns(c => [newCampaign, ...c]);
    setShowForm(false);
    setEditingCampaign(null);
    setSuccessMsg(`Campaign "${newCampaign.subject}" is now live!`);
    setTimeout(() => setSuccessMsg(""), 4000);
    setForm({ subject: "", audience: "all", roomTypes: [], packages: [], promoCodes: [], startDate: "", endDate: "", body: "", status: "Draft" });
  };

  const handleSaveDraft = () => {
    const draft: Campaign = {
      id: `c${Date.now()}`,
      subject: form.subject ?? "(Untitled Draft)",
      audience: form.audience ?? "all",
      roomTypes: form.roomTypes ?? [],
      packages: form.packages ?? [],
      promoCodes: form.promoCodes ?? [],
      startDate: form.startDate ?? "",
      endDate: form.endDate ?? "",
      body: form.body ?? "",
      status: "Draft",
    };
    setCampaigns(c => [draft, ...c]);
    setShowForm(false);
    setEditingCampaign(null);
    setForm({ subject: "", audience: "all", roomTypes: [], packages: [], promoCodes: [], startDate: "", endDate: "", body: "", status: "Draft" });
  };

  const handleDelete = (id: string) => {
    setCampaigns(c => c.filter(cp => cp.id !== id));
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setForm({
      subject: campaign.subject,
      audience: campaign.audience,
      roomTypes: campaign.roomTypes,
      packages: campaign.packages,
      promoCodes: campaign.promoCodes,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      body: campaign.body,
      status: campaign.status,
    });
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingCampaign) return;
    setCampaigns(c => c.map(cp =>
      cp.id === editingCampaign.id
        ? { ...cp, ...form, subject: form.subject ?? cp.subject, body: form.body ?? cp.body }
        : cp
    ));
    setShowForm(false);
    setEditingCampaign(null);
    setForm({ subject: "", audience: "all", roomTypes: [], packages: [], promoCodes: [], startDate: "", endDate: "", body: "", status: "Draft" });
    setSuccessMsg(`Campaign "${form.subject}" updated successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const statusColor: Record<string, string> = {
    Sent: "bg-green-100 text-green-700",
    Draft: "bg-slate-100 text-slate-500",
    Ongoing: "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
  };

  const canSend = form.subject && form.body && form.startDate && form.endDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Email Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Send promotional emails to your guests with offers and packages.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <Mail className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Compose Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              {editingCampaign ? "Edit Campaign" : "Compose Campaign"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingCampaign(null); }} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Exclusive Summer Offer — 25% Off!"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Audience + Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Audience
                </label>
                <select
                  value={form.audience}
                  onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {AUDIENCE_OPTIONS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Offer Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Offer End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Promo Codes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Tag className="w-3.5 h-3.5 inline mr-1" />
                Promo Codes
              </label>
              <div className="flex flex-wrap gap-2">
                {PROMO_CODES.map(promo => {
                  const selected = form.promoCodes?.includes(promo.code);
                  return (
                    <button
                      key={promo.code}
                      type="button"
                      onClick={() => togglePromoCode(promo.code)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        selected
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200 scale-[1.03]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600"
                      }`}
                    >
                      <Tag className={`w-3 h-3 inline mr-1 ${selected ? "opacity-90" : "opacity-40"}`} />
                      {promo.code}
                      <span className={`ml-1.5 text-xs ${selected ? "opacity-90" : "opacity-60"}`}>{promo.discount}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Types */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Types</label>
              <div className="flex flex-wrap gap-2">
                {ROOM_TYPES.map(rt => {
                  const selected = form.roomTypes?.includes(rt);
                  return (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => toggleRoomType(rt)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        selected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200 scale-[1.03]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
                      }`}
                    >
                      {rt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Packages */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Package className="w-3.5 h-3.5 inline mr-1" />
                Packages
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PACKAGES.map(pkg => {
                  const selected = form.packages?.includes(pkg.id);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => togglePackage(pkg.id)}
                      className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                        selected
                          ? "bg-violet-600 border-violet-600 shadow-sm shadow-violet-200 scale-[1.02]"
                          : "bg-white border-slate-200 text-slate-700 hover:border-violet-400"
                      }`}
                    >
                      <p className={`text-sm font-medium ${selected ? "text-white" : "text-slate-800"}`}>{pkg.name}</p>
                      <p className={`text-xs mt-0.5 ${selected ? "text-violet-200" : "text-slate-500"}`}>{pkg.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message Body <span className="text-red-500">*</span></label>
              <textarea
                rows={8}
                placeholder="Write your email message here..."
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {!editingCampaign && (
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Save as Draft
                </button>
              )}
              <div className={`flex gap-2 ${editingCampaign ? "ml-auto" : ""}`}>
                {editingCampaign ? (
                  <button
                    onClick={handleSaveEdit}
                    disabled={!form.subject || !form.body}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Edit2 className="w-4 h-4" />
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Send Campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ongoing Campaigns */}
      {(() => {
        const ongoing = campaigns.filter(c => c.status === "Ongoing");
        return (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="font-semibold text-slate-900">Ongoing Campaigns</h2>
              <span className="ml-auto text-xs text-slate-500">{ongoing.length} active</span>
            </div>
            {ongoing.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No ongoing campaigns. Send a new campaign to see it here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {ongoing.map(campaign => {
                  const isExpanded = expandedCampaign === campaign.id;
                  const audience = AUDIENCE_OPTIONS.find(a => a.value === campaign.audience)?.label ?? campaign.audience;
                  const pkgs = PACKAGES.filter(p => campaign.packages.includes(p.id));
                  return (
                    <div key={campaign.id}>
                      <div
                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{campaign.subject}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {audience}
                            {campaign.promoCodes.length > 0 && ` · ${campaign.promoCodes.join(", ")}`}
                            {campaign.startDate && ` · ${campaign.startDate} → ${campaign.endDate}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {campaign.recipientCount && (
                            <span className="text-xs text-slate-500">{campaign.recipientCount} recipients</span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 ring-1 ring-amber-300">Ongoing</span>
                          <button onClick={e => { e.stopPropagation(); handleEdit(campaign); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(campaign.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setExpandedCampaign(isExpanded ? null : campaign.id); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-6 pb-5 space-y-3 bg-slate-50 border-t border-slate-100">
                          {(campaign.promoCodes.length > 0 || campaign.roomTypes.length > 0 || pkgs.length > 0) && (
                            <div className="flex flex-wrap gap-2 pt-4">
                              {campaign.promoCodes.map(code => (
                                <span key={code} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"><Tag className="w-3 h-3" /> {code}</span>
                              ))}
                              {campaign.roomTypes.map(rt => (
                                <span key={rt} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">{rt}</span>
                              ))}
                              {pkgs.map(pkg => (
                                <span key={pkg.id} className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{pkg.name}</span>
                              ))}
                            </div>
                          )}
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{campaign.body}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Campaign History */}
      {(() => {
        const history = campaigns.filter(c => c.status === "Sent" || c.status === "Draft");
        return (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Campaign History</h2>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No past campaigns yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map(campaign => {
                  const isExpanded = expandedCampaign === campaign.id;
                  const audience = AUDIENCE_OPTIONS.find(a => a.value === campaign.audience)?.label ?? campaign.audience;
                  const pkgs = PACKAGES.filter(p => campaign.packages.includes(p.id));
                  return (
                    <div key={campaign.id}>
                      <div
                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{campaign.subject}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {audience}
                            {campaign.promoCodes.length > 0 && ` · ${campaign.promoCodes.join(", ")}`}
                            {campaign.startDate && ` · ${campaign.startDate} → ${campaign.endDate}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {campaign.recipientCount && (
                            <span className="text-xs text-slate-500">{campaign.recipientCount} recipients</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[campaign.status]}`}>
                            {campaign.status}
                          </span>
                          <button onClick={e => { e.stopPropagation(); handleEdit(campaign); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(campaign.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setExpandedCampaign(isExpanded ? null : campaign.id); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-6 pb-5 space-y-3 bg-slate-50 border-t border-slate-100">
                          {(campaign.promoCodes.length > 0 || campaign.roomTypes.length > 0 || pkgs.length > 0) && (
                            <div className="flex flex-wrap gap-2 pt-4">
                              {campaign.promoCodes.map(code => (
                                <span key={code} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"><Tag className="w-3 h-3" /> {code}</span>
                              ))}
                              {campaign.roomTypes.map(rt => (
                                <span key={rt} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">{rt}</span>
                              ))}
                              {pkgs.map(pkg => (
                                <span key={pkg.id} className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{pkg.name}</span>
                              ))}
                            </div>
                          )}
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{campaign.body}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
