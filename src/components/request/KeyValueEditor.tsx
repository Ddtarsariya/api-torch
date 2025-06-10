// src/components/request/KeyValueEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import type { KeyValuePair } from '../../types';
import {
  Plus, Trash2, Copy, Filter, X, Square, CheckSquare,
  ChevronDown, Eye, EyeOff, CheckCircle2, Clipboard, MoreVertical,
  ArrowUpDown
} from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  placeholders?: { key: string; value: string };
  suggestions?: { keys: string[]; values: string[] };
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  items,
  onChange,
  placeholders = { key: 'Key', value: 'Value' },
  suggestions = { keys: [], values: [] }
}) => {
  const { toast } = useToast();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [bulkEditText, setBulkEditText] = useState('');
  const actionsRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLDivElement>(null);

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedItems(items.map(item => item.id));
    } else if (selectedItems.length === items.length && items.length > 0) {
      setSelectedItems([]);
    }
  }, [selectAll, items]);

  // Update selectAll state when individual selections change
  useEffect(() => {
    setSelectAll(items.length > 0 && selectedItems.length === items.length);
  }, [selectedItems, items]);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when the component is focused
      if (!tableBodyRef.current?.contains(document.activeElement)) return;

      // Delete selected items with Delete key
      if (e.key === 'Delete' && selectedItems.length > 0) {
        e.preventDefault();
        handleDeleteSelected();
      }

      // Select all with Ctrl+A
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        if (items.length > 0 && document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          setSelectAll(true);
        }
      }

      // Copy selected with Ctrl+C
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selectedItems.length > 0) {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          handleCopySelected();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItems, items]);

  const handleAddItem = () => {
    onChange([...items, { id: uuidv4(), key: '', value: '', enabled: true }]);
    
    // Scroll to the bottom after adding an item
    setTimeout(() => {
      if (tableBodyRef.current) {
        tableBodyRef.current.scrollTop = tableBodyRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
    setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    toast({
      title: "Item removed",
      description: "The key-value pair has been removed",
      variant: "default",
    });
  };

  const handleItemChange = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    onChange(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleBulkPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(text);
        const newItems = Object.entries(jsonData).map(([key, value]) => ({
          id: uuidv4(),
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          enabled: true
        }));

        onChange([...items, ...newItems]);
        toast({
          title: "Bulk paste successful",
          description: `Added ${newItems.length} items from JSON`,
          variant: "default",
        });
      } catch {
        // Try line by line format (key: value or key=value)
        const lines = text.split('\n').filter(line => line.trim());
        const newItems = lines.map(line => {
          let key = '', value = '';
          if (line.includes(':')) {
            [key, value] = line.split(':', 2).map(s => s.trim());
          } else if (line.includes('=')) {
            [key, value] = line.split('=', 2).map(s => s.trim());
          } else {
            key = line.trim();
          }

          return {
            id: uuidv4(),
            key,
            value,
            enabled: true
          };
        });

        onChange([...items, ...newItems]);
        toast({
          title: "Bulk paste successful",
          description: `Added ${newItems.length} items from text`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Bulk paste failed",
        description: "Could not access clipboard content",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (id: string, e: React.DragEvent) => {
    setDraggedItemId(id);
    
    // Set drag image and effect
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      
      // Create a custom drag image
      const dragPreview = document.createElement('div');
      dragPreview.className = 'bg-primary/20 border border-primary/30 rounded px-2 py-1 text-xs';
      dragPreview.textContent = 'Moving item';
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 0, 0);
      
      // Clean up the element after drag starts
      setTimeout(() => {
        document.body.removeChild(dragPreview);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setHoveredItemId(id);
    
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setHoveredItemId(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItemId);
    const targetIndex = items.findIndex(item => item.id === targetId);

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    onChange(newItems);
    setDraggedItemId(null);
    setHoveredItemId(null);
    
    toast({
      title: "Item moved",
      description: "The item has been reordered",
      variant: "default",
    });
  };

  const handleToggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    onChange(items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setShowActions(false);
    toast({
      title: "Items deleted",
      description: `${selectedItems.length} items have been removed`,
      variant: "default",
    });
  };

  const handleEnableSelected = (enabled: boolean) => {
    if (selectedItems.length === 0) return;

    onChange(
      items.map(item => 
        selectedItems.includes(item.id) ? { ...item, enabled } : item
      )
    );
    setShowActions(false);
    toast({
      title: enabled ? "Items enabled" : "Items disabled",
      description: `${selectedItems.length} items have been ${enabled ? 'enabled' : 'disabled'}`,
      variant: "default",
    });
  };

  const handleCopySelected = () => {
    if (selectedItems.length === 0) return;

    const selectedItemsData = items
      .filter(item => selectedItems.includes(item.id))
      .map(item => ({ key: item.key, value: item.value }));

    navigator.clipboard.writeText(JSON.stringify(selectedItemsData, null, 2));
    setShowActions(false);
    toast({
      title: "Copied to clipboard",
      description: `${selectedItems.length} items have been copied as JSON`,
      variant: "default",
    });
  };

  // New bulk edit functionality
  const handleOpenBulkEdit = () => {
    const selectedItemsData = items
      .filter(item => selectedItems.includes(item.id))
      .map(item => `${item.key}: ${item.value}`)
      .join('\n');
    
    setBulkEditText(selectedItemsData);
    setShowBulkEditDialog(true);
    setShowActions(false);
  };

  const handleBulkEditSave = () => {
    try {
      const lines = bulkEditText.split('\n').filter(line => line.trim());
      const updatedItems = [...items];
      
      // Process each line and update the corresponding selected item
      selectedItems.forEach((itemId, index) => {
        if (index < lines.length) {
          const line = lines[index];
          let key = '', value = '';
          
          if (line.includes(':')) {
            [key, value] = line.split(':', 2).map(s => s.trim());
          } else if (line.includes('=')) {
            [key, value] = line.split('=', 2).map(s => s.trim());
          } else {
            key = line.trim();
          }
          
          const itemIndex = updatedItems.findIndex(item => item.id === itemId);
          
          if (itemIndex !== -1) {
            updatedItems[itemIndex] = {
              ...updatedItems[itemIndex],
              key,
              value
            };
          }
        }
      });
      
      onChange(updatedItems);
      setShowBulkEditDialog(false);
      toast({
        title: "Bulk edit successful",
        description: `Updated ${Math.min(lines.length, selectedItems.length)} items`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Bulk edit failed",
        description: "Could not process the edited content",
        variant: "destructive",
      });
    }
  };

  // Filter items based on search text
  const filteredItems = filterText
    ? items.filter(item => 
        item.key.toLowerCase().includes(filterText.toLowerCase()) || 
        item.value.toLowerCase().includes(filterText.toLowerCase())
      )
    : items;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          {/* Bulk actions dropdown */}
          {selectedItems.length > 0 && (
            <div className="relative" ref={actionsRef}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setShowActions(!showActions)}
              >
                <span className="mr-1">{selectedItems.length} selected</span>
                <ChevronDown size={12} />
              </Button>

              {showActions && (
                <div className="absolute left-0 top-full mt-1 bg-popover border rounded-md shadow-lg z-10 w-48 py-1 animate-in fade-in-50 zoom-in-95">
                  <button
                    className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
                    onClick={() => handleEnableSelected(true)}
                  >
                    <CheckCircle2 size={14} className="mr-2 text-emerald-500" />
                    Enable selected
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
                    onClick={() => handleEnableSelected(false)}
                  >
                    <EyeOff size={14} className="mr-2 text-amber-500" />
                    Disable selected
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
                    onClick={handleCopySelected}
                  >
                    <Copy size={14} className="mr-2 text-blue-500" />
                    Copy selected
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
                    onClick={handleOpenBulkEdit}
                  >
                    <MoreVertical size={14} className="mr-2 text-indigo-500" />
                    Bulk edit
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button
                    className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-accent text-destructive"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Search filter */}
          <div className="relative">
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Filter..."
              className="w-32 px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary pl-7"
            />
            <Filter size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            {filterText && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setFilterText('')}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkPaste}
            className="text-xs h-7 px-2"
            title="Paste multiple items from clipboard"
          >
            <Clipboard size={12} className="mr-1" /> Bulk Paste
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="text-xs h-7 px-2"
          >
            <Plus size={12} className="mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Table Layout */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-md bg-muted/5">
          {filterText ? (
            <>
              <Filter size={24} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm mb-1">No matching items found</p>
              <p className="text-muted-foreground text-xs mb-4">Try a different search term</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterText('')}
              >
                Clear filter
              </Button>
            </>
          ) : (
            <>
              <Plus size={24} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm mb-1">No items added yet</p>
              <p className="text-muted-foreground text-xs mb-4">Add items manually or paste from clipboard</p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                >
                  <Plus size={14} className="mr-1.5" /> Add Item
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkPaste}
                >
                  <Clipboard size={14} className="mr-1.5" /> Bulk Paste
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="border rounded-t-md bg-muted/30">
            <div className="grid grid-cols-[auto_auto_1fr_1fr_auto] gap-0 items-center">
              <div className="p-2 border-r border-border">
                <div 
                  className="cursor-pointer p-1 hover:bg-accent/50 rounded-sm"
                  onClick={handleToggleSelectAll}
                  title="Select all items"
                >
                  {selectAll ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : (
                    <Square size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="p-2 border-r border-border w-12 text-center">
                <span className="text-xs font-medium text-muted-foreground">Active</span>
              </div>
              <div className="p-2 border-r border-border">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-muted-foreground">{placeholders.key}</span>
                  <ArrowUpDown size={10} className="ml-1 text-muted-foreground/50" />
                </div>
              </div>
              <div className="p-2 border-r border-border">
                <span className="text-xs font-medium text-muted-foreground">{placeholders.value}</span>
              </div>
              <div className="p-2 w-10 text-center">
                <span className="text-xs font-medium text-muted-foreground sr-only">Actions</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div 
            ref={tableBodyRef}
            className="border border-t-0 rounded-b-md max-h-[350px] overflow-y-auto"
            tabIndex={0} // Make the container focusable for keyboard events
          >
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`grid grid-cols-[auto_auto_1fr_1fr_auto] gap-0 items-center border-t border-border first:border-t-0 group
                  ${draggedItemId === item.id ? 'opacity-50' : ''}
                  ${hoveredItemId === item.id ? 'bg-accent/50' : 'hover:bg-accent/30'}
                  ${selectedItems.includes(item.id) ? 'bg-primary/10' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(item.id, e)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={() => handleDrop(item.id)}
                onDragEnd={() => {
                  setDraggedItemId(null);
                  setHoveredItemId(null);
                }}
              >
                <div className="p-2 border-r border-border">
                  <div 
                    className="cursor-pointer p-1 hover:bg-accent/50 rounded-sm"
                    onClick={() => handleToggleSelect(item.id)}
                  >
                    {selectedItems.includes(item.id) ? (
                      <CheckSquare size={14} className="text-primary" />
                    ) : (
                      <Square size={14} className="text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="p-2 border-r border-border text-center">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={e => handleItemChange(item.id, 'enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    aria-label={`Enable ${item.key || 'item'}`}
                  /> </div>
                <div className="p-2 border-r border-border">
                  <input
                    type="text"
                    value={item.key}
                    onChange={e => handleItemChange(item.id, 'key', e.target.value)}
                    placeholder={placeholders.key}
                    className="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
                    list={`key-suggestions-${item.id}`}
                  />
                  {suggestions.keys.length > 0 && (
                    <datalist id={`key-suggestions-${item.id}`}>
                      {suggestions.keys.map((suggestion, i) => (
                        <option key={i} value={suggestion} />
                      ))}
                    </datalist>
                  )}
                </div>
                <div className="p-2 border-r border-border">
                  <input
                    type="text"
                    value={item.value}
                    onChange={e => handleItemChange(item.id, 'value', e.target.value)}
                    placeholder={placeholders.value}
                    className="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
                    list={`value-suggestions-${item.id}`}
                  />
                  {suggestions.values.length > 0 && (
                    <datalist id={`value-suggestions-${item.id}`}>
                      {suggestions.values.map((suggestion, i) => (
                        <option key={i} value={suggestion} />
                      ))}
                    </datalist>
                  )}
                </div>
                <div className="p-2 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${item.key || 'item'}`}
                  >
                    <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="flex justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} • {filteredItems.filter(i => i.enabled).length} enabled
              {filterText && items.length !== filteredItems.length && ` (filtered from ${items.length})`}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="h-7 px-2"
            >
              <Plus size={14} className="mr-1.5" /> Add Item
            </Button>
          </div>
        </>
      )}

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit {selectedItems.length} Items</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Edit items in key: value or key=value format, one per line.
            </p>
            <Textarea
              value={bulkEditText}
              onChange={(e) => setBulkEditText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="key1: value1&#10;key2: value2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
