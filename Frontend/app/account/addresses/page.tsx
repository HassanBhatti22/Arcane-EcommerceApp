"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Pencil, Trash2, Home, Briefcase, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface Address {
  _id?: string;
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string; // Backend uses postalCode
  postal?: string;    // Frontend UI might use postal
  country: string;
  phone: string;
  type: string; // home, office
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, reloadUser } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    type: 'home',
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.addresses) {
      // Map backend addresses to frontend interface if needed
      setAddresses(user.addresses.map((addr: any) => ({
        ...addr,
        id: addr._id,
        postal: addr.postalCode // Map for UI consistency if needed
      })));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/auth/address/${editingId}`, formData);
      } else {
        await api.post('/auth/address', formData);
      }
      await reloadUser();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        type: 'home',
        isDefault: false
      });
    } catch (error) {
      console.error('Failed to save address', error);
      alert('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id || address._id || null);
    setFormData({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode || address.postal,
      country: address.country,
      type: address.type,
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const removeAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/auth/address/${id}`);
      await reloadUser();
    } catch (error) {
      console.error('Failed to delete address', error);
    }
  };

  const setDefault = async (id: string) => {
    try {
      const address = addresses.find(a => a.id === id);
      if (address) {
        await api.put(`/auth/address/${id}`, { ...address, isDefault: true, postalCode: address.postal || address.postalCode });
        await reloadUser();
      }
    } catch (error) {
      console.error("Failed to set default", error);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
            Addresses
          </h1>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              phone: '',
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
              type: 'home',
              isDefault: false
            });
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm && !editingId ? "Cancel" : "Add New"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-8 p-6 border border-foreground animate-fade-in">
          <h3 className="font-display font-bold text-lg mb-5">
            {editingId ? "Edit Address" : "New Address"}
          </h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                placeholder="123 Main Street, Apt 4B"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="10001"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="United States"
                />
              </div>
            </div>
            {/* Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Address Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleTypeChange('home')}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-bold border ${formData.type === 'home' ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground text-muted-foreground'}`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => handleTypeChange('office')}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-bold border ${formData.type === 'office' ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground text-muted-foreground'}`}
                >
                  <Briefcase className="w-4 h-4" />
                  Office
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Address'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-border text-xs font-bold uppercase tracking-wider hover:border-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`relative p-6 border transition-colors ${address.isDefault
              ? "border-foreground"
              : "border-border hover:border-foreground/50"
              }`}
          >
            {/* Default Badge */}
            {address.isDefault && (
              <span className="absolute top-0 right-0 flex items-center gap-1 px-3 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
                <Check className="w-3 h-3" />
                Default
              </span>
            )}

            <div className="flex items-center gap-2 mb-3">
              {address.type === "home" ? (
                <Home className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-bold uppercase tracking-wider">
                {address.type}
              </span>
            </div>

            <p className="font-bold text-sm mb-1">{address.name}</p>
            <p className="text-sm text-muted-foreground">{address.street}</p>
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.state} {address.postalCode || address.postal}
            </p>
            <p className="text-sm text-muted-foreground">{address.country}</p>
            <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              {!address.isDefault && (
                <button
                  onClick={() => setDefault(address.id!)}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleEdit(address)}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
              {!address.isDefault && (
                <button
                  onClick={() => removeAddress(address.id!)}
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-destructive hover:text-destructive/80 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-bold text-lg mb-1">
            No addresses saved
          </p>
          <p className="text-sm text-muted-foreground">
            Add an address to speed up checkout.
          </p>
        </div>
      )}
    </div>
  );
}
