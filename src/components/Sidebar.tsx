import React, { useState, useMemo } from "react";
import {
  Plus,
  Settings,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "@/store";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    createConversation,
    selectConversation,
    deleteConversation,
    allConversations,
    currentConversationId,
    syncAllConversations,
  } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllConversations();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return allConversations;
    return allConversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allConversations, searchQuery]);

  // Group conversations by date
  const grouped = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups: { label: string; items: typeof filteredConversations }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Previous 7 Days", items: [] },
      { label: "Older", items: [] },
    ];

    filteredConversations.forEach((c) => {
      const d = new Date(c.updatedAt);
      if (d >= today) groups[0].items.push(c);
      else if (d >= yesterday) groups[1].items.push(c);
      else if (d >= weekAgo) groups[2].items.push(c);
      else groups[3].items.push(c);
    });

    return groups.filter((g) => g.items.length > 0);
  }, [filteredConversations]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen glass flex flex-col z-50 md:z-auto 
          transform transition-all duration-300 ease-out md:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isCollapsed ? "w-[68px]" : "w-72"}`}
        style={{
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(14, 14, 17, 0.85)",
        }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between min-h-[64px]">
          <h1
            className={`text-lg font-bold gradient-text tracking-tight truncate transition-all duration-300 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            }`}
          >
            Kl.ai
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className={`px-3 ${isCollapsed ? "px-2" : ""}`}>
          <button
            onClick={() => {
              createConversation();
              onClose();
            }}
            aria-label="Create new chat"
            className={`w-full gradient-border rounded-xl py-2.5 flex items-center justify-center gap-2 
              font-medium text-sm text-text-primary bg-black hover:bg-surface-3 
              active:scale-[0.98] transition-all duration-200 ${
                isCollapsed ? "px-2" : "px-4"
              }`}
          >
            <Plus size={16} className="text-accent-primary" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="px-3 mt-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-border-subtle rounded-lg py-2 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:ring-0 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto mt-3 px-2 pb-2 space-y-4">
          {grouped.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((conversation) => {
                  const isActive = conversation.id === currentConversationId;
                  return (
                    <div
                      key={conversation.id}
                      className={`group rounded-lg cursor-pointer transition-all duration-200 relative
                        ${
                          isActive
                            ? "bg-surface-3 sidebar-item-active"
                            : "hover:bg-black"
                        }
                        ${isCollapsed ? "p-2" : "px-3 py-2.5"}`}
                      onClick={() => {
                        selectConversation(conversation.id);
                        onClose();
                      }}
                    >
                      {isCollapsed ? (
                        <div className="flex justify-center">
                          <MessageSquare
                            size={16}
                            className={
                              isActive
                                ? "text-accent-primary"
                                : "text-text-muted"
                            }
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm truncate ${
                                isActive
                                  ? "text-text-primary font-medium"
                                  : "text-text-secondary"
                              }`}
                            >
                              {conversation.title}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                            aria-label="Delete conversation"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-subtle space-y-1">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2.5 text-text-muted hover:text-text-primary py-2 rounded-lg hover:bg-surface-3 transition-all text-sm w-full
              ${isCollapsed ? "px-2 justify-center" : "px-3"}`}
          >
            {isSyncing ? (
              <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            ) : syncSuccess ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <Upload size={16} />
            )}
            {!isCollapsed && (
              <span>{isSyncing ? "Syncing..." : syncSuccess ? "Synced!" : "Sync to Cloud"}</span>
            )}
          </button>
          
          <Link
            to="/settings"
            className={`flex items-center gap-2.5 text-text-muted hover:text-text-primary py-2 rounded-lg hover:bg-surface-3 transition-all text-sm ${
              isCollapsed ? "px-2 justify-center w-10" : "px-3 w-full"
            }`}
          >
            <Settings size={16} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
};
