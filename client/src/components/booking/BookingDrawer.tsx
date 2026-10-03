import React, { useState, useEffect } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { BookingSlot, Member, MembershipPlan } from '../../types';
import { memberApi, membershipApi, bookingApi } from '../../services/api';
import { useToast } from '../ui/Toast';
import { Calendar, Clock, CreditCard, User as UserIcon, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: BookingSlot | null;
  onBookingSuccess: () => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  onBookingSuccess
}) => {
  const { showSuccess, showError } = useToast();
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'tab'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    membershipApi.getPlans().then(setPlans);
  }, []);

  useEffect(() => {
    if (searchMemberQuery.trim().length > 0) {
      memberApi.getMembers(searchMemberQuery).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchMemberQuery]);

  if (!selectedSlot) return null;

  // Calculate pricing based on selected context & active plan benefits
  let basePrice = selectedSlot.price;
  let discountAmount = 0;
  let activePlanName = 'Walk-In';

  if (!isWalkIn && selectedMember) {
    const plan = plans.find(p => p.id === selectedMember.planId) || plans.find(p => p.name === selectedMember.planName);
    if (plan) {
      activePlanName = plan.name;
      discountAmount = Math.round(basePrice * (plan.courtDiscountPercent / 100));
    }
  }

  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleConfirmBooking = async () => {
    if (!isWalkIn && !selectedMember) {
      showError('Please select a member or toggle Walk-In booking.');
      return;
    }

    if (isWalkIn && (!walkInName.trim() || !walkInPhone.trim())) {
      showError('Please enter Walk-In guest name and phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      await bookingApi.createBooking({
        courtId: selectedSlot.courtId,
        courtName: selectedSlot.courtName,
        sport: selectedSlot.sport,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        memberId: isWalkIn ? undefined : selectedMember?.id,
        memberName: isWalkIn ? `${walkInName} (Walk-In)` : selectedMember!.name,
        isWalkIn,
        price: basePrice,
        discount: discountAmount,
        finalPrice,
        paymentMode: finalPrice === 0 ? 'free_plan' : paymentMode
      });

      // Confetti Micro-interaction celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      showSuccess('Booking Confirmed!', `Slot reserved for ${selectedSlot.courtName} at ${selectedSlot.startTime}`);
      onBookingSuccess();
      onClose();
    } catch (err: any) {
      showError('Booking Failed', err.message || 'Slot collision or validation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Court Booking"
      subtitle={`${selectedSlot.courtName} • ${selectedSlot.sport}`}
    >
      <div className="space-y-6">
        {/* Booking Slot Information Box */}
        <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Date: {selectedSlot.date}</span>
            </span>
            <span className="flex items-center gap-1 font-mono font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{selectedSlot.startTime} - {selectedSlot.endTime} (60 mins)</span>
            </span>
          </div>
        </div>

        {/* Member / Walk-in Toggle Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Booking For
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsWalkIn(false)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  !isWalkIn ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:text-foreground'
                }`}
              >
                Registered Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWalkIn(true);
                  setSelectedMember(null);
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  isWalkIn ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:text-foreground'
                }`}
              >
                Walk-In Guest
              </button>
            </div>
          </div>

          {!isWalkIn ? (
            <div className="space-y-2">
              {selectedMember ? (
                <div className="p-3.5 rounded-lg border border-primary/40 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMember.photoUrl}
                      alt={selectedMember.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <div className="text-sm font-bold text-foreground flex items-center gap-2">
                        {selectedMember.name}
                        <Badge variant="accent" size="sm">{selectedMember.planName}</Badge>
                      </div>
                      <div className="text-xs text-text-muted">{selectedMember.memberId} • {selectedMember.phone}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Search member by Name, Phone, ID or QR..."
                    value={searchMemberQuery}
                    onChange={e => setSearchMemberQuery(e.target.value)}
                    leftIcon={<UserIcon className="w-4 h-4" />}
                  />
                  {searchResults.length > 0 && (
                    <div className="border border-border rounded-md divide-y divide-border bg-white max-h-48 overflow-y-auto">
                      {searchResults.map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedMember(m);
                            setSearchMemberQuery('');
                          }}
                          className="p-3 hover:bg-surface flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="text-xs font-bold text-foreground">{m.name}</div>
                            <div className="text-[11px] text-text-muted">{m.memberId} • {m.phone}</div>
                          </div>
                          <Badge variant="success" size="sm">{m.planName}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Guest Name"
                placeholder="e.g. Sunil Gavaskar"
                value={walkInName}
                onChange={e => setWalkInName(e.target.value)}
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={walkInPhone}
                onChange={e => setWalkInPhone(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Pricing Calculation Summary Card */}
        <div className="p-4 rounded-lg bg-surface border border-border space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Fee & Plan Discount Summary
          </div>
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Standard Walk-In Court Rate</span>
            <span className="font-mono">₹{basePrice}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-primary font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activePlanName} Plan Discount</span>
              </span>
              <span className="font-mono">-₹{discountAmount}</span>
            </div>
          )}
          <div className="pt-2 border-t border-border flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Total Payable Amount</span>
            <span className="text-xl font-extrabold text-primary font-mono">
              ₹{finalPrice}
            </span>
          </div>
        </div>

        {/* Payment Mode Selector */}
        {finalPrice > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'upi', label: 'UPI' },
                { id: 'card', label: 'Card' },
                { id: 'cash', label: 'Cash' },
                { id: 'tab', label: 'Tab' }
              ].map(pm => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMode(pm.id as any)}
                  className={`py-2 px-3 rounded-md text-xs font-bold border text-center transition-all ${
                    paymentMode === pm.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-text-secondary hover:border-border-strong'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <Button variant="secondary" className="w-1/3" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="w-2/3"
            isLoading={isSubmitting}
            onClick={handleConfirmBooking}
          >
            Confirm & Reserve Slot
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
