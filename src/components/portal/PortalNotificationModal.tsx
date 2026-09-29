import React from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Calendar,
  FileText,
  Sparkles,
  ClipboardList,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useMemberPortal, PortalTab } from '../../context/MemberPortalContext';

export const PortalNotificationModal: React.FC = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setPortalTab,
  } = useMemberPortal();

  if (!isNotificationOpen) return null;

  const handleItemClick = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTab) {
      setPortalTab(notif.linkTab as PortalTab);
    }
    setIsNotificationOpen(false);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'program':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'dokumen':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'submission':
        return <ClipboardList className="w-4 h-4 text-purple-600" />;
      case 'amalan':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-end p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-4 duration-200 mt-12 sm:mt-16">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-4 h-4 text-teal-800" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </div>
            <h3 className="font-black text-sm text-slate-900">Pemberitahuan Ahli</h3>
            {unreadNotificationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                {unreadNotificationsCount} Baharu
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1"
                title="Tandakan semua sebagai dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Baca Semua
              </button>
            )}
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Tiada notifikasi pada masa ini.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 flex items-start gap-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                  !item.read ? 'bg-amber-50/40' : 'bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">{item.time || item.date}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-500 font-medium">
            Notifikasi rasmi pengurusan MPGBSIM
          </span>
        </div>
      </div>
    </div>
  );
};
